"use client";

import { motion } from "framer-motion";
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
    <section id="workflow" className="py-24 px-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl font-bold mb-4">
          <span className="gradient-text">Agentic Workflow</span>
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          11-node LangGraph stateful workflow with real tool calling at each step
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {NODES.map((node, i) => (
          <motion.div
            key={node.label}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="agent-node glass-card p-5 glow hover:glow-strong transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <node.icon className="w-5 h-5 text-accent-light" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-500 font-mono">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="font-semibold text-white text-sm">{node.label}</h3>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{node.desc}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
