import React from 'react';

function EditorToolbar({
    filename,
    setFilename,
    options,
    availableTools,
    handleOptionChange,
    handleToolToggle,
    analyzeCode,
    loading
}) {
    console.log("options",options);

    return (
        <div className="border-b border-gray-700">
            {/* Main toolbar */}
            <div className="bg-gray-800 px-3 py-2 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <input
                        type="text"
                        value={filename}
                        onChange={(e) => setFilename(e.target.value)}
                        placeholder="main.c"
                        className="px-2 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm w-32"
                    />
                </div>

                <button
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${loading
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500'
                        }`}
                    onClick={analyzeCode}
                    disabled={loading}
                >
                    {loading ? (
                        <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Analyzing...
                        </span>
                    ) : 'Analyze Code'}
                </button>
            </div>

            {/* Settings panel */}
            {(
                <div className="bg-gray-700 px-3 py-2 flex flex-wrap items-center gap-4 text-sm border-t border-gray-600">
                    <div className="flex items-center gap-3 flex-wrap">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={options.static}
                                onChange={() => handleOptionChange('static')}
                                className="h-3 w-3 text-blue-500 focus:ring-blue-500 rounded border-gray-600 bg-gray-800"
                            />
                            <span className="text-gray-300">Static Analysis</span>
                        </label>

                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={options.dynamic}
                                onChange={() => handleOptionChange('dynamic')}
                                className="h-3 w-3 text-blue-500 focus:ring-blue-500 rounded border-gray-600 bg-gray-800"
                            />
                            <span className="text-gray-300">Dynamic Analysis</span>
                        </label>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-gray-300 font-medium">Tools:</span>
                        {availableTools.tools.map(tool => (
                            <label key={tool} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={options.tools.includes(tool)}
                                    onChange={() => handleToolToggle(tool)}
                                    className="h-3 w-3 text-blue-500 focus:ring-blue-500 rounded border-gray-600 bg-gray-800"
                                />
                                <span className="text-gray-300">{tool}</span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default EditorToolbar;