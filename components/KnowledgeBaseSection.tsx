"use client";

import { Database, FileText, Search, Shield } from "lucide-react";

const FILES = [
  "backend_engineer_rubric.md",
  "ai_engineer_rubric.md",
  "fullstack_engineer_rubric.md",
  "rate_limiter_expected_solution.md",
  "rag_system_expected_solution.md",
  "algorithm_problem_rubric.md",
  "system_design_rubric.md",
  "code_quality_standards.md",
  "bias_mitigation_guidelines.md",
  "interview_feedback_format.md",
];

export function KnowledgeBaseSection() {
  return (
    <div>
      <h3 className="text-xs font-mono font-semibold text-[#c9d1d9] mb-1">RAG Knowledge Base</h3>
      <p className="text-[11px] text-muted mb-3">10 markdown docs chunked, embedded, and stored in a vector database</p>

      <div className="space-y-1.5 mb-3">
        {[
          { icon: FileText, title: "Hiring Rubrics", desc: "Role-specific evaluation criteria for Backend, AI, and Full Stack engineers" },
          { icon: Search, title: "Problem Expectations", desc: "Expected solutions for rate limiter, RAG system, and algorithm problems" },
          { icon: Shield, title: "Safety Guidelines", desc: "Bias mitigation rules, code quality standards, and feedback format" },
        ].map((item) => (
          <div key={item.title} className="p-2 rounded border border-border bg-bg-primary/50">
            <div className="flex items-center gap-2 mb-1">
              <item.icon className="w-3.5 h-3.5 text-accent" />
              <span className="text-[11px] font-medium text-[#c9d1d9]">{item.title}</span>
            </div>
            <p className="text-[10px] text-muted leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="p-2 rounded border border-border bg-bg-primary/50">
        <div className="flex items-center gap-2 mb-2">
          <Database className="w-3.5 h-3.5 text-accent" />
          <span className="text-[11px] font-mono text-muted">Knowledge Base Files</span>
        </div>
        <div className="grid grid-cols-1 gap-1">
          {FILES.map((file) => (
            <div key={file} className="flex items-center gap-1.5 px-2 py-1 rounded bg-bg-hover/50 font-mono text-[10px] text-muted">
              <FileText className="w-3 h-3 text-accent/50 flex-shrink-0" />
              {file}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
