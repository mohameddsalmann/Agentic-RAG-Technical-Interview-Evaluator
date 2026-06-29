"use client";

import {
  Award, TrendingUp, TrendingDown, AlertTriangle, Shield,
  FileText, Zap, CheckCircle2, XCircle, Info, Database,
} from "lucide-react";
import type { EvaluateResponse } from "@/types";

const RECOMMENDATION_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  "Strong Hire": { color: "text-success", bg: "bg-success/10", border: "border-success/30" },
  "Hire": { color: "text-success", bg: "bg-success/10", border: "border-success/30" },
  "Lean Hire": { color: "text-warning", bg: "bg-warning/10", border: "border-warning/30" },
  "Lean No Hire": { color: "text-warning", bg: "bg-warning/10", border: "border-warning/30" },
  "No Hire": { color: "text-danger", bg: "bg-danger/10", border: "border-danger/30" },
};

const SCORE_LABELS: Record<string, string> = {
  correctness: "Correctness",
  complexity: "Complexity",
  edge_cases: "Edge Cases",
  readability: "Readability",
  maintainability: "Maintainability",
  communication: "Communication",
};

function scoreColor(score: number): string {
  if (score >= 80) return "text-success";
  if (score >= 65) return "text-warning";
  if (score >= 50) return "text-[#d29922]";
  return "text-danger";
}

function barColor(score: number): string {
  if (score >= 80) return "bg-success";
  if (score >= 65) return "bg-warning";
  if (score >= 50) return "bg-[#d29922]";
  return "bg-danger";
}

export function EvaluationReport({ result }: { result: EvaluateResponse }) {
  const recStyle = RECOMMENDATION_STYLES[result.recommendation] || RECOMMENDATION_STYLES["No Hire"];

  return (
    <div className="space-y-6">
      {/* 0. One-sentence summary */}
      <div className="text-center">
        <p className="text-sm text-[#f0f6fc] leading-relaxed">
          <span className={`font-bold ${scoreColor(result.overall_score)}`}>{result.overall_score}/100</span>
          {" — "}
          <span className={`font-semibold ${recStyle.color}`}>{result.recommendation}</span>
          {result.weaknesses.length > 0 && (
            <span className="text-muted">. {result.weaknesses[0]}</span>
          )}
          {result.weaknesses.length === 0 && result.strengths.length > 0 && (
            <span className="text-muted">. {result.strengths[0]}</span>
          )}
        </p>
      </div>

      {/* 1. Overall Score & Recommendation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Overall Score Card */}
        <div className="ide-card-elevated p-6 flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-text-secondary">
              Overall Score
            </h4>
            <p className="text-sm text-muted">
              Weighted candidate metric
            </p>
          </div>
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="#30363d" strokeWidth="6" fill="none" />
              <circle
                cx="48" cy="48" r="40" stroke="#58a6ff" strokeWidth="6" fill="none"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={2 * Math.PI * 40 - (2 * Math.PI * 40 * result.overall_score) / 100}
                style={{ transition: "stroke-dashoffset 1s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className={`text-2xl font-bold ${scoreColor(result.overall_score)}`}>
                {result.overall_score}
              </span>
              <span className="text-[10px] text-muted">/ 100</span>
            </div>
          </div>
        </div>

        {/* Recommendation Badge Card */}
        <div className="ide-card-elevated p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-accent" />
              <h4 className="text-sm font-semibold text-text-secondary">
                Recommendation
              </h4>
            </div>
            {result.demo_mode && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-warning/10 text-warning border border-warning/20 font-mono font-bold">
                DEMO
              </span>
            )}
          </div>
          
          <div className={`text-center py-3.5 px-4 rounded-md border font-bold text-lg ${recStyle.bg} ${recStyle.color} ${recStyle.border}`}>
            {result.recommendation}
          </div>

          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-muted font-medium">
            <Shield className="w-3.5 h-3.5 text-warning" />
            <span>Advisory AI recommendation</span>
          </div>
        </div>
      </div>

      {/* 2. Score Breakdown Cards */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-[#f0f6fc]">
          Score Breakdown
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(result.scores).map(([key, score]) => (
            <div key={key} className="ide-card p-4 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#f0f6fc]">
                  {SCORE_LABELS[key] || key}
                </span>
                <span className={`text-sm font-bold ${scoreColor(score)}`}>
                  {score}%
                </span>
              </div>
              <div className="space-y-1">
                <div className="h-1.5 rounded-full bg-[#21262d] overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColor(score)}`}
                    style={{ width: `${score}%`, transition: "width 0.8s ease" }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Complexity Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="ide-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-accent" />
            </div>
            <div>
              <span className="text-[10px] text-muted font-mono uppercase tracking-wider block">Time Complexity</span>
              <span className="text-sm font-semibold text-[#f0f6fc] font-mono">{result.time_complexity}</span>
            </div>
          </div>
        </div>

        <div className="ide-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center">
              <Database className="w-4 h-4 text-accent" />
            </div>
            <div>
              <span className="text-[10px] text-muted font-mono uppercase tracking-wider block">Space Complexity</span>
              <span className="text-sm font-semibold text-[#f0f6fc] font-mono">{result.space_complexity}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Key Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        {result.strengths.length > 0 && (
          <div className="ide-card p-5 space-y-3">
            <h4 className="text-sm font-semibold text-success flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" /> Key Strengths
            </h4>
            <ul className="space-y-2">
              {result.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-[#f0f6fc] leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Weaknesses */}
        {result.weaknesses.length > 0 && (
          <div className="ide-card p-5 space-y-3">
            <h4 className="text-sm font-semibold text-danger flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4" /> Areas for Improvement
            </h4>
            <ul className="space-y-2">
              {result.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-[#f0f6fc] leading-relaxed">
                  <XCircle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 4. Missed Edge Cases */}
      {result.missed_edge_cases.length > 0 && (
        <div className="ide-card p-5 space-y-3">
          <h4 className="text-sm font-semibold text-warning flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" /> Missed Edge Cases
          </h4>
          <p className="text-sm text-muted leading-relaxed">
            The submission did not account for the following edge cases:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {result.missed_edge_cases.map((e, i) => (
              <span key={i} className="text-xs font-semibold px-2.5 py-1 rounded bg-warning/10 border border-warning/20 text-warning">
                {e}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 5. Rubric Evidence */}
      {result.retrieved_rubric_evidence.length > 0 && (
        <div className="ide-card p-5 space-y-3">
          <h4 className="text-sm font-semibold text-accent flex items-center gap-1.5">
            <FileText className="w-4 h-4" /> Rubric Evidence
          </h4>
          <p className="text-sm text-muted leading-relaxed">
            Facts retrieved from the RAG knowledge base supporting the evaluation:
          </p>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {result.retrieved_rubric_evidence.map((e, i) => (
              <div key={i} className="p-3 rounded border border-border bg-bg-elevated/40 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-accent font-semibold">{e.source}</span>
                  <span className="text-muted">relevance: {e.relevance}</span>
                </div>
                <p className="text-sm text-[#f0f6fc] leading-relaxed italic">
                  &ldquo;{e.snippet}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Final Feedback */}
      {result.final_feedback && (
        <div className="ide-card p-5 border-l-2 border-l-accent space-y-2.5 bg-accent/5">
          <h4 className="text-sm font-semibold text-accent">
            Final Feedback
          </h4>
          <p className="text-sm text-[#f0f6fc] leading-relaxed whitespace-pre-line">
            {result.final_feedback}
          </p>
        </div>
      )}

      {/* 7. Bias Mitigation */}
      {result.bias_mitigation_notes.length > 0 && (
        <div className="ide-card p-5 space-y-2.5">
          <h4 className="text-sm font-semibold text-muted flex items-center gap-1.5">
            <Shield className="w-4 h-4" /> Bias Mitigation Notes
          </h4>
          <ul className="space-y-1.5">
            {result.bias_mitigation_notes.map((n, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-muted">
                <Info className="w-4 h-4 text-muted flex-shrink-0 mt-0.5" />
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 8. Human Review Warning */}
      {result.human_review_required && (
        <div className="p-4 rounded-md border border-warning/30 bg-warning/10 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-sm font-bold text-warning block">Human Review Required</span>
            <span className="text-sm text-warning/90 leading-relaxed block">
              AI evaluations are advisory only. A human interviewer must verify code complexity and edge cases before making final hiring decisions.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
