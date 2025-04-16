import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { jumpToLocation } from '../services/coreTraceAPI';

const ResultsPanel = () => {
  const { analysisResults, editor, isAnalyzing } = useEditor();

  const handleResultClick = (line, column) => {
    jumpToLocation(editor, line, column);
  };

  const getIconByType = (type) => {
    switch (type) {
      case 'error':
        return '⛔';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '•';
    }
  };

  return (
    <div className="h-full overflow-hidden flex flex-col bg-editor-sidebar">
      <div className="panel-header flex items-center justify-between">
        <span>Analysis Results</span>
        <span className="text-xs">
          {isAnalyzing ? 'Analyzing...' :
            `${analysisResults.length} issues found`}
        </span>
      </div>

      <div className="overflow-auto flex-grow">
        {isAnalyzing ? (
          <div className="p-4 text-center text-gray-400">
            Running analysis...
          </div>
        ) : analysisResults.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            No issues found. Run an analysis to see results.
          </div>
        ) : (
          <ul className="divide-y divide-gray-700">
            {analysisResults.map((result, index) => (
              <li
                key={index}
                className="p-2 hover:bg-gray-800 cursor-pointer"
                onClick={() => handleResultClick(result.line, result.column)}
              >
                <div className="flex items-start">
                  <span className="mr-2 mt-1">{getIconByType(result.type)}</span>
                  <div>
                    <div className="text-sm font-medium">{result.message}</div>
                    <div className="text-xs text-gray-400">
                      Line {result.line}, Column {result.column}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ResultsPanel;
