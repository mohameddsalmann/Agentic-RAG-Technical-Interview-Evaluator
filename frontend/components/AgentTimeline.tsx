"use client";

import { motion } from "framer-motion";
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
    <div className="space-y-1">
      {steps.map((step, i) => {
        const isDone = i < activeIdx || (!loading && i < activeIdx);
        const isActive = i === activeIdx && loading;
        const isPending = i > activeIdx;

        // Try to match with real agent steps from backend
        const realStep = agentSteps.find((s) =>
          s.step.toLowerCase().includes(step.toLowerCase().split(" ")[0]) ||
          step.toLowerCase().includes(s.step.toLowerCase().split(" ")[0])
        );

        return (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: isPending ? 0.4 : 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="flex items-center gap-3 py-1.5"
          >
            <div className="flex-shrink-0">
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-success" />
              ) : isActive ? (
                <Loader2 className="w-4 h-4 text-accent-light animate-spin" />
              ) : (
                <Circle className="w-4 h-4 text-gray-600" />
              )}
            </div>
            <div className="flex-1">
              <span
                className={`text-xs ${
                  isDone ? "text-gray-300" : isActive ? "text-accent-light font-medium" : "text-gray-500"
                }`}
              >
                {step}
              </span>
              {realStep && isDone && realStep.detail && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="block text-[10px] text-gray-600 mt-0.5"
                >
                  {realStep.detail}
                </motion.span>
              )}
            </div>
            {isActive && (
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-accent-light"
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
