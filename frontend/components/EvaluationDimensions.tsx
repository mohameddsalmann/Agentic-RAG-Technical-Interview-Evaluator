"use client";

import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, Code, Zap, FileText, MessageSquare } from "lucide-react";

const DIMENSIONS = [
  { icon: CheckCircle, name: "Correctness", weight: "30%", desc: "Does the code solve the problem correctly?" },
  { icon: Zap, name: "Complexity", weight: "15%", desc: "Time & space complexity optimization" },
  { icon: AlertTriangle, name: "Edge Cases", weight: "15%", desc: "Boundary conditions, empty inputs, error paths" },
  { icon: Code, name: "Readability", weight: "10%", desc: "Naming, style, self-documenting code" },
  { icon: FileText, name: "Maintainability", weight: "10%", desc: "Modularity, testability, separation of concerns" },
  { icon: MessageSquare, name: "Communication", weight: "20%", desc: "Comments, documentation, code intent clarity" },
];

export function EvaluationDimensions() {
  return (
    <section id="dimensions" className="py-24 px-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl font-bold mb-4">
          <span className="gradient-text">Evaluation Dimensions</span>
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Six weighted scoring categories aligned with industry hiring rubrics
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DIMENSIONS.map((dim, i) => (
          <motion.div
            key={dim.name}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            whileHover={{ y: -4 }}
            className="glass-card p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <dim.icon className="w-5 h-5 text-accent-light" />
                </div>
                <h3 className="font-semibold text-white">{dim.name}</h3>
              </div>
              <span className="text-xs font-mono px-2 py-1 rounded bg-accent/20 text-accent-light">
                {dim.weight}
              </span>
            </div>
            <p className="text-sm text-gray-400">{dim.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
