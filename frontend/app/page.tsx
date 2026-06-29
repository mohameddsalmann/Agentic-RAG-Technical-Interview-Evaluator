"use client";

import { Hero } from "@/components/Hero";
import { EvaluatorDashboard } from "@/components/EvaluatorDashboard";
import { WorkflowVisualization } from "@/components/WorkflowVisualization";
import { KnowledgeBaseSection } from "@/components/KnowledgeBaseSection";
import { EvaluationDimensions } from "@/components/EvaluationDimensions";
import { HumanInTheLoop } from "@/components/HumanInTheLoop";
import { ResumeImpact } from "@/components/ResumeImpact";

export default function Home() {
  return (
    <main className="relative">
      <Hero />
      <EvaluatorDashboard />
      <WorkflowVisualization />
      <KnowledgeBaseSection />
      <EvaluationDimensions />
      <HumanInTheLoop />
      <ResumeImpact />

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-gray-500 mb-2">
            Agentic RAG Technical Interview Evaluator
          </p>
          <p className="text-xs text-gray-600">
            Built with Next.js • FastAPI • LangGraph • RAG • Tool Calling
          </p>
        </div>
      </footer>
    </main>
  );
}
