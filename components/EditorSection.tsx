"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Code2, FileText, Trash2, Copy, Maximize2, X, Check } from "lucide-react";
import { PROBLEMS, DEFAULT_CODE } from "@/types";

interface EditorSectionProps {
  language: string;
  problemKey: string;
  code: string;
  onCodeChange: (v: string) => void;
  isExpanded: boolean;
  onExpand: () => void;
  onCloseExpand: () => void;
  children: ReactNode;
}

const SAMPLES: Record<string, string> = {
  "Design a Rate Limiter": DEFAULT_CODE,
  "Two Sum": `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []
`,
  "Design a RAG System": `class SimpleRAG:
    def __init__(self, documents):
        self.documents = documents
        self.index = self._build_index()

    def _build_index(self):
        # Create simple keyword-based index
        index = {}
        for i, doc in enumerate(self.documents):
            for word in doc.lower().split():
                index.setdefault(word, []).append(i)
        return index

    def retrieve(self, query, top_k=3):
        scores = {}
        for word in query.lower().split():
            for doc_idx in self.index.get(word, []):
                scores[doc_idx] = scores.get(doc_idx, 0) + 1
        ranked = sorted(scores.items(), key=lambda x: -x[1])
        return [self.documents[i] for i, _ in ranked[:top_k]]
`,
  "Build a REST API CRUD": `from flask import Flask, request, jsonify

app = Flask(__name__)
tasks = {}
next_id = 1

@app.route("/tasks", methods=["GET"])
def get_tasks():
    return jsonify(list(tasks.values()))

@app.route("/tasks", methods=["POST"])
def create_task():
    global next_id
    task = {"id": next_id, "title": request.json.get("title", "")}
    tasks[next_id] = task
    next_id += 1
    return jsonify(task), 201

@app.route("/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    if task_id not in tasks:
        return jsonify({"error": "Not found"}), 404
    tasks[task_id]["title"] = request.json.get("title", tasks[task_id]["title"])
    return jsonify(tasks[task_id])

@app.route("/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    if task_id not in tasks:
        return jsonify({"error": "Not found"}), 404
    del tasks[task_id]
    return "", 204
`,
};

const GENERIC_SAMPLES: Record<string, string> = {
  python: `def solve(input_data):
    # Write your solution here
    pass
`,
  javascript: `function solve(input) {
  // Write your solution here
}
`,
  java: `public class Solution {
    public static void solve(int[] input) {
        // Write your solution here
    }
}
`,
  cpp: `#include <vector>
class Solution {
public:
    void solve(std::vector<int>& input) {
        // Write your solution here
    }
};
`,
};

const LANG_LABELS: Record<string, string> = {
  python: "Python",
  javascript: "JavaScript",
  java: "Java",
  cpp: "C++",
};

export function EditorSection({ language, problemKey, code, onCodeChange, isExpanded, onExpand, onCloseExpand, children }: EditorSectionProps) {
  const problem = PROBLEMS[problemKey];
  const isCodeEmpty = !code.trim();
  const expandBtnRef = useRef<HTMLButtonElement>(null);
  const [copied, setCopied] = useState(false);

  const handleUseSample = () => {
    const problemSample = SAMPLES[problem?.title];
    if (problemSample) {
      onCodeChange(problemSample);
    } else {
      onCodeChange(GENERIC_SAMPLES[language] || GENERIC_SAMPLES.python);
    }
  };

  const handleClear = () => {
    onCodeChange("");
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isExpanded]);

  useEffect(() => {
    if (!isExpanded) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onCloseExpand();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isExpanded, onCloseExpand]);

  useEffect(() => {
    if (!isExpanded && expandBtnRef.current) {
      expandBtnRef.current.focus();
    }
  }, [isExpanded]);

  const toolbar = (
    <div className="flex items-center justify-between px-4 py-2 border-b border-[#21262d] bg-bg-card flex-shrink-0">
      <div className="flex items-center gap-2">
        <Code2 className="w-4 h-4 text-accent" />
        <span className="text-sm font-semibold text-[#f0f6fc]">Candidate Code</span>
        <span className="ml-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-accent/10 border border-accent/20 text-accent">
          {LANG_LABELS[language] || language}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        {isCodeEmpty ? (
          <button
            onClick={handleUseSample}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-bg-elevated border border-border text-xs text-muted hover:text-accent hover:border-accent transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Use Sample Code</span>
          </button>
        ) : (
          <>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-bg-elevated border border-border text-xs text-muted hover:text-accent hover:border-accent transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-bg-elevated border border-border text-xs text-muted hover:text-danger hover:border-danger/50 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </>
        )}
        <button
          ref={expandBtnRef}
          onClick={onExpand}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-bg-elevated border border-border text-xs text-muted hover:text-[#f0f6fc] hover:border-accent transition-all"
          title="Expand editor"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Expand</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex flex-col h-full min-h-0 flex-1 w-full">
        {toolbar}

        {/* Editor container */}
        <div className="flex-1 min-h-0 relative bg-bg-primary flex">
          {children}
        </div>
      </div>

      {/* Fullscreen overlay */}
      {isExpanded && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-bg-primary">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-bg-card flex-shrink-0">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-[#f0f6fc]">Candidate Code</span>
              <span className="ml-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-accent/10 border border-accent/20 text-accent">
                {LANG_LABELS[language] || language}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {isCodeEmpty ? (
                <button
                  onClick={handleUseSample}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-bg-elevated border border-border text-xs text-muted hover:text-accent hover:border-accent transition-all"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Use Sample Code</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-bg-elevated border border-border text-xs text-muted hover:text-accent hover:border-accent transition-all"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                  <button
                    onClick={handleClear}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-bg-elevated border border-border text-xs text-muted hover:text-danger hover:border-danger/50 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                </>
              )}
              <button
                onClick={onCloseExpand}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-bg-elevated border border-border text-xs text-muted hover:text-[#f0f6fc] hover:border-accent transition-all"
                title="Close (Esc)"
              >
                <X className="w-3.5 h-3.5" />
                <span>Close</span>
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-0 p-4">
            <div className="h-full w-full rounded-md overflow-hidden border border-border">
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
