/**
 * @module CodeEditor
 * @description Monaco Editor wrapper component for code editing functionality.
 * Provides a rich code editing experience with syntax highlighting and IntelliSense.
 */

import React, { Editor } from "@monaco-editor/react";

/**
 * @component CodeEditor
 * @description A wrapper component for the Monaco Editor with default C++ configuration
 * @returns {JSX.Element} Monaco Editor component with dark theme and C++ language support
 * 
 * @example
 * <CodeEditor />
 */
export default function CodeEditor() {
  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        defaultLanguage="cpp"
        defaultValue="// Hello world"
        theme="vs-dark"
      />
    </div>
  );
}
