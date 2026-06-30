"use client";

import { useState, useEffect } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";

interface MonacoEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
}

export function MonacoEditor({ language, value, onChange }: MonacoEditorProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      import("@monaco-editor/react"),
      import("monaco-editor")
    ]).then(([ { loader }, monaco ]) => {
      if (!cancelled) {
        loader.config({ monaco: monaco.default || monaco });
        setReady(true);
      }
    }).catch((err) => {
      console.error("Failed to load local Monaco:", err);
      if (!cancelled) {
        setReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleMount: OnMount = (_editor, monaco) => {
    monaco.editor.defineTheme("github-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "8b949e", fontStyle: "italic" },
        { token: "keyword", foreground: "ff7b72" },
        { token: "string", foreground: "a5d6ff" },
        { token: "number", foreground: "79c0ff" },
        { token: "type", foreground: "79c0ff" },
        { token: "function", foreground: "d2a8ff" },
        { token: "variable", foreground: "f0f6fc" },
      ],
      colors: {
        "editor.background": "#0d1117",
        "editor.foreground": "#f0f6fc",
        "editorLineNumber.foreground": "#484f58",
        "editorLineNumber.activeForeground": "#8b949e",
        "editor.selectionBackground": "#264f78",
        "editor.lineHighlightBackground": "#161b22",
        "editorCursor.foreground": "#58a6ff",
        "editorIndentGuide.background": "#21262d",
        "editorIndentGuide.activeBackground": "#30363d",
        "editorWidget.background": "#161b22",
        "editorWidget.border": "#30363d",
        "editorSuggestWidget.background": "#161b22",
        "editorSuggestWidget.border": "#30363d",
        "editorSuggestWidget.selectedBackground": "#1c2128",
        "scrollbarSlider.background": "#30363d80",
        "scrollbarSlider.hoverBackground": "#484f58",
      },
    });
    monaco.editor.setTheme("github-dark");
  };

  if (!ready) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-muted text-sm">
        <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        <span>Loading code editor…</span>
      </div>
    );
  }

  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      onChange={(val) => onChange(val || "")}
      theme="vs-dark"
      onMount={handleMount}
      loading={
        <div className="flex flex-col items-center justify-center h-full gap-2 text-muted text-sm">
          <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
          <span>Loading code editor…</span>
        </div>
      }
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineHeight: 22,
        tabSize: 4,
        fontFamily: "'Fira Code', 'Cascadia Code', ui-monospace, monospace",
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        padding: { top: 12, bottom: 12 },
        automaticLayout: true,
        bracketPairColorization: { enabled: true },
        autoIndent: "full",
        wordWrap: "off",
      }}
    />
  );
}
