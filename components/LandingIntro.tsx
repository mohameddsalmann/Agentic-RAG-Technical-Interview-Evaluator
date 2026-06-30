"use client";

import { ArrowRight, BookOpen, Code2, Database, FileText } from "lucide-react";
import { AnimatedIdePreview } from "./AnimatedIdePreview";
import { MotionCard } from "./MotionCard";

interface LandingIntroProps {
  onEnter: () => void;
  onShowWorkflow: () => void;
}

const VALUE_CARDS = [
  {
    icon: Code2,
    title: "Code Analysis",
    desc: "Analyze correctness, complexity, edge cases, and code quality.",
    color: "#58a6ff",
  },
  {
    icon: Database,
    title: "RAG Evidence",
    desc: "Retrieve role-specific hiring rubrics and cite supporting evidence.",
    color: "#3fb950",
  },
  {
    icon: FileText,
    title: "Decision Report",
    desc: "Generate score, recommendation, strengths, risks, and human-review guidance.",
    color: "#d29922",
  },
];

export function LandingIntro({ onEnter, onShowWorkflow }: LandingIntroProps) {
  return (
    <section className="landing-bg flex flex-col items-center justify-center min-h-screen px-4 py-8 sm:py-12 overflow-y-auto w-full">
      {/* Hero badge */}
      <div className="landing-fade-up" style={{ animationDelay: "0.1s" }}>
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-accent/30 bg-accent/5 text-xs font-mono text-accent">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          Agentic RAG + LangGraph + Tool Calling
        </span>
      </div>

      {/* Headline */}
      <h1
        className="landing-fade-up mt-6 text-3xl sm:text-4xl md:text-5xl font-bold text-center text-[#f0f6fc] tracking-tight max-w-2xl leading-tight"
        style={{ animationDelay: "0.2s" }}
      >
        Run technical interviews inside an AI evaluation IDE.
      </h1>

      {/* Subheadline */}
      <p
        className="landing-fade-up mt-4 text-sm sm:text-base text-muted text-center max-w-xl leading-relaxed"
        style={{ animationDelay: "0.3s" }}
      >
        Paste candidate code, run an 11-step AI workflow, and get a structured report with score, recommendation, rubric evidence, and human-review guidance.
      </p>

      {/* Mini IDE Preview */}
      <div className="landing-fade-up mt-8 w-full max-w-4xl" style={{ animationDelay: "0.4s" }}>
        <AnimatedIdePreview />
      </div>

      {/* Value cards */}
      <div
        className="landing-fade-up mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-3xl"
        style={{ animationDelay: "0.5s" }}
      >
        {VALUE_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <MotionCard
              key={card.title}
              className="ide-card p-4"
              glowColor={`${card.color}30`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" style={{ color: card.color }} />
                <span className="text-sm font-semibold text-[#f0f6fc]">{card.title}</span>
              </div>
              <p className="text-xs text-muted leading-relaxed">{card.desc}</p>
            </MotionCard>
          );
        })}
      </div>

      {/* CTA buttons */}
      <div className="landing-fade-up mt-8 flex flex-col sm:flex-row items-center gap-3 relative z-10" style={{ animationDelay: "0.6s" }}>
        <button
          onClick={onEnter}
          className="glow-accent flex items-center gap-2 px-6 py-3 rounded-md bg-accent text-white text-sm font-semibold tracking-wide transition-all hover:bg-accent/90 hover:scale-[1.03] active:scale-[0.98] focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-primary focus:outline-none"
        >
          Enter Evaluation IDE
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={onShowWorkflow}
          className="flex items-center gap-2 px-5 py-3 rounded-md border border-border bg-bg-elevated text-muted text-sm font-semibold hover:text-[#f0f6fc] hover:border-accent transition-all hover:scale-[1.03] active:scale-[0.98] focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-primary focus:outline-none"
        >
          <BookOpen className="w-4 h-4" />
          View Workflow
        </button>
      </div>

      {/* Entry hint */}
      <p
        className="landing-fade-up mt-6 text-xs text-muted/60 text-center max-w-md"
        style={{ animationDelay: "0.7s" }}
      >
        You&apos;re entering a coding-evaluation workspace: configure the interview, paste code, run the AI agent, and review the report.
      </p>
    </section>
  );
}
