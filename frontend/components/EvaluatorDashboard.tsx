"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Loader2, User, Briefcase, GraduationCap, Code2,
  FileQuestion, ChevronDown, Cpu, Clock,
} from "lucide-react";
import Editor from "@monaco-editor/react";
import {
  ROLES, SENIORITIES, PROBLEMS, DEFAULT_CODE,
  type EvaluateRequest, type EvaluateResponse, type AgentStep,
} from "@/types";
import { startEvaluation, pollStatus, getResult } from "@/lib/api";
import { EvaluationReport } from "./EvaluationReport";
import { AgentTimeline } from "./AgentTimeline";

const STEPS = [
  "Parsing code",
  "Retrieving rubric",
  "Checking correctness",
  "Analyzing complexity",
  "Detecting edge cases",
  "Assessing code quality",
  "Mitigating bias",
  "Scoring result",
  "Generating report",
];

export function EvaluatorDashboard() {
  const [candidateName, setCandidateName] = useState("Ahmed Hassan");
  const [role, setRole] = useState<string>(ROLES[0]);
  const [seniority, setSeniority] = useState<string>(SENIORITIES[1]);
  const [problemKey, setProblemKey] = useState<string>(Object.keys(PROBLEMS)[0]);
  const [code, setCode] = useState<string>(DEFAULT_CODE);
  const [language, setLanguage] = useState("python");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeStepIdx, setActiveStepIdx] = useState(-1);
  const [showSteps, setShowSteps] = useState(false);

  const problem = PROBLEMS[problemKey];

  const handleEvaluate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setShowSteps(true);
    setActiveStepIdx(0);

    // Animate through steps while waiting for the backend
    const stepInterval = setInterval(() => {
      setActiveStepIdx((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 600);

    try {
      const req: EvaluateRequest = {
        candidate_name: candidateName,
        role,
        seniority,
        problem_title: problem.title,
        problem_description: problem.description,
        candidate_code: code,
        language,
      };

      // Use async endpoint to avoid browser fetch timeouts
      const { job_id } = await startEvaluation(req);

      // Poll for status until completed
      let pollResult;
      for (let attempt = 0; attempt < 120; attempt++) {
        await new Promise((r) => setTimeout(r, 1000));
        pollResult = await pollStatus(job_id);

        // Update step animation based on real backend steps
        if (pollResult.steps && pollResult.steps.length > 0) {
          setActiveStepIdx(Math.min(pollResult.steps.length, STEPS.length));
        }

        if (pollResult.status === "completed") {
          break;
        } else if (pollResult.status === "error") {
          throw new Error("Evaluation failed on the server");
        }
      }

      clearInterval(stepInterval);
      const res = await getResult(job_id);
      setActiveStepIdx(STEPS.length);
      setResult(res);
    } catch (err) {
      clearInterval(stepInterval);
      setError(err instanceof Error ? err.message : "Evaluation failed");
    } finally {
      setLoading(false);
    }
  }, [candidateName, role, seniority, problem, code, language]);

  return (
    <section id="evaluator" className="py-24 px-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl font-bold mb-4">
          <span className="gradient-text">Interactive Evaluator</span>
        </h2>
        <p className="text-gray-400">Paste code, configure the interview, and run a real AI evaluation</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Input Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-card p-6 glow"
        >
          <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <User className="w-5 h-5 text-accent-light" />
            Candidate & Interview Setup
          </h3>

          {/* Candidate Name */}
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-1.5 block">Candidate Name</label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-bg-card border border-white/10 text-white text-sm focus:border-accent focus:outline-none transition-colors"
              placeholder="Enter candidate name"
            />
          </div>

          {/* Role & Seniority */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Role</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 rounded-lg bg-bg-card border border-white/10 text-white text-sm focus:border-accent focus:outline-none appearance-none cursor-pointer"
                >
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Seniority</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <select
                  value={seniority}
                  onChange={(e) => setSeniority(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 rounded-lg bg-bg-card border border-white/10 text-white text-sm focus:border-accent focus:outline-none appearance-none cursor-pointer"
                >
                  {SENIORITIES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Problem Selection */}
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-1.5 block">Problem</label>
            <div className="relative">
              <FileQuestion className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <select
                value={problemKey}
                onChange={(e) => setProblemKey(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 rounded-lg bg-bg-card border border-white/10 text-white text-sm focus:border-accent focus:outline-none appearance-none cursor-pointer"
              >
                {Object.entries(PROBLEMS).map(([key, p]) => (
                  <option key={key} value={key}>{p.title}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Problem Description */}
          <div className="mb-4 p-3 rounded-lg bg-bg-card/50 border border-white/5">
            <p className="text-xs text-gray-400 leading-relaxed">{problem.description}</p>
          </div>

          {/* Language selector */}
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-1.5 block">Language</label>
            <div className="flex gap-2">
              {["python", "javascript", "java", "cpp"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    language === lang
                      ? "bg-accent text-white"
                      : "bg-bg-card text-gray-400 hover:bg-bg-hover border border-white/5"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Code Editor */}
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-1.5 block flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5" /> Candidate Code
            </label>
            <div className="rounded-lg overflow-hidden border border-white/10" style={{ height: "300px" }}>
              <Editor
                height="300px"
                language={language}
                value={code}
                onChange={(val) => setCode(val || "")}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: "'Fira Code', 'Cascadia Code', monospace",
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  padding: { top: 12, bottom: 12 },
                  automaticLayout: true,
                }}
                loading={<div className="flex items-center justify-center h-full text-gray-500 text-sm">Loading editor...</div>}
              />
            </div>
          </div>

          {/* Run Button */}
          <button
            onClick={handleEvaluate}
            disabled={loading || !code.trim()}
            className="w-full py-3 rounded-xl bg-accent hover:bg-accent-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-all glow hover:glow-strong flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Running AI Evaluation...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Run AI Evaluation
              </>
            )}
          </button>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm"
            >
              {error}
            </motion.div>
          )}
        </motion.div>

        {/* Right: Progress + Results */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Agent Progress Timeline */}
          <AnimatePresence>
            {showSteps && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-card p-5 glow"
              >
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-accent-light" />
                  Agent Progress
                </h3>
                <AgentTimeline
                  steps={STEPS}
                  activeIdx={activeStepIdx}
                  loading={loading}
                  agentSteps={result?.agent_steps || []}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <EvaluationReport result={result} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Placeholder when no result */}
          {!result && !showSteps && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-12 text-center"
            >
              <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">
                Configure the interview and click "Run AI Evaluation" to see the results here.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
