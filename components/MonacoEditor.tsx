"use client";

import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";

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

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-full text-muted text-sm">
        Initializing local editor…
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
      loading={
        <div className="flex items-center justify-center h-full text-muted text-sm">
          Loading editor interface...
        </div>
      }
      options={{
        minimap: { enabled: false },
        fontSize: 13,
        lineHeight: 1.5,
        fontFamily: "'Fira Code', 'Cascadia Code', ui-monospace, monospace",
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        padding: { top: 16, bottom: 16 },
        automaticLayout: true,
      }}
    />
  );
}
