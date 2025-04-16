import React from 'react';
import CodeEditor from './components/CodeEditor';
import Toolbar from './components/Toolbar';
import ResultsPanel from './components/ResultsPanel';
import LoadingIndicator from './components/LoadingIndicator';
import { EditorProvider, useEditor } from './contexts/EditorContext';
import { useWasm } from './hooks/useWasm';

const EditorLayout = () => {
  const { isAnalyzing } = useEditor();
  const { isLoading } = useWasm();

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <Toolbar />
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        <div className="flex-1 overflow-hidden">
          <CodeEditor />
        </div>
        <div className="w-80 bg-gray-800 rounded-md shadow-lg border-l overflow-hidden border-gray-700">
          <ResultsPanel />
        </div>
      </div>
      {(isLoading || isAnalyzing) && (
        <LoadingIndicator message={isLoading ? "Loading CoreTrace..." : "Running analysis..."} />
      )}
    </div>
  );
};

const App = () => {
  return (
    <EditorProvider>
      <EditorLayout />
    </EditorProvider>
  );
};

export default App;
