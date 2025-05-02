import React from 'react';
import ResultsDisplay from './Results';

function ResultsPane({
  results,
  loading,
  filename,
  setFilename,
  options,
  handleOptionChange,
  handleToolToggle,
  analyzeCode,
  dividerPosition,
}) {
  return (
    <div
      className="flex flex-col"
      style={{ width: `${100 - dividerPosition}%` }}
    >
      <div className="bg-gray-800 p-2 border-b border-gray-700">
        <h1 className="text-lg font-bold">CoreTrace Results</h1>
      </div>
      <ResultsDisplay
        results={results}
        loading={loading}
        filename={filename}
        setFilename={setFilename}
        options={options}
        handleOptionChange={handleOptionChange}
        handleToolToggle={handleToolToggle}
        analyzeCode={analyzeCode}
      />
    </div>
  );
}

export default ResultsPane;