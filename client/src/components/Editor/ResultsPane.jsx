import React from 'react';
import ResultsDisplay from './Results';
import PropTypes from 'prop-types';

function ResultsPane({
  results,
  loading,
  filename,
  setFilename,
  options,
  availableTools,
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
        availableTools={availableTools}
        handleOptionChange={handleOptionChange}
        handleToolToggle={handleToolToggle}
        analyzeCode={analyzeCode}
      />
    </div>
  );
}

ResultsPane.propTypes = {
  results: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
  loading: PropTypes.bool,
  filename: PropTypes.string,
  setFilename: PropTypes.func,
  options: PropTypes.object,
  availableTools: PropTypes.array,
  handleOptionChange: PropTypes.func,
  handleToolToggle: PropTypes.func,
  analyzeCode: PropTypes.func,
  dividerPosition: PropTypes.number.isRequired,
};

export default ResultsPane;