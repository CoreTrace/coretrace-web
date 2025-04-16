import { useEffect } from 'react';
import { useEditor } from '../contexts/EditorContext';

export function useEditorConfig() {
  const { editor, setCode, code, analysisResults } = useEditor();

  // Update editor options
  useEffect(() => {
    if (!editor) return;

    // Set editor preferences
    editor.updateOptions({
      theme: 'vs-dark',
      fontSize: 14,
      fontFamily: "'Menlo', 'Monaco', 'Consolas', monospace",
      lineNumbers: 'on',
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      formatOnPaste: true,
      formatOnType: true,
      tabSize: 2,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: true,
    });

    // Subscribe to editor content changes
    const disposable = editor.onDidChangeModelContent(() => {
      setCode(editor.getValue());
    });

    return () => {
      disposable.dispose();
    };
  }, [editor, setCode]);

  // Handle displaying analysis results as decorations
  useEffect(() => {
    if (!editor) return;

    const decorations = analysisResults.map(result => {
      // Create a marker type based on the result type
      const className = 
        result.type === 'error' ? 'errorDecoration' :
        result.type === 'warning' ? 'warningDecoration' : 'infoDecoration';

      return {
        range: {
          startLineNumber: result.line,
          startColumn: result.column,
          endLineNumber: result.line,
          endColumn: result.column + 1
        },
        options: {
          isWholeLine: true,
          className,
          glyphMarginClassName: `${result.type}Glyph`,
          hoverMessage: { value: result.message },
          overviewRuler: {
            color: result.type === 'error' ? '#f14c4c' : 
                  result.type === 'warning' ? '#cca700' : '#3794ff',
            position: 1 // Monaco editor OverviewRulerLane.Full
          }
        }
      };
    });

    const oldDecorations = editor.getModel()?.getAllDecorations() || [];
    const oldDecorationIds = oldDecorations
      .filter(d => d.options.className?.endsWith('Decoration'))
      .map(d => d.id);

    editor.getModel()?.deltaDecorations(oldDecorationIds, decorations);
  }, [editor, analysisResults]);

  // Function to set initial content when editor is ready
  const onEditorDidMount = (editor) => {
    editor.setValue(code);
  };

  return { onEditorDidMount };
}
