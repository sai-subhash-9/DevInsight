import Editor from '@monaco-editor/react';

const CodeEditor = ({ code, language, onChange, readOnly = false }) => {
  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-dark-400/20">
      <Editor
        height="100%"
        language={language || 'javascript'}
        value={code}
        onChange={onChange}
        theme="vs-dark"
        options={{
          readOnly,
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 },
          lineNumbers: 'on',
          renderLineHighlight: 'line',
          bracketPairColorization: { enabled: true },
          automaticLayout: true,
          wordWrap: 'on',
          tabSize: 2,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on'
        }}
        loading={
          <div className="h-full flex items-center justify-center bg-dark-800">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        }
      />
    </div>
  );
};

export default CodeEditor;
