"use client";

import { Check } from "lucide-react";

interface StepGuideProps {
  hasConfig: boolean;
  hasCode: boolean;
  hasResult: boolean;
  loading: boolean;
}

const STEPS = ["Setup", "Code", "Evaluate", "Results"];

export function StepGuide({ hasConfig, hasCode, hasResult, loading }: StepGuideProps) {
  const currentStep = (() => {
    if (loading) return 2;
    if (hasResult) return 3;
    if (!hasConfig) return 0;
    if (!hasCode) return 1;
    return 2;
  })();

  return (
    <div className="flex items-center justify-center gap-1 px-5 py-2.5 border-b border-border bg-bg-card flex-shrink-0">
      {STEPS.map((label, i) => {
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;
        return (
          <div key={label} className="flex items-center">
            {i > 0 && (
              <div
                className={`w-6 h-px mx-0.5 ${isCompleted || isCurrent ? "bg-accent/40" : "bg-border"}`}
              />
            )}
            <div className="flex items-center gap-1.5">
              <div
                className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold transition-all ${
                  isCompleted
                    ? "bg-success/20 text-success border border-success/30"
                    : isCurrent
                    ? "bg-accent/15 text-accent border border-accent/40"
                    : "bg-bg-elevated text-muted border border-border"
                }`}
              >
                {isCompleted ? <Check className="w-3 h-3" /> : i + 1}
              </div>
              <span
                className={`text-xs font-medium transition-colors ${
                  isCurrent ? "text-[#f0f6fc]" : isCompleted ? "text-text-secondary" : "text-muted"
                }`}
              >
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
