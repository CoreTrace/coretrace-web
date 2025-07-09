/**
 * @module CodeEditorPane
 * @description Pane component for code editing, file open/save, and filename input.
 */

import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import Editor from '@monaco-editor/react';

/**
 * @component CodeEditorPane
 * @description Pane for code editing, file open/save, and filename input.
 * @param {Object} props - Component props
 * @param {string} props.code - The code to display and edit
 * @param {function} props.setCode - Setter for code value
 * @param {number} props.dividerPosition - Width of the divider (percentage)
 * @param {string} props.filename - Name of the file being edited
 * @param {function} props.setFilename - Setter for filename
 * @returns {JSX.Element} Code editor pane
 */
function CodeEditorPane({ code, setCode, dividerPosition, filename, setFilename }) {
  const fileInputRef = useRef(null);

  /**
   * @function handleOpenClick
   * @description Triggers the file input dialog for opening a file
   */
  const handleOpenClick = () => {
    fileInputRef.current.click();
  };

  /**
   * @function handleFileChange
   * @description Reads the selected file and sets the code content
   * @param {Event} e - File input change event
   */
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

  /**
   * @function handleSaveClick
   * @description Saves the current code to a file with the specified filename
   */
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

CodeEditorPane.propTypes = {
  code: PropTypes.string.isRequired,
  setCode: PropTypes.func.isRequired,
  dividerPosition: PropTypes.number.isRequired,
  setFilename: PropTypes.func.isRequired,
  filename: PropTypes.string,
  results: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object
  ])
};


export default CodeEditorPane;