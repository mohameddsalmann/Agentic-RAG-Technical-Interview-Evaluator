"use client";

import { useState, useCallback, KeyboardEvent, useEffect } from "react";
import { FileText, Activity, Loader2, Sparkles, RotateCcw, Copy, Download, Award, BarChart3, FileSearch } from "lucide-react";
import type { EvaluateResponse, AgentStep } from "@/types";
import { EvaluationReport } from "./EvaluationReport";
import { AgentTimeline } from "./AgentTimeline";

interface ResultsPanelProps {
  result: EvaluateResponse | null;
  loading: boolean;
  activeStepIdx: number;
  agentSteps: AgentStep[];
  steps: string[];
  error: string | null;
  onReset?: () => void;
  onCopy?: () => void;
  onExport?: () => void;
}

type TabId = "report" | "timeline";

const TABS: { id: TabId; label: string; icon: typeof FileText }[] = [
  { id: "report", label: "Evaluation Report", icon: FileText },
  { id: "timeline", label: "Agent Timeline", icon: Activity },
];

export function ResultsPanel({
  result,
  loading,
  activeStepIdx,
  agentSteps,
  steps,
  error,
  onReset,
  onCopy,
  onExport,
}: ResultsPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("report");

  // Auto-switch to report tab when result arrives
  useEffect(() => {
    if (result) {
      setActiveTab("report");
    }
  }, [result]);

  // Auto-switch to timeline when loading starts
  useEffect(() => {
    if (loading) {
      setActiveTab("timeline");
    }
  }, [loading]);

  const handleTabKeyDown = useCallback((e: KeyboardEvent<HTMLButtonElement>, idx: number) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = (idx + 1) % TABS.length;
      setActiveTab(TABS[next].id);
      const btn = e.currentTarget.parentElement?.children[next] as HTMLButtonElement;
      btn?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = (idx - 1 + TABS.length) % TABS.length;
      setActiveTab(TABS[prev].id);
      const btn = e.currentTarget.parentElement?.children[prev] as HTMLButtonElement;
      btn?.focus();
    }
  }, []);

  return (
    <div className="flex flex-col h-full bg-bg-card flex-1 min-w-0">
      {/* Tab bar header */}
      <div
        className="flex items-center justify-between border-b border-border bg-bg-elevated/40 px-5 flex-shrink-0"
        role="tablist"
        aria-label="Evaluation dashboard tabs"
      >
        <div className="flex">
          {TABS.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(e) => handleTabKeyDown(e, idx)}
                className={`flex items-center gap-2 px-5 py-4 text-xs font-mono border-b-2 transition-all outline-none ${
                  isActive
                    ? "border-accent text-[#f0f6fc] font-bold"
                    : "border-transparent text-muted hover:text-[#f0f6fc]"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.id === "timeline" && loading && (
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          {result && !loading && (
            <>
              <button
                onClick={onReset}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs text-muted hover:text-[#f0f6fc] hover:bg-bg-elevated border border-border transition-all"
                title="New Evaluation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New</span>
              </button>
              <button
                onClick={onCopy}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs text-muted hover:text-[#f0f6fc] hover:bg-bg-elevated border border-border transition-all"
                title="Copy Report"
              >
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copy</span>
              </button>
              <button
                onClick={onExport}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs text-muted hover:text-[#f0f6fc] hover:bg-bg-elevated border border-border transition-all"
                title="Export JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tab content area */}
      <div
        className="flex-1 overflow-y-auto p-6 md:p-8"
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
      >
        {/* Error message card */}
        {error && (
          <div className="p-4 rounded-md border border-danger/30 bg-danger/10 text-danger text-sm font-mono mb-6 flex items-start gap-3 animate-fade-in">
            <span className="font-bold flex-shrink-0">ERROR:</span>
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        {/* 1. Loading / Agent Progress State */}
        {loading && activeTab === "timeline" && (
          <div className="space-y-6 max-w-2xl mx-auto py-8 animate-fade-in">
            <div className="text-center space-y-3 pb-4 border-b border-border">
              <div className="inline-flex p-3 rounded-full bg-accent/10 text-accent animate-spin mb-2">
                <Loader2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#f0f6fc]">
                AI agent is evaluating the code…
              </h3>
              <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
                This may take 10–30 seconds depending on the model.
              </p>
            </div>
            
            <div className="ide-card p-5 bg-bg-elevated/20">
              <h4 className="text-sm font-semibold text-[#f0f6fc] mb-4">
                Progress
              </h4>
              <AgentTimeline
                steps={steps}
                activeIdx={activeStepIdx}
                loading={loading}
                agentSteps={agentSteps}
              />
            </div>
          </div>
        )}

        {/* 2. Before Evaluation Placeholder */}
        {!result && !loading && (
          <div className="flex flex-col items-center justify-center text-center h-full max-w-lg mx-auto py-12 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-bg-elevated border border-border flex items-center justify-center mb-5">
              <Sparkles className="w-8 h-8 text-accent/70" />
            </div>
            <h3 className="text-base font-bold text-[#f0f6fc] mb-2">
              Run an evaluation to generate a structured technical interview report.
            </h3>
            <p className="text-sm text-muted leading-relaxed mb-6">
              You'll get a clear, evidence-based assessment of the candidate's code.
            </p>

            <div className="grid grid-cols-2 gap-3 w-full">
              <div className="ide-card p-4 text-left">
                <div className="flex items-center gap-2 mb-1.5">
                  <Award className="w-4 h-4 text-accent" />
                  <span className="text-sm font-semibold text-[#f0f6fc]">Overall Score</span>
                </div>
                <p className="text-xs text-muted leading-relaxed">Weighted score across 6 evaluation dimensions, out of 100.</p>
              </div>
              <div className="ide-card p-4 text-left">
                <div className="flex items-center gap-2 mb-1.5">
                  <FileText className="w-4 h-4 text-success" />
                  <span className="text-sm font-semibold text-[#f0f6fc]">Recommendation</span>
                </div>
                <p className="text-xs text-muted leading-relaxed">Hire, Lean Hire, or No Hire — with human review advisory.</p>
              </div>
              <div className="ide-card p-4 text-left">
                <div className="flex items-center gap-2 mb-1.5">
                  <BarChart3 className="w-4 h-4 text-warning" />
                  <span className="text-sm font-semibold text-[#f0f6fc]">Score Breakdown</span>
                </div>
                <p className="text-xs text-muted leading-relaxed">Per-dimension scores: correctness, complexity, edge cases, and more.</p>
              </div>
              <div className="ide-card p-4 text-left">
                <div className="flex items-center gap-2 mb-1.5">
                  <FileSearch className="w-4 h-4 text-accent" />
                  <span className="text-sm font-semibold text-[#f0f6fc]">Rubric Evidence</span>
                </div>
                <p className="text-xs text-muted leading-relaxed">Retrieved facts from the knowledge base supporting each score.</p>
              </div>
            </div>
          </div>
        )}

        {/* 3. Evaluation Report View */}
        {result && activeTab === "report" && (
          <div className="animate-fade-in">
            <EvaluationReport result={result} />
          </div>
        )}

        {/* 4. Static Timeline View after Evaluation */}
        {result && activeTab === "timeline" && !loading && (
          <div className="max-w-2xl mx-auto animate-fade-in space-y-4">
            <div className="pb-2 border-b border-border">
              <h3 className="text-base font-bold text-[#f0f6fc]">
                Agent Timeline
              </h3>
              <p className="text-sm text-muted mt-1 leading-relaxed">
                Review the step-by-step trace of how the agent evaluated the candidate's code.
              </p>
            </div>
            <div className="ide-card p-5 bg-bg-elevated/10">
              <AgentTimeline
                steps={steps}
                activeIdx={activeStepIdx}
                loading={loading}
                agentSteps={agentSteps}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
