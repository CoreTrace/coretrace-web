import React from 'react';
import { useWasm } from '../hooks/useWasm';
import { useEditor } from '../contexts/EditorContext';

const Toolbar = () => {
  const { isLoaded, isLoading, runStaticAudit, runDynamicAudit } = useWasm();
  const { isAnalyzing } = useEditor();

  const handleNewFile = () => {
    if (window.confirm('Create a new file? Unsaved changes will be lost.')) {
      window.location.reload();
    }
  };

  return (
    <div className="flex items-center h-12 bg-editor-toolbar px-4 border-b border-gray-700">
      <div className="flex items-center space-x-4">
        <button
          className="btn btn-secondary text-sm"
          onClick={handleNewFile}
        >
          New File
        </button>

        <div className="h-6 w-px bg-gray-700"></div>

        <button
          className="btn btn-primary text-sm"
          onClick={runStaticAudit}
          disabled={!isLoaded || isAnalyzing}
        >
          {isAnalyzing ? 'Analyzing...' : 'Static Analysis'}
        </button>

        <button
          className="btn btn-primary text-sm"
          onClick={runDynamicAudit}
          disabled={!isLoaded || isAnalyzing}
        >
          {isAnalyzing ? 'Analyzing...' : 'Dynamic Analysis'}
        </button>
      </div>

      <div className="ml-auto flex items-center">
        {isLoading && (
          <div className="text-sm text-gray-400 mr-2">Loading CoreTrace...</div>
        )}
        <div className={`h-3 w-3 rounded-full ${isLoaded ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="text-xs text-gray-400 ml-2">
          {isLoaded ? 'CoreTrace Ready' : 'CoreTrace Not Loaded'}
        </span>
      </div>
    </div>
  );
};

export default Toolbar;
