import React, { useState } from 'react';
import Editor from '@monaco-editor/react';

function CodeEditor({
    code,
    setCode,
    filename,
    setFilename,
    options,
    handleOptionChange,
    handleToolToggle,
    analyzeCode,
    loading,
    results
}) {
    const [isResultsCollapsed, setIsResultsCollapsed] = useState(false);

    return (
        <div className="flex h-screen w-screen bg-gray-900">
            {/* Editor takes up left half of screen */}
            <div className="w-1/2 h-full">
                <h2 className="text-xl font-semibold">Editor</h2>
                <Editor
                    height="100%"
                    width="100%"
                    language="cpp"
                    theme="vs-dark"
                    value={code}
                    onChange={(value) => setCode(value)}
                    options={{
                        fontSize: 14,
                        minimap: { enabled: false },
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        lineNumbers: 'on',
                        wordWrap: 'on',
                        wrappingIndent: 'same'
                    }}
                />
            </div>

            {/* Right half for results panel */}
            <div className="w-1/2 h-full bg-gray-800 text-white p-4 overflow-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Results</h2>
                </div>

                {!isResultsCollapsed && (
                    <div className="results-panel">
                        {loading ? (
                            <div className="flex justify-center items-center h-32">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : results ? (
                            <pre className="whitespace-pre-wrap font-mono text-sm">
                                {typeof results === 'object' ? JSON.stringify(results, null, 2) : results}
                            </pre>
                        ) : (
                            <div className="text-gray-400 text-center py-8">
                                No results to display. Run analysis to see output.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CodeEditor;