"use client";

import { Settings, Code2, FileText, Activity, Play, Loader2 } from "lucide-react";

export type MobileTabId = "config" | "code" | "report" | "timeline";

interface MobileTabsProps {
  active: MobileTabId;
  onChange: (tab: MobileTabId) => void;
  hasResult: boolean;
  loading: boolean;
  onRun?: () => void;
  canRun?: boolean;
  isRunning?: boolean;
}

const TABS: { id: MobileTabId; label: string; icon: typeof Settings }[] = [
  { id: "config", label: "Setup", icon: Settings },
  { id: "code", label: "Code", icon: Code2 },
  { id: "report", label: "Report", icon: FileText },
  { id: "timeline", label: "Timeline", icon: Activity },
];

export function MobileTabs({ active, onChange, hasResult, loading, onRun, canRun, isRunning }: MobileTabsProps) {
  return (
    <div className="flex flex-col border-t border-border bg-bg-card flex-shrink-0 lg:hidden">
      {/* Persistent Run button */}
      {onRun && (
        <div className="px-4 pt-3 pb-2" style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom, 0.5rem))" }}>
          <button
            onClick={onRun}
            disabled={isRunning}
            className={`w-full py-2.5 rounded-md text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              isRunning
                ? "bg-accent/60 text-white cursor-wait"
                : canRun
                ? "bg-accent hover:bg-accent/90 text-white"
                : "bg-bg-elevated border border-border text-muted"
            }`}
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Evaluating…
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                Run Evaluation
              </>
            )}
          </button>
        </div>
      )}

      {/* Tab bar */}
      <div
        className="flex border-t border-border"
        role="tablist"
        aria-label="Mobile navigation"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          const showDot = (tab.id === "report" && hasResult) || (tab.id === "timeline" && loading);
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] relative transition-colors ${
                isActive ? "tab-active" : "tab-inactive"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {showDot && (
                <span className="absolute top-1 right-1/4 w-1.5 h-1.5 rounded-full bg-accent" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
