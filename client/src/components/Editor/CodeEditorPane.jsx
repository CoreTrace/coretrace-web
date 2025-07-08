import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';

function CodeEditorPane({ code, setCode, dividerPosition, filename, setFilename }) {
  const fileInputRef = useRef(null);

  // Open file handler
  const handleOpenClick = () => {
    fileInputRef.current.click();
  };

  // Read file and set code
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.name.endsWith('.c') || file.name.endsWith('.cpp'))) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCode(event.target.result);
      };
      reader.readAsText(file);
    } else {
      alert('Please select a .c or .cpp file.');
    }
    e.target.value = '';
  };

  // Save file handler
  const handleSaveClick = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'main.cpp';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="flex flex-col border-r border-gray-700"
      style={{ width: `${dividerPosition}%` }}
    >
      <div className="bg-gray-800 p-2 border-b border-gray-700 flex items-center justify-between">
        <h1 className="text-lg font-bold">CoreTrace</h1>
        <div className="flex gap-2 items-center">
          <button
            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
            onClick={handleOpenClick}
            type="button"
          >
            Open File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".c,.cpp"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <input
            type="text"
            value={filename}
            onChange={e => setFilename(e.target.value)}
            placeholder="main.cpp"
            className="px-2 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm w-32"
            style={{ minWidth: '100px' }}
          />
          <button
            className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
            onClick={handleSaveClick}
            type="button"
          >
            Save File
          </button>
        </div>
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