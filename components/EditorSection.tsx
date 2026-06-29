"use client";

import type { ReactNode } from "react";
import { Code2, FileText, Trash2 } from "lucide-react";
import { PROBLEMS, DEFAULT_CODE } from "@/types";

interface EditorSectionProps {
  language: string;
  problemKey: string;
  code: string;
  onCodeChange: (v: string) => void;
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

export function EditorSection({ language, problemKey, code, onCodeChange, children }: EditorSectionProps) {
  const problem = PROBLEMS[problemKey];
  const isCodeEmpty = !code.trim();

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

  return (
    <div className="flex flex-col h-full min-h-0 flex-1 w-full">
      {/* Section header */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-[#21262d] bg-bg-card flex-shrink-0">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-accent" />
          <span className="text-sm font-semibold text-[#f0f6fc]">Candidate Code</span>
        </div>
        <div className="flex items-center gap-2">
          {isCodeEmpty ? (
            <button
              onClick={handleUseSample}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-bg-elevated border border-border text-xs text-muted hover:text-accent hover:border-accent transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Use Sample Code</span>
            </button>
          ) : (
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-bg-elevated border border-border text-xs text-muted hover:text-danger hover:border-danger/50 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Code</span>
            </button>
          )}
        </div>
      </div>

      {/* Helper text */}
      <div className="px-5 py-1.5 bg-bg-elevated/20 border-b border-[#21262d] flex-shrink-0">
        <p className="text-xs text-muted leading-relaxed">
          Paste the candidate's solution below. The AI agent will analyze correctness, complexity, edge cases, and code quality.
        </p>
      </div>

      {/* Editor container */}
      <div className="flex-1 min-h-0 relative bg-bg-primary flex">
        {isCodeEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="text-center">
              <Code2 className="w-10 h-10 text-muted/30 mx-auto mb-2" />
              <p className="text-sm text-muted/60">
                Paste candidate code here or use sample code
              </p>
            </div>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
