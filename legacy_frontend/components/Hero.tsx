"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowDown } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.15), transparent)" }}
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.1), transparent)" }}
          animate={{ x: [0, -40, 0], y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8"
        >
          <Sparkles className="w-4 h-4 text-accent-light" />
          <span className="text-sm text-gray-300">Powered by LangGraph + RAG + Tool Calling</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
        >
          <span className="gradient-text">Agentic RAG</span>
          <br />
          <span className="text-white">Technical Interview Evaluator</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-10"
        >
          A real AI agent that analyzes candidate code, retrieves role-specific hiring rubrics via RAG,
          and generates structured, evidence-based interview feedback through a multi-step LangGraph workflow.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <a
            href="#evaluator"
            className="px-8 py-3 rounded-xl bg-accent hover:bg-accent-light text-white font-medium transition-all glow hover:glow-strong"
          >
            Try the Evaluator
          </a>
          <a
            href="#workflow"
            className="px-8 py-3 rounded-xl glass-card hover:bg-bg-hover text-white font-medium transition-all"
          >
            View Architecture
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ArrowDown className="w-6 h-6 text-gray-500" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
