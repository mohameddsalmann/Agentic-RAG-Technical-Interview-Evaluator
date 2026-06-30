"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { WorkflowVisualization } from "./WorkflowVisualization";
import { KnowledgeBaseSection } from "./KnowledgeBaseSection";
import { EvaluationDimensions } from "./EvaluationDimensions";
import { HumanInTheLoop } from "./HumanInTheLoop";
import { ResumeImpact } from "./ResumeImpact";

interface InfoSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function InfoSidebar({ open, onClose }: InfoSidebarProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    closeBtnRef.current?.focus();

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <>
      {/* Overlay backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Slide-out Drawer */}
      <aside
        ref={drawerRef}
        className={`fixed top-0 left-0 h-full z-50 w-full sm:w-96 bg-bg-card border-r border-border overflow-y-auto transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0 pointer-events-auto" : "-translate-x-full pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-border bg-bg-card">
          <span className="text-sm font-semibold text-[#f0f6fc]">
            How It Works
          </span>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="p-1.5 rounded hover:bg-bg-hover text-muted hover:text-accent transition-colors"
            aria-label="Close info panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {open && (
          <div className="p-6 space-y-8 animate-fade-in">
            {/* Intro */}
            <div className="p-4 rounded-md border border-border bg-bg-elevated/40">
              <p className="text-sm text-[#f0f6fc] leading-relaxed">
                This evaluator uses an 11-step LangGraph workflow with RAG over hiring rubrics to generate evidence-based interview feedback.
              </p>
            </div>

            {/* Demo vs Production */}
            <div>
              <h3 className="text-sm font-semibold text-[#f0f6fc] mb-1.5">Demo vs Production</h3>
              <p className="text-sm text-muted leading-relaxed">
                In <span className="text-warning font-semibold">demo mode</span>, the evaluator uses mock responses without calling the LLM. In <span className="text-success font-semibold">production mode</span>, it connects to the real LLM and vector database for full RAG-based evaluation. The badge in the top bar shows the current mode.
              </p>
            </div>

            <WorkflowVisualization />
            <EvaluationDimensions />
            <KnowledgeBaseSection />
            <HumanInTheLoop />
            <ResumeImpact />
          </div>
        )}
      </aside>
    </>
  );
}
