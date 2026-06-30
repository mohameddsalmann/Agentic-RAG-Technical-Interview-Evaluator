"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Play, Loader2, RotateCcw, CheckCircle2, AlertCircle, Info } from "lucide-react";
import {
  ROLES, SENIORITIES, PROBLEMS, DEFAULT_CODE,
  type EvaluateRequest, type EvaluateResponse,
} from "@/types";
import { runEvaluation } from "@/lib/api";
import { ConfigPanel } from "./ConfigPanel";
import { ResultsPanel } from "./ResultsPanel";
import { MobileTabs, type MobileTabId } from "./MobileTabs";
import { StepGuide } from "./StepGuide";
import { EditorSection } from "./EditorSection";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(
  () => import("./MonacoEditor").then((mod) => mod.MonacoEditor),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full text-muted text-sm">
        Loading code editor interface...
      </div>
    )
  }
);

const STEPS = [
  "Validating input",
  "Parsing code",
  "Retrieving rubric",
  "Checking correctness",
  "Analyzing complexity",
  "Detecting edge cases",
  "Scoring result",
  "Generating report",
];

type ToastType = "success" | "error";
interface Toast {
  message: string;
  type: ToastType;
}

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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<Toast | null>(null);

  // UI state
  const [configCollapsed, setConfigCollapsed] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTabId>("code");
  const [isEditorExpanded, setIsEditorExpanded] = useState(false);
  const [langHint, setLangHint] = useState<string | null>(null);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const problem = PROBLEMS[problemKey];

  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ message, type });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 2500);
  }, []);

  const hasConfig = !!(candidateName.trim() && role && seniority && problemKey);
  const hasCode = !!code.trim();

  const clearFieldError = useCallback((field: string) => {
    setValidationErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleCandidateNameChange = useCallback((v: string) => {
    setCandidateName(v);
    clearFieldError("candidateName");
  }, [clearFieldError]);

  const handleRoleChange = useCallback((v: string) => {
    setRole(v);
    clearFieldError("role");
  }, [clearFieldError]);

  const handleSeniorityChange = useCallback((v: string) => {
    setSeniority(v);
    clearFieldError("seniority");
  }, [clearFieldError]);

  const handleProblemKeyChange = useCallback((v: string) => {
    setProblemKey(v);
    clearFieldError("problemKey");
  }, [clearFieldError]);

  const handleLanguageChange = useCallback((v: string) => {
    if (code.trim() && v !== language) {
      const labels: Record<string, string> = { python: "Python", javascript: "JavaScript", java: "Java", cpp: "C++" };
      setLangHint(`Language changed to ${labels[v] || v}. Existing code was kept.`);
      setTimeout(() => setLangHint(null), 3000);
    }
    setLanguage(v);
    clearFieldError("language");
  }, [code, language, clearFieldError]);

  const handleCodeChange = useCallback((v: string) => {
    setCode(v);
    clearFieldError("code");
  }, [clearFieldError]);

  const validate = useCallback((): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!candidateName.trim()) errs.candidateName = "Candidate name is required";
    if (!role) errs.role = "Select a role";
    if (!seniority) errs.seniority = "Select seniority";
    if (!problemKey) errs.problemKey = "Select a problem";
    if (!language) errs.language = "Select a language";
    if (!code.trim()) errs.code = "Paste candidate code before running";
    return errs;
  }, [candidateName, role, seniority, problemKey, language, code]);

  const handleEvaluate = useCallback(async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setValidationErrors(errs);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setActiveStepIdx(0);
    setValidationErrors({});
    setConfigCollapsed(true);

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

      const res = await runEvaluation(req);

      clearInterval(stepInterval);
      setActiveStepIdx(STEPS.length);
      setResult(res);

      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        setMobileTab("report");
      }
    } catch (err) {
      clearInterval(stepInterval);
      setError(err instanceof Error ? err.message : "Evaluation failed");
    } finally {
      setLoading(false);
    }
  }, [validate, candidateName, role, seniority, problem, code, language]);

  const handleReset = useCallback(() => {
    setResult(null);
    setError(null);
    setActiveStepIdx(-1);
    setValidationErrors({});
  }, []);

  const handleCopyReport = useCallback(async () => {
    if (!result) return;
    const lines: string[] = [
      `AI Interview Evaluation Report`,
      `Candidate: ${result.candidate_name}`,
      `Role: ${result.role}`,
      `Problem: ${result.problem_title}`,
      ``,
      `Overall Score: ${result.overall_score}/100`,
      `Recommendation: ${result.recommendation}`,
      ``,
      `Score Breakdown:`,
      ...Object.entries(result.scores).map(([k, v]) => `  ${k}: ${v}%`),
      ``,
      `Time Complexity: ${result.time_complexity}`,
      `Space Complexity: ${result.space_complexity}`,
      ``,
      `Strengths:`,
      ...result.strengths.map((s) => `  - ${s}`),
      ``,
      `Areas for Improvement:`,
      ...result.weaknesses.map((w) => `  - ${w}`),
      ``,
      `Missed Edge Cases:`,
      ...result.missed_edge_cases.map((e) => `  - ${e}`),
      ``,
      `Final Feedback:`,
      result.final_feedback,
      ``,
      `Human Review Required: ${result.human_review_required ? "Yes" : "No"}`,
    ];

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      showToast("Report copied", "success");
    } catch {
      showToast("Could not copy report", "error");
    }
  }, [result, showToast]);

  const handleExportJSON = useCallback(() => {
    if (!result) return;
    try {
      const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `evaluation-${result.candidate_name.replace(/\s+/g, "-").toLowerCase()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("JSON exported", "success");
    } catch {
      showToast("Could not export JSON", "error");
    }
  }, [result, showToast]);

  // Keyboard shortcut: Ctrl/Cmd+Enter to run
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (!loading) handleEvaluate();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleEvaluate, loading]);

  // Cleanup toast timer
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const isReady = hasConfig && hasCode;
  const buttonLabel = loading
    ? "Evaluating…"
    : error
    ? "Retry Evaluation"
    : result
    ? "Run New Evaluation"
    : isReady
    ? "Run Evaluation"
    : "Complete setup first";

  return (
    <div className="flex flex-col h-full lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-border overflow-hidden">
      {/* Left panel: step guide + config + editor + sticky run button */}
      <div className="flex flex-col h-full lg:w-[58%] min-h-0 overflow-hidden">
        {/* Step Guide */}
        <StepGuide
          hasConfig={hasConfig}
          hasCode={hasCode}
          hasResult={!!result}
          loading={loading}
        />

        {/* Config card section */}
        <div className={`${mobileTab === "config" ? "block" : "hidden"} lg:block flex-shrink-0`}>
          <ConfigPanel
            candidateName={candidateName}
            setCandidateName={handleCandidateNameChange}
            role={role}
            setRole={handleRoleChange}
            seniority={seniority}
            setSeniority={handleSeniorityChange}
            problemKey={problemKey}
            setProblemKey={handleProblemKeyChange}
            language={language}
            setLanguage={handleLanguageChange}
            collapsed={configCollapsed}
            onToggle={() => setConfigCollapsed(!configCollapsed)}
            errors={validationErrors}
          />
        </div>

        {/* Language hint toast */}
        {langHint && (
          <div className="flex items-center gap-2 px-4 py-1.5 bg-accent/5 border-b border-accent/20 text-xs text-accent animate-fade-in">
            <Info className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{langHint}</span>
          </div>
        )}

        {/* Editor section */}
        <div
          className={`${mobileTab === "code" ? "flex" : "hidden"} lg:flex flex-1 min-h-0 min-h-[60vh] lg:min-h-0 relative bg-bg-primary`}
        >
          <EditorSection
            language={language}
            problemKey={problemKey}
            code={code}
            onCodeChange={handleCodeChange}
            isExpanded={isEditorExpanded}
            onExpand={() => setIsEditorExpanded(true)}
            onCloseExpand={() => setIsEditorExpanded(false)}
          >
            <div className="flex-1 h-full w-full">
              <MonacoEditor
                language={language}
                value={code}
                onChange={handleCodeChange}
              />
            </div>
          </EditorSection>
        </div>

        {/* Status row + Run button */}
        <div className="flex-shrink-0 p-4 border-t border-border bg-bg-card space-y-2.5">
          {/* Status row */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3 text-muted">
              <span className="flex items-center gap-1.5">
                {hasCode ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-warning" />
                )}
                {hasCode ? "Code detected" : "No code yet"}
              </span>
              <span className="text-border">|</span>
              <span>Language: <span className="text-accent font-semibold">{language}</span></span>
            </div>
            <span className={`font-semibold ${isReady ? "text-success" : "text-warning"}`}>
              {isReady ? "Ready to evaluate" : "Complete setup first"}
            </span>
          </div>

          {/* Run button */}
          <button
            onClick={handleEvaluate}
            disabled={loading}
            className={`w-full py-3 rounded-md text-sm font-semibold tracking-wide transition-all flex items-center justify-center gap-2.5 focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-card focus:outline-none ${
              loading
                ? "bg-accent/60 cursor-wait text-white"
                : isReady
                ? "bg-accent hover:bg-accent/90 active:scale-[0.995] text-white shadow-md shadow-accent/5"
                : "bg-bg-elevated border border-border text-muted hover:border-accent hover:text-[#f0f6fc]"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {buttonLabel}
              </>
            ) : result ? (
              <>
                <RotateCcw className="w-4 h-4" />
                {buttonLabel}
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                {buttonLabel}
              </>
            )}
          </button>

          {/* Keyboard shortcut hint */}
          <div className="text-center text-[11px] text-muted/60">
            Press <kbd className="px-1.5 py-0.5 rounded bg-bg-elevated border border-border text-[10px] font-mono">Ctrl/Cmd + Enter</kbd> to run
          </div>
        </div>
      </div>

      {/* Right panel: results panel */}
      <div
        className={`${(mobileTab === "report" || mobileTab === "timeline") ? "flex" : "hidden"} lg:flex lg:w-[42%] min-h-0 overflow-hidden`}
      >
        <ResultsPanel
          result={result}
          loading={loading}
          activeStepIdx={activeStepIdx}
          agentSteps={result?.agent_steps || []}
          steps={STEPS}
          error={error}
          onReset={handleReset}
          onCopy={handleCopyReport}
          onExport={handleExportJSON}
        />
      </div>

      {/* Mobile tabs */}
      <div className="lg:hidden">
        <MobileTabs
          active={mobileTab}
          onChange={setMobileTab}
          hasResult={!!result}
          loading={loading}
          onRun={handleEvaluate}
          canRun={isReady && !loading}
          isRunning={loading}
        />
      </div>

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div
            className={`flex items-center gap-2 px-4 py-2.5 rounded-md border text-sm font-medium shadow-lg ${
              toast.type === "success"
                ? "bg-success/10 border-success/30 text-success"
                : "bg-danger/10 border-danger/30 text-danger"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
