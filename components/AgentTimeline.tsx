"use client";

import { CheckCircle2, Loader2, Circle } from "lucide-react";
import type { AgentStep } from "@/types";

interface Props {
  steps: string[];
  activeIdx: number;
  loading: boolean;
  agentSteps: AgentStep[];
}

export function AgentTimeline({ steps, activeIdx, loading, agentSteps }: Props) {
  return (
    <div className="space-y-0.5">
      {steps.map((step, i) => {
        const isDone = i < activeIdx || (!loading && i < activeIdx);
        const isActive = i === activeIdx && loading;
        const isPending = i > activeIdx;

        const realStep = agentSteps.find((s) =>
          s.step.toLowerCase().includes(step.toLowerCase().split(" ")[0]) ||
          step.toLowerCase().includes(s.step.toLowerCase().split(" ")[0])
        );

        return (
          <div
            key={step}
            className={`flex items-center gap-3 py-2.5 ${isPending ? "opacity-40" : ""} transition-opacity`}
          >
            <div className="flex-shrink-0">
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-success" />
              ) : isActive ? (
                <Loader2 className="w-4 h-4 text-accent animate-spin" />
              ) : (
                <Circle className="w-4 h-4 text-muted/50" />
              )}
            </div>
            <div className="flex-1">
              <span
                className={`text-sm ${
                  isDone ? "text-[#f0f6fc]" : isActive ? "text-accent font-medium" : "text-muted"
                }`}
              >
                <span className="text-muted/60 mr-2">{String(i + 1).padStart(2, "0")}</span>
                {step}
              </span>
              {realStep && isDone && realStep.detail && (
                <span className="block text-xs text-muted/70 mt-0.5">
                  {realStep.detail}
                </span>
              )}
            </div>
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            )}
          </div>
        );
      })}
    </div>
  );
}
