"use client";

import { motion } from "framer-motion";
import { Database, FileText, Search, Shield } from "lucide-react";

const FILES = [
  "backend_engineer_rubric.md",
  "ai_engineer_rubric.md",
  "fullstack_engineer_rubric.md",
  "rate_limiter_expected_solution.md",
  "rag_system_expected_solution.md",
  "algorithm_problem_rubric.md",
  "system_design_rubric.md",
  "code_quality_standards.md",
  "bias_mitigation_guidelines.md",
  "interview_feedback_format.md",
];

export function KnowledgeBaseSection() {
  return (
    <section id="knowledge" className="py-24 px-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl font-bold mb-4">
          <span className="gradient-text">RAG Knowledge Base</span>
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          10 markdown documents chunked, embedded, and stored in a vector database for semantic retrieval
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {[
          { icon: FileText, title: "Hiring Rubrics", desc: "Role-specific evaluation criteria for Backend, AI, and Full Stack engineers with seniority expectations" },
          { icon: Search, title: "Problem Expectations", desc: "Expected solutions for rate limiter, RAG system, and algorithm problems with scoring guides" },
          { icon: Shield, title: "Safety Guidelines", desc: "Bias mitigation rules, code quality standards, and structured feedback format requirements" },
        ].map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="glass-card p-6 glow"
          >
            <item.icon className="w-8 h-8 text-accent-light mb-4" />
            <h3 className="font-semibold text-white mb-2">{item.title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="glass-card p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-accent-light" />
          <h3 className="font-semibold text-white text-sm">Knowledge Base Files</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {FILES.map((file, i) => (
            <motion.div
              key={file}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-card/50 font-mono text-xs text-gray-400"
            >
              <FileText className="w-3.5 h-3.5 text-accent/60 flex-shrink-0" />
              {file}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
