import React, { useState, useEffect } from 'react';
import CodeEditorPane from './components/Editor/CodeEditorPane';
import ResultsPane from './components/Editor/ResultsPane';
import { analyzeCode as analyzeCodeAPI, getAvailableTools } from './services/api/api';

/**
 * The main application component that renders the code editor and results pane.
 * It manages the state for the code editor, analysis results, available tools, and user options.
 *
 * @component
 * @returns {JSX.Element} The rendered App component.
 *
 * @example
 * <App />
 *
 * @state {string} code - The code entered by the user in the editor.
 * @state {object|null} results - The results of the code analysis or null if no analysis has been performed.
 * @state {boolean} loading - Indicates whether the code analysis is in progress.
 * @state {number} dividerPosition - The percentage width of the left pane (code editor).
 * @state {string} filename - The name of the file being analyzed.
 * @state {object} options - The user-selected options for code analysis, including static/dynamic analysis and selected tools.
 * @state {object} availableTools - The list of tools available for analysis.
 *
 * @effect Fetches the list of available tools when the component mounts and updates the state accordingly.
 *
 * @function handleOptionChange - Toggles a boolean option (e.g., static or dynamic analysis).
 * @param {string} option - The name of the option to toggle.
 *
 * @function handleToolToggle - Toggles the inclusion of a specific tool in the analysis options.
 * @param {string} tool - The name of the tool to toggle.
 *
 * @function handleAnalyzeCode - Initiates the code analysis process by calling an API and updates the results state.
 */
function App() {
  const [code, setCode] = useState('// Write your code here\n#include <iostream>\n\nint main(void)\n{\n  std::cout << "Hello, World !" << std::endl;\n  return 0;\n}');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dividerPosition, setDividerPosition] = useState(50); // Percentage width of the left pane
  const [filename, setFilename] = useState('main.cpp');
  const [options, setOptions] = useState({
    static: true,
    dynamic: false,
    tools: [],
  });

  const [availableTools, setAvailableTools] = useState({
    tools: [],
  });

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await getAvailableTools();
        const tools = response.tools;
        setAvailableTools((prev) => ({ ...prev, tools: tools.map(tool => tool) }));
        setOptions((prev) => ({ ...prev, tools: tools.map(tool => tool) }));
      } catch (error) {
        console.error('Error fetching tools:', error);
      }
    };

    fetchTools();
  }, []);

  const handleOptionChange = (option) => {
    setOptions((prev) => ({ ...prev, [option]: !prev[option] }));
  };

  const handleToolToggle = (tool) => {
    setOptions((prev) => ({
      ...prev,
      tools: prev.tools.includes(tool)
        ? prev.tools.filter((t) => t !== tool)
        : [...prev.tools, tool],
    }));
  };

  const handleAnalyzeCode = async () => {
    try {
      setLoading(true);
      setResults(null);

      const result = await analyzeCodeAPI(filename, code, options);
      setResults(result);
    } catch (error) {
      console.error('Error analyzing code:', error);
      setResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <CodeEditorPane
        code={code}
        setCode={setCode}
        dividerPosition={dividerPosition}
      />
      {availableTools.tools.length > 0 ? (
        <ResultsPane
          results={results}
          loading={loading}
          filename={filename}
          setFilename={setFilename}
          options={options}
          availableTools={availableTools}
          handleOptionChange={handleOptionChange}
          handleToolToggle={handleToolToggle}
          analyzeCode={handleAnalyzeCode}
          dividerPosition={dividerPosition}
        />
      ) : (
        <div className="flex items-center justify-center w-full">
          <p>Loading tools...</p>
        </div>
      )}
    </div>
  );
}

export default App;