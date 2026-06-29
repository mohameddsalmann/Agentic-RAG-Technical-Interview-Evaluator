"use client";

import {
  FileCode, Database, Search, CheckCircle, Zap,
  Shield, FileText, GitBranch, AlertTriangle, ClipboardCheck,
} from "lucide-react";

const NODES = [
  { icon: FileCode, label: "Input Validation", desc: "Validate code, detect language, verify problem & role" },
  { icon: GitBranch, label: "Code Parsing", desc: "Static AST analysis — extract functions, classes, logic" },
  { icon: Database, label: "RAG Retrieval", desc: "Vector search over rubrics, expected solutions, guidelines" },
  { icon: CheckCircle, label: "Correctness Eval", desc: "Compare against expected approach, identify missing logic" },
  { icon: Zap, label: "Complexity Analysis", desc: "Estimate time & space complexity with reasoning" },
  { icon: AlertTriangle, label: "Edge Case Detection", desc: "Find missed edge cases vs rubric expectations" },
  { icon: FileText, label: "Code Quality", desc: "Readability, naming, modularity, error handling, security" },
  { icon: Shield, label: "Bias Mitigation", desc: "Ensure feedback is technical-only, no personal inferences" },
  { icon: ClipboardCheck, label: "Scoring", desc: "Weighted scores across 6 dimensions" },
  { icon: Search, label: "Recommendation", desc: "Evidence-based hire/no-hire with human review" },
  { icon: FileText, label: "Report Generation", desc: "Structured JSON with evidence citations" },
];

export function WorkflowVisualization() {
  return (
    <div>
      <h3 className="text-xs font-mono font-semibold text-[#c9d1d9] mb-1">Agentic Workflow</h3>
      <p className="text-[11px] text-muted mb-3">11-node LangGraph stateful workflow with tool calling</p>
      <div className="space-y-1.5">
        {NODES.map((node, i) => (
          <div
            key={node.label}
            className="flex items-start gap-2.5 p-2 rounded border border-border bg-bg-primary/50"
          >
            <div className="flex-shrink-0 w-7 h-7 rounded bg-accent/10 flex items-center justify-center">
              <node.icon className="w-3.5 h-3.5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted font-mono">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[11px] font-medium text-[#c9d1d9]">{node.label}</span>
              </div>
              <p className="text-[10px] text-muted leading-relaxed mt-0.5">{node.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
