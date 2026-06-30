"use client";

import { motion } from "framer-motion";
import {
  Award, TrendingUp, TrendingDown, AlertTriangle, Shield,
  FileText, Zap, CheckCircle2, XCircle, Info, Database,
} from "lucide-react";
import type { EvaluateResponse } from "@/types";

const RECOMMENDATION_STYLES: Record<string, { color: string; bg: string }> = {
  "Strong Hire": { color: "text-emerald-400", bg: "bg-emerald-500/20 border-emerald-500/40" },
  "Hire": { color: "text-green-400", bg: "bg-green-500/20 border-green-500/40" },
  "Lean Hire": { color: "text-yellow-400", bg: "bg-yellow-500/20 border-yellow-500/40" },
  "Lean No Hire": { color: "text-orange-400", bg: "bg-orange-500/20 border-orange-500/40" },
  "No Hire": { color: "text-red-400", bg: "bg-red-500/20 border-red-500/40" },
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
  if (score >= 80) return "text-emerald-400";
  if (score >= 65) return "text-yellow-400";
  if (score >= 50) return "text-orange-400";
  return "text-red-400";
}

function barColor(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 65) return "bg-yellow-500";
  if (score >= 50) return "bg-orange-500";
  return "bg-red-500";
}

export function EvaluationReport({ result }: { result: EvaluateResponse }) {
  const recStyle = RECOMMENDATION_STYLES[result.recommendation] || RECOMMENDATION_STYLES["No Hire"];

  return (
    <div className="glass-card p-6 glow overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6 pb-4 border-b border-white/10"
      >
        <div>
          <h3 className="text-lg font-bold text-white">{result.candidate_name}</h3>
          <p className="text-xs text-gray-400">{result.role} • {result.problem_title}</p>
        </div>
        {result.demo_mode && (
          <span className="text-[10px] px-2 py-1 rounded bg-warning/20 text-warning font-mono">
            DEMO MODE
          </span>
        )}
      </motion.div>

      {/* Overall Score & Recommendation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-6 mb-6"
      >
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle cx="48" cy="48" r="40" stroke="#1a1a25" strokeWidth="6" fill="none" />
            <motion.circle
              cx="48" cy="48" r="40" stroke="url(#gradient)" strokeWidth="6" fill="none"
              strokeLinecap="round"
              initial={{ strokeDasharray: "251.2 251.2", strokeDashoffset: 251.2 }}
              animate={{ strokeDashoffset: 251.2 - (251.2 * result.overall_score) / 100 }}
              transition={{ duration: 1, delay: 0.3 }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className={`text-2xl font-bold ${scoreColor(result.overall_score)}`}>
              {result.overall_score}
            </span>
            <span className="text-[10px] text-gray-500">/ 100</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4 text-accent-light" />
            <span className="text-xs text-gray-400">Recommendation</span>
          </div>
          <div className={`inline-block px-4 py-2 rounded-lg border ${recStyle.bg} ${recStyle.color} font-bold text-base`}>
            {result.recommendation}
          </div>
          <div className="flex items-center gap-1.5 mt-3">
            <Shield className="w-3.5 h-3.5 text-warning" />
            <span className="text-xs text-warning">Human review required</span>
          </div>
        </div>
      </motion.div>

      {/* Score Breakdown */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <h4 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Category Scores</h4>
        <div className="space-y-2.5">
          {Object.entries(result.scores).map(([key, score], i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-300">{SCORE_LABELS[key] || key}</span>
                <span className={`text-xs font-mono font-bold ${scoreColor(score)}`}>{score}</span>
              </div>
              <div className="h-1.5 rounded-full bg-bg-card overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${barColor(score)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 0.8, delay: 0.4 + i * 0.05 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Complexity */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 gap-3 mb-6"
      >
        <div className="p-3 rounded-lg bg-bg-card/50 border border-white/5">
          <div className="flex items-center gap-1.5 mb-1">
            <Zap className="w-3.5 h-3.5 text-accent-light" />
            <span className="text-[10px] text-gray-500 uppercase">Time</span>
          </div>
          <span className="text-sm font-mono text-white">{result.time_complexity}</span>
        </div>
        <div className="p-3 rounded-lg bg-bg-card/50 border border-white/5">
          <div className="flex items-center gap-1.5 mb-1">
            <Database className="w-3.5 h-3.5 text-accent-light" />
            <span className="text-[10px] text-gray-500 uppercase">Space</span>
          </div>
          <span className="text-sm font-mono text-white">{result.space_complexity}</span>
        </div>
      </motion.div>

      {/* Strengths & Weaknesses */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {result.strengths.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h4 className="text-xs font-semibold text-success mb-2 flex items-center gap-1.5 uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" /> Strengths
            </h4>
            <ul className="space-y-1.5">
              {result.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success flex-shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
        {result.weaknesses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <h4 className="text-xs font-semibold text-danger mb-2 flex items-center gap-1.5 uppercase tracking-wider">
              <TrendingDown className="w-3.5 h-3.5" /> Weaknesses
            </h4>
            <ul className="space-y-1.5">
              {result.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                  <XCircle className="w-3.5 h-3.5 text-danger flex-shrink-0 mt-0.5" />
                  {w}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>

      {/* Missed Edge Cases */}
      {result.missed_edge_cases.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-6"
        >
          <h4 className="text-xs font-semibold text-warning mb-2 flex items-center gap-1.5 uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5" /> Missed Edge Cases
          </h4>
          <div className="flex flex-wrap gap-2">
            {result.missed_edge_cases.map((e, i) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-warning/10 border border-warning/20 text-warning">
                {e}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Retrieved Rubric Evidence */}
      {result.retrieved_rubric_evidence.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="mb-6"
        >
          <h4 className="text-xs font-semibold text-accent-light mb-2 flex items-center gap-1.5 uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" /> Retrieved Rubric Evidence
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {result.retrieved_rubric_evidence.map((e, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-bg-card/50 border border-white/5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-accent-light">{e.source}</span>
                  <span className="text-[10px] text-gray-500">relevance: {e.relevance}</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">{e.snippet}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Bias Mitigation */}
      {result.bias_mitigation_notes.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mb-6"
        >
          <h4 className="text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" /> Bias Mitigation
          </h4>
          <ul className="space-y-1">
            {result.bias_mitigation_notes.map((n, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                <Info className="w-3 h-3 text-gray-500 flex-shrink-0 mt-0.5" />
                {n}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Final Feedback */}
      {result.final_feedback && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
          className="p-4 rounded-lg bg-accent/5 border border-accent/20"
        >
          <h4 className="text-xs font-semibold text-accent-light mb-2 uppercase tracking-wider">Final Feedback</h4>
          <p className="text-sm text-gray-300 leading-relaxed">{result.final_feedback}</p>
        </motion.div>
      )}

      {/* Human Review Warning */}
      {result.human_review_required && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/30 flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
          <span className="text-xs text-warning">
            Human review required before any hiring decision. AI evaluation is advisory only.
          </span>
        </motion.div>
      )}
    </div>
  );
}
