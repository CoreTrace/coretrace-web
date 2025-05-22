import React, { useEffect, useMemo, useState } from 'react';
import EditorToolbar from './Toolbar';

function ResultsDisplay({
  results,
  loading,
  filename,
  availableTools,
  setFilename,
  options,
  handleOptionChange,
  handleToolToggle,
  analyzeCode,
}) {
  // Set default selected option to "All" or first tool if available
  const [selectedOption, setSelectedOption] = useState("All");
  // Track which tools were active during the last analysis
  const [activeTools, setActiveTools] = useState([]);

  // Update activeTools ONLY when new results come in
  useEffect(() => {
    if (results && !results.error) {
      setActiveTools([...options.tools]);
    }
  }, [results]); // Remove options.tools from dependencies

  // Parse the stdout string to separate content by tool
  const parseOutputByTool = (stdout) => {
    if (!stdout) return {};

    const toolOutputs = {};
    // Use activeTools instead of options.tools
    const toolNames = activeTools.length > 0 ? activeTools : [''];

    // Initialize with an "All" category that contains everything
    toolOutputs['All'] = stdout;

    // For each tool, extract relevant sections
    toolNames.forEach(tool => {
      const regex = new RegExp(`(Invoke tool: ${tool}|Running ${tool} on.*?)(?=(Invoke tool:|Running |$))`, 'gs');
      const matches = [...stdout.matchAll(regex)];

      if (matches.length > 0) {
        // Combine all matching sections for this tool
        toolOutputs[tool] = matches.map(match => match[0]).join('\n\n');
      }
    });

    return toolOutputs;
  };

  // Parse the stdout and memoize the result to avoid unnecessary re-parsing
  const parsedOutputs = useMemo(() => {
    if (!results || !results.stdout) return {};
    return parseOutputByTool(results.stdout);
  }, [results, activeTools]);

  // Update selectedOption when activeTools change or when component mounts
  useEffect(() => {
    if (activeTools.length > 0 && !['All', ...activeTools].includes(selectedOption)) {
      setSelectedOption('All');
    }
  }, [activeTools, selectedOption]);

  // If availableTools contains actual tools, use those to determine available options
  const displayOptions = useMemo(() => {
    if (!activeTools || activeTools.length === 0) {
      return ['All'];
    }
    // Show only the tools that were active during the last analysis
    return ['All', ...activeTools];
  }, [activeTools]);

  // Handle button click for an option
  const handleOptionClick = (option) => {
    setSelectedOption(option);
    if (handleOptionChange) {
      handleOptionChange(option);
    }
  };

  // Get the output related to the selected option - now returns a string, not an object
  const getOutputForOption = () => {
    if (!results || !parsedOutputs || !selectedOption) return '';
    return parsedOutputs[selectedOption] || '';
  };

  return (
    <div className="flex-1 bg-gray-900 p-4 overflow-y-auto">
      {/* Toolbar at the top of the results panel */}
      <EditorToolbar
        filename={filename}
        setFilename={setFilename}
        options={options}
        handleOptionChange={handleOptionChange}
        handleToolToggle={handleToolToggle}
        analyzeCode={analyzeCode}
        loading={loading}
        availableTools={availableTools}
      />

      {/* Results content */}
      {loading && (
        <div className="text-center text-gray-400 mt-4">Analyzing your code...</div>
      )}
      {results && !results.error && (
        <div className="mt-4">
          {results.report ? (
            <pre className="bg-gray-800 p-4 rounded-md overflow-x-auto text-sm">
              {results.report}
            </pre>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Output:</h3>
                <div className="flex gap-2">
                  {displayOptions.map(option => (
                    <button
                      key={option}
                      onClick={() => handleOptionClick(option)}
                      className={`px-3 py-1 rounded text-sm ${selectedOption === option
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <pre className="bg-gray-800 p-4 rounded-md overflow-x-auto text-sm">
                {getOutputForOption()}
              </pre>

              {results.stderr && (
                <>
                  <h3 className="text-lg font-medium mt-4 mb-2">Errors:</h3>
                  <pre className="bg-red-800 p-4 rounded-md overflow-x-auto text-sm text-red-400">
                    {results.stderr}
                  </pre>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {results && results.error && (
        <div className="bg-red-900 p-4 rounded-md text-red-400 mt-4">
          <h3 className="text-lg font-medium">Error:</h3>
          <p>{results.error}</p>
        </div>
      )}
    </div>
  );
}

export default ResultsDisplay;