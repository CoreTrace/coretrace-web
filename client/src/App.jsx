import React, { useState } from 'react';
import CodeEditorPane from './components/Editor/CodeEditorPane';
import ResultsPane from './components/Editor/ResultsPane';
import Divider from './components/Editor/Divider';
import { analyzeCode as analyzeCodeAPI } from './services/api/api';

function App() {
  const [code, setCode] = useState('// Write your code here\n#include <stdio.h>\n\nint main() {\n  printf("Hello, World!\\n");\n  return 0;\n}');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dividerPosition, setDividerPosition] = useState(50); // Percentage width of the left pane
  const [filename, setFilename] = useState('main.c');
  const [options, setOptions] = useState({
    static: true,
    dynamic: false,
    tools: ['cppcheck', 'flawfinder'],
  });

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

  const handleMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newDividerPosition = Math.min(
        Math.max(dividerPosition + (deltaX / window.innerWidth) * 100, 20),
        80
      );
      setDividerPosition(newDividerPosition);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <CodeEditorPane
        code={code}
        setCode={setCode}
        dividerPosition={dividerPosition}
      />
      <Divider handleMouseDown={handleMouseDown} />
      <ResultsPane
        results={results}
        loading={loading}
        filename={filename}
        setFilename={setFilename}
        options={options}
        handleOptionChange={handleOptionChange}
        handleToolToggle={handleToolToggle}
        analyzeCode={handleAnalyzeCode}
        dividerPosition={dividerPosition}
      />
    </div>
  );
}

export default App;