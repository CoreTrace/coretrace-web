/**
 * @module ResultsPane
 * @description Container for displaying the results panel and findings.
 */

import React from 'react';
import ResultsDisplay from './Results';
import PropTypes from 'prop-types';

/**
 * @component ResultsPane
 * @description Container for the results panel, including findings and errors.
 * @param {Object} props - Component props
 * @param {Array|Object} props.results - Analysis results or error object
 * @param {boolean} props.loading - Loading state
 * @param {string} props.filename - Name of the analyzed file
 * @param {function} props.setFilename - Setter for filename
 * @param {Object} props.options - Analysis options
 * @param {Array} props.availableTools - List of available tools
 * @param {function} props.handleOptionChange - Handler for toggling options
 * @param {function} props.handleToolToggle - Handler for toggling tools
 * @param {function} props.analyzeCode - Handler to trigger analysis
 * @param {number} props.dividerPosition - Width of the divider (percentage)
 * @returns {JSX.Element} Results pane container
 */
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