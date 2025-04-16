import React, { createContext, useContext, useState } from 'react';

const defaultEditorState = {
  code: '// Write your C/C++ code here\n#include <iostream>\n\nint main() {\n  std::cout << "Hello, CoreTrace!" << std::endl;\n  return 0;\n}',
  setCode: () => {},
  editor: null,
  setEditor: () => {},
  analysisResults: [],
  setAnalysisResults: () => {},
  isAnalyzing: false,
  setIsAnalyzing: () => {},
};

const EditorContext = createContext(defaultEditorState);

export const useEditor = () => useContext(EditorContext);

export const EditorProvider = ({ children }) => {
  const [code, setCode] = useState(defaultEditorState.code);
  const [editor, setEditor] = useState(null);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const value = { 
    code, 
    setCode, 
    editor, 
    setEditor, 
    analysisResults, 
    setAnalysisResults,
    isAnalyzing,
    setIsAnalyzing
  };

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
};
