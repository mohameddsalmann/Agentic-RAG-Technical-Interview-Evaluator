"use client";

import { CheckCircle, AlertTriangle, Code, Zap, FileText, MessageSquare } from "lucide-react";

const DIMENSIONS = [
  { icon: CheckCircle, name: "Correctness", weight: "30%", desc: "Does the code solve the problem correctly?" },
  { icon: Zap, name: "Complexity", weight: "15%", desc: "Time & space complexity optimization" },
  { icon: AlertTriangle, name: "Edge Cases", weight: "15%", desc: "Boundary conditions, empty inputs, error paths" },
  { icon: Code, name: "Readability", weight: "10%", desc: "Naming, style, self-documenting code" },
  { icon: FileText, name: "Maintainability", weight: "10%", desc: "Modularity, testability, separation of concerns" },
  { icon: MessageSquare, name: "Communication", weight: "20%", desc: "Comments, documentation, code intent clarity" },
];

export function EvaluationDimensions() {
  return (
    <div>
      <h3 className="text-xs font-mono font-semibold text-[#c9d1d9] mb-1">Evaluation Dimensions</h3>
      <p className="text-[11px] text-muted mb-3">Six weighted scoring categories aligned with industry hiring rubrics</p>

      <div className="space-y-1.5">
        {DIMENSIONS.map((dim) => (
          <div key={dim.name} className="p-2 rounded border border-border bg-bg-primary/50">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <dim.icon className="w-3.5 h-3.5 text-accent" />
                <span className="text-[11px] font-medium text-[#c9d1d9]">{dim.name}</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent/10 text-accent">
                {dim.weight}
              </span>
            </div>
            <p className="text-[10px] text-muted">{dim.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
