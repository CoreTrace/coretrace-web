/**
 * @module App
 * @description Main application component for the CoreTrace web interface.
 * Provides a code editor with analysis capabilities and results display.
 */

import React, { useState, useEffect } from 'react';
import CodeEditorPane from './components/Editor/CodeEditorPane';
import ResultsPane from './components/Editor/ResultsPane';
import { analyzeCode as analyzeCodeAPI, getAvailableTools } from './services/api/api';

/**
 * @component App
 * @description The main application component that renders the code editor and results pane.
 * Manages the state for the code editor, analysis results, available tools, and user options.
 * 
 * @returns {JSX.Element} The rendered App component with code editor and results pane
 * 
 * @example
 * <App />
 */
function App() {
  /**
   * @type {string}
   * @description The code entered by the user in the editor
   */
  const [code, setCode] = useState('// Write your code here\n#include <iostream>\n\nint main(void)\n{\n  printf("Hello, World !\\n");\n  return 0;\n}');

  /**
   * @type {Object|null}
   * @description The results of the code analysis or null if no analysis has been performed
   */
  const [results, setResults] = useState(null);

  /**
   * @type {boolean}
   * @description Indicates whether the code analysis is in progress
   */
  const [loading, setLoading] = useState(false);

  /**
   * @type {number}
   * @description The percentage width of the left pane (code editor)
   */
  let dividerPosition = 50;

  /**
   * @type {string}
   * @description The name of the file being analyzed
   */
  const [filename, setFilename] = useState('main.cpp');

  /**
   * @type {Object}
   * @description The user-selected options for code analysis
   * @property {boolean} static - Enable static analysis
   * @property {boolean} dynamic - Enable dynamic analysis
   * @property {Array<string>} tools - Selected tools for analysis
   */
  const [options, setOptions] = useState({
    static: true,
    dynamic: false,
    tools: [],
  });

  /**
   * @type {Object}
   * @description The list of tools available for analysis
   * @property {Array<string>} tools - Array of available tool names
   */
  const [availableTools, setAvailableTools] = useState({
    tools: [],
  });

  /**
   * @effect
   * @description Fetches the list of available tools when the component mounts
   * and updates the state accordingly. Sets default options to include all tools.
   */
  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await getAvailableTools();
        const tools = response.tools; // Access the tools array
        // Default to all tools
        setAvailableTools((prev) => ({ ...prev, tools: tools.map(tool => tool) }));
        setOptions((prev) => ({ ...prev, tools: tools.map(tool => tool) }));
      } catch (error) {
        console.error('Error fetching tools:', error);
      }
    };

    fetchTools();
  }, []);

  /**
   * @function handleOptionChange
   * @description Toggles a boolean option (e.g., static or dynamic analysis)
   * @param {string} option - The name of the option to toggle
   */
  const handleOptionChange = (option) => {
    setOptions((prev) => ({ ...prev, [option]: !prev[option] }));
  };

  /**
   * @function handleToolToggle
   * @description Toggles the inclusion of a specific tool in the analysis options
   * @param {string} tool - The name of the tool to toggle
   */
  const handleToolToggle = (tool) => {
    setOptions((prev) => ({
      ...prev,
      tools: prev.tools.includes(tool)
        ? prev.tools.filter((t) => t !== tool)
        : [...prev.tools, tool],
    }));
  };

  /**
   * @function handleAnalyzeCode
   * @description Initiates the code analysis process by calling the API
   * and updates the results state with the analysis findings
   */
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
        filename={filename}
        setFilename={setFilename}
      />
      {/* <Divider handleMouseDown={handleMouseDown} /> */}
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