// import React from 'react';

// function ResultsDisplay({ results, loading }) {
//   return (
//     <div className="results-container">
//       <h2>Analysis Results</h2>
//       {loading && <div className="loading">Analyzing your code...</div>}

//       {results && !results.error && (
//         <div className="results-content">
//           {results.report ? (
//             <pre className="report">{results.report}</pre>
//           ) : (
//             <div>
//               <h3>Output:</h3>
//               <pre>{results.stdout}</pre>

//               {results.stderr && (
//                 <>
//                   <h3>Errors:</h3>
//                   <pre className="error">{results.stderr}</pre>
//                 </>
//               )}
//             </div>
//           )}
//         </div>
//       )}

//       {results && results.error && (
//         <div className="error-message">
//           <h3>Error:</h3>
//           <p>{results.error}</p>
//         </div>
//       )}
//     </div>
//   );
// }

// export default ResultsDisplay;

import React from 'react';
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
              <h3 className="text-lg font-medium mb-2">Output:</h3>
              <pre className="bg-gray-800 p-4 rounded-md overflow-x-auto text-sm">
                {results.stdout}
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