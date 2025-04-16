import React from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useEditor } from '../contexts/EditorContext';
import { useEditorConfig } from '../hooks/useEditorConfig';

const CodeEditor = () => {
  const { setEditor } = useEditor();
  const { onEditorDidMount } = useEditorConfig();

  const handleEditorDidMount = (editor) => {
    setEditor(editor);
    onEditorDidMount(editor);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
    {/*<div className="h-full w-full overflow-hidden border-2 border-blue-500 rounded-md shadow-lg"> */}
      <MonacoEditor
        height="100%"
        language="cpp"
        theme="vs-dark"
        options={{
          automaticLayout: true,
          scrollBeyondLastLine: false,
          minimap: { enabled: true },
          fontSize: 14,
          tabSize: 2,
          wordWrap: 'on',
          lineNumbers: 'on',
          renderLineHighlight: 'all',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: true,
        }}
        onMount={handleEditorDidMount}
      />
    </div>
  );
};

export default CodeEditor;
