import { Editor } from "@monaco-editor/react";

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
