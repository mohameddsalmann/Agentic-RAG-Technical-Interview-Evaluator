"use client";

import { ShieldCheck, UserCheck, AlertCircle } from "lucide-react";

export function HumanInTheLoop() {
  return (
    <div>
      <h3 className="text-xs font-mono font-semibold text-[#c9d1d9] mb-1">Human-in-the-Loop Safety</h3>
      <p className="text-[11px] text-muted mb-3">AI assists evaluation — humans make the final decision</p>

      <div className="space-y-1.5">
        {[
          {
            icon: ShieldCheck,
            title: "Bias Mitigation",
            desc: "Feedback is based solely on technical code evidence. No personal traits, background, or demographics are considered.",
          },
          {
            icon: UserCheck,
            title: "Human Review Required",
            desc: "Every evaluation includes a mandatory human review step. AI recommendations are advisory only.",
          },
          {
            icon: AlertCircle,
            title: "No Code Execution",
            desc: "Candidate code is analyzed statically via AST parsing and LLM reasoning. Code is never executed.",
          },
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
    </div>
  );
}
