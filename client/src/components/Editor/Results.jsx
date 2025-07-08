import React, { useEffect, useMemo, useState, useCallback } from 'react';
import EditorToolbar from './Toolbar';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

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
  const [selectedTool, setSelectedTool] = useState("All");

  // Get tool names from results
  const toolNames = useMemo(() => {
    if (!results || !Array.isArray(results)) return [];
    return results.map(r => r.tool);
  }, [results]);

  const displayOptions = useMemo(() => ["All", ...toolNames], [toolNames]);

  // Get findings for the selected tool
  const getResultsForTool = (tool) => {
    if (!results || !Array.isArray(results)) return [];
    if (tool === "All") {
      // Flatten all results
      return results.flatMap(r =>
        r.results.map(res => ({ ...res, tool: r.tool }))
      );
    }
    const toolObj = results.find(r => r.tool === tool);
    return toolObj ? toolObj.results : [];
  };

  // Reset selected tool if results change
  useEffect(() => {
    if (toolNames.length > 0 && !["All", ...toolNames].includes(selectedTool)) {
      setSelectedTool("All");
    }
  }, [toolNames, selectedTool]);

  // Handle button click for an option
  const handleOptionClick = (option) => {
    setSelectedTool(option);
    if (handleOptionChange) {
      handleOptionChange(option);
    }
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
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Findings:</h3>
            <div className="flex gap-2">
              {displayOptions.map(option => (
                <button
                  key={option}
                  onClick={() => handleOptionClick(option)}
                  className={`px-3 py-1 rounded text-sm ${selectedTool === option
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {getResultsForTool(selectedTool).length === 0 ? (
            <div className="text-gray-400 italic">No findings.</div>
          ) : (
            getResultsForTool(selectedTool).map((res, idx) => (
              <div
                key={idx}
                className="mb-6 p-4 rounded-lg border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg"
              >
                <div className="flex items-center mb-2">
                  {res.tool && selectedTool === "All" && (
                    <span className="inline-block px-2 py-1 mr-2 rounded-full bg-blue-700 text-xs font-bold text-white shadow">
                      {res.tool}
                    </span>
                  )}
                  <span className="font-semibold text-yellow-300 text-base">{res.message}</span>
                </div>
                {res.locations && res.locations.map((loc, lidx) => (
                  <div key={lidx} className="ml-4 text-sm mb-2">
                    <div>
                      <span className="text-gray-400">File:</span>{" "}
                      <span className="text-blue-400 font-mono">{loc.file}</span>
                      {loc.startLine && (
                        <>
                          <span className="text-gray-400 ml-2">Line:</span>{" "}
                          <span className="text-green-400 font-mono">{loc.startLine}</span>
                        </>
                      )}
                    </div>
                    {loc.snippet && (
                      <div className="mt-2">
                        <SyntaxHighlighter
                          language="cpp"
                          style={atomOneDark}
                          customStyle={{
                            padding: "0.5em",
                            borderRadius: "0.5em",
                            fontSize: "0.95em",
                            background: "#23272e"
                          }}
                        >
                          {loc.snippet}
                        </SyntaxHighlighter>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))
          )}

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