"use client";

import { motion } from "framer-motion";
import { ShieldCheck, UserCheck, AlertCircle } from "lucide-react";

export function HumanInTheLoop() {
  return (
    <section id="safety" className="py-24 px-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl font-bold mb-4">
          <span className="gradient-text">Human-in-the-Loop Safety</span>
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          AI assists evaluation — humans make the final decision
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            icon: ShieldCheck,
            title: "Bias Mitigation",
            desc: "Feedback is based solely on technical code evidence. No personal traits, background, or demographics are considered.",
          },
          {
            icon: UserCheck,
            title: "Human Review Required",
            desc: "Every evaluation includes a mandatory human review step. AI recommendations are advisory only, never final decisions.",
          },
          {
            icon: AlertCircle,
            title: "No Code Execution",
            desc: "Candidate code is analyzed statically via AST parsing and LLM reasoning. Code is never executed for safety.",
          },
        ].map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="glass-card p-6 glow"
          >
            <item.icon className="w-10 h-10 text-accent-light mb-4" />
            <h3 className="font-semibold text-white mb-3">{item.title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
