import React from 'react';
import Editor from '@monaco-editor/react';

function CodeEditorPane({ code, setCode, dividerPosition }) {
  return (
    <div
      className="flex flex-col border-r border-gray-700"
      style={{ width: `${dividerPosition}%` }}
    >
      <div className="bg-gray-800 p-2 border-b border-gray-700">
        <h1 className="text-lg font-bold">CoreTrace</h1>
      </div>
      <Editor
        height="100%"
        defaultLanguage="cpp"
        value={code}
        onChange={(value) => setCode(value)}
        theme="vs-dark"
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          automaticLayout: true,
        }}
      />
    </div>
  );
}

export default CodeEditorPane;