"use client";

import { Briefcase } from "lucide-react";

const BULLETS = [
  "Built a real Agentic RAG technical interview evaluator that analyzes candidate code, retrieves role-specific hiring rubrics, and generates structured interview feedback.",
  "Implemented a LangGraph-based multi-step AI workflow for code analysis, rubric retrieval, correctness evaluation, edge-case detection, scoring, and recommendation generation.",
  "Designed a RAG pipeline over hiring rubrics, code quality standards, problem expectations, and bias-mitigation guidelines using embeddings and vector search.",
  "Built a polished Next.js dashboard with code editor, agent progress visualization, evidence-based evaluation reports, and human-in-the-loop hiring safeguards.",
];

export function ResumeImpact() {
  return (
    <div>
      <h3 className="text-xs font-mono font-semibold text-[#c9d1d9] mb-1">Resume Impact</h3>
      <p className="text-[11px] text-muted mb-3">Ready-to-use resume bullets that demonstrate real AI engineering</p>

      <div className="space-y-1.5">
        {BULLETS.map((bullet, i) => (
          <div key={i} className="flex items-start gap-2 p-2 rounded border border-border bg-bg-primary/50">
            <Briefcase className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted leading-relaxed">{bullet}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
