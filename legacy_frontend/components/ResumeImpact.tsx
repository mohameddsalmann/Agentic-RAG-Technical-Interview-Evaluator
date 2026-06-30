"use client";

import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";

const BULLETS = [
  "Built a real Agentic RAG technical interview evaluator that analyzes candidate code, retrieves role-specific hiring rubrics, and generates structured interview feedback.",
  "Implemented a LangGraph-based multi-step AI workflow for code analysis, rubric retrieval, correctness evaluation, edge-case detection, scoring, and recommendation generation.",
  "Designed a RAG pipeline over hiring rubrics, code quality standards, problem expectations, and bias-mitigation guidelines using embeddings and vector search.",
  "Built a polished animated Next.js dashboard with code editor, agent progress visualization, evidence-based evaluation reports, and human-in-the-loop hiring safeguards.",
];

export function ResumeImpact() {
  return (
    <section id="resume" className="py-24 px-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl font-bold mb-4">
          <span className="gradient-text">Resume Impact</span>
        </h2>
        <p className="text-gray-400">Ready-to-use resume bullets that demonstrate real AI engineering</p>
      </motion.div>

      <div className="space-y-4">
        {BULLETS.map((bullet, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="glass-card p-5 flex items-start gap-4"
          >
            <Briefcase className="w-5 h-5 text-accent-light flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-300 leading-relaxed">{bullet}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
