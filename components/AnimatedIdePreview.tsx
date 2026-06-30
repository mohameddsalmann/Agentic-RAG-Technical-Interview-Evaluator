"use client";

import { Code2, Activity, FileText } from "lucide-react";

const CODE_LINES = [
  { num: 1, tokens: [{ t: "class ", c: "#ff7b72" }, { t: "RateLimiter", c: "#79c0ff" }, { t: ":", c: "#f0f6fc" }] },
  { num: 2, tokens: [{ t: "    def ", c: "#ff7b72" }, { t: "__init__", c: "#d2a8ff" }, { t: "(self, max_req):", c: "#f0f6fc" }] },
  { num: 3, tokens: [{ t: "        self.", c: "#f0f6fc" }, { t: "max", c: "#79c0ff" }, { t: " = max_req", c: "#f0f6fc" }] },
  { num: 4, tokens: [{ t: "        self.", c: "#f0f6fc" }, { t: "requests", c: "#79c0ff" }, { t: " = {}", c: "#f0f6fc" }] },
  { num: 5, tokens: [{ t: "    def ", c: "#ff7b72" }, { t: "is_allowed", c: "#d2a8ff" }, { t: "(self, uid):", c: "#f0f6fc" }] },
  { num: 6, tokens: [{ t: "        ", c: "#f0f6fc" }, { t: "if", c: "#ff7b72" }, { t: " uid ", c: "#f0f6fc" }, { t: "not in", c: "#ff7b72" }, { t: " self.requests:", c: "#f0f6fc" }] },
  { num: 7, tokens: [{ t: "            ", c: "#f0f6fc" }, { t: "return", c: "#ff7b72" }, { t: " ", c: "#f0f6fc" }, { t: "True", c: "#79c0ff" }] },
  { num: 8, tokens: [{ t: "        ", c: "#f0f6fc" }, { t: "return", c: "#ff7b72" }, { t: " ", c: "#f0f6fc" }, { t: "False", c: "#79c0ff" }] },
];

const AGENT_STEPS = ["Parse", "Retrieve", "Analyze", "Score", "Report"];

export function AnimatedIdePreview() {
  return (
    <div className="landing-float flex flex-col sm:flex-row items-center gap-3 sm:gap-2 max-w-3xl mx-auto" style={{ perspective: "1200px" }}>
      {/* Code Panel */}
      <div
        className="landing-fade-up ide-card flex-1 w-full sm:w-auto overflow-hidden"
        style={{ animationDelay: "0.4s", transformStyle: "preserve-3d" }}
      >
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border bg-bg-elevated">
          <Code2 className="w-3 h-3 text-accent" />
          <span className="text-[10px] font-mono text-muted">Candidate Code</span>
        </div>
        <div className="p-2.5 font-mono text-[9px] leading-[1.6] bg-bg-primary min-h-[120px]">
          {CODE_LINES.map((line) => (
            <div key={line.num} className="flex">
              <span className="text-muted/40 w-5 select-none">{line.num}</span>
              <span className="flex-1">
                {line.tokens.map((tok, i) => (
                  <span key={i} style={{ color: tok.c }}>{tok.t}</span>
                ))}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Connection line + Agent Steps */}
      <div className="flex sm:flex-col items-center gap-2">
        <svg width="40" height="2" className="hidden sm:block">
          <line x1="0" y1="1" x2="40" y2="1" stroke="#58a6ff" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5" />
        </svg>
        <div
          className="landing-fade-up ide-card px-3 py-2.5 flex sm:flex-col gap-1.5 sm:gap-1.5"
          style={{ animationDelay: "0.55s" }}
        >
          <div className="flex items-center gap-1.5 mb-1 hidden sm:flex">
            <Activity className="w-3 h-3 text-accent" />
            <span className="text-[10px] font-mono text-muted">Agent</span>
          </div>
          {AGENT_STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-1.5">
              <div
                className="w-1.5 h-1.5 rounded-full landing-pulse"
                style={{ backgroundColor: "#58a6ff", animationDelay: `${i * 0.25}s` }}
              />
              <span className="text-[9px] font-mono text-muted">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Connection line */}
      <svg width="40" height="2" className="hidden sm:block">
        <line x1="0" y1="1" x2="40" y2="1" stroke="#3fb950" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5" />
      </svg>

      {/* Report Panel */}
      <div
        className="landing-fade-up ide-card flex-1 w-full sm:w-auto overflow-hidden"
        style={{ animationDelay: "0.7s" }}
      >
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border bg-bg-elevated">
          <FileText className="w-3 h-3 text-success" />
          <span className="text-[10px] font-mono text-muted">Report</span>
        </div>
        <div className="p-3 space-y-2 min-h-[120px]">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono text-muted">Score</span>
            <span className="text-sm font-bold text-success">78/100</span>
          </div>
          <div className="h-1.5 rounded-full bg-bg-elevated overflow-hidden">
            <div className="h-full rounded-full bg-success landing-bar" style={{ width: "78%" }} />
          </div>
          <div className="space-y-1 pt-1">
            {["Correctness", "Complexity", "Edge Cases"].map((label, i) => (
              <div key={label} className="flex items-center justify-between text-[9px] font-mono">
                <span className="text-muted">{label}</span>
                <span className="text-[#f0f6fc]">{[85, 72, 76][i]}%</span>
              </div>
            ))}
          </div>
          <div className="text-[9px] font-mono text-success pt-1 border-t border-border">
            ✓ Lean Hire
          </div>
        </div>
      </div>
    </div>
  );
}
