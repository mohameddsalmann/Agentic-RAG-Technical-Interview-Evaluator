"use client";

import { ChevronDown, ChevronUp, User, Edit2 } from "lucide-react";
import { ROLES, SENIORITIES, PROBLEMS } from "@/types";

interface ConfigPanelProps {
  candidateName: string;
  setCandidateName: (v: string) => void;
  role: string;
  setRole: (v: string) => void;
  seniority: string;
  setSeniority: (v: string) => void;
  problemKey: string;
  setProblemKey: (v: string) => void;
  language: string;
  setLanguage: (v: string) => void;
  collapsed: boolean;
  onToggle: () => void;
  errors?: Record<string, string>;
}

const LANGUAGES = ["python", "javascript", "java", "cpp"];

export function ConfigPanel({
  candidateName,
  setCandidateName,
  role,
  setRole,
  seniority,
  setSeniority,
  problemKey,
  setProblemKey,
  language,
  setLanguage,
  collapsed,
  onToggle,
  errors = {},
}: ConfigPanelProps) {
  const problem = PROBLEMS[problemKey];

  const fieldError = (key: string) =>
    errors[key] ? (
      <p className="text-xs text-danger mt-1 leading-relaxed">{errors[key]}</p>
    ) : null;

  const inputErrorClass = (key: string) =>
    errors[key] ? "border-danger/50 focus:border-danger focus:ring-danger" : "";

  return (
    <div className="border-b border-border bg-bg-card">
      {/* Expanded/Collapsed Toggle Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#21262d]">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-accent" />
          <span className="text-sm font-semibold text-[#f0f6fc]">
            Interview Setup
          </span>
        </div>

        <button
          onClick={onToggle}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-bg-elevated border border-border text-xs text-muted hover:text-[#f0f6fc] hover:border-accent transition-all"
          aria-expanded={!collapsed}
        >
          {collapsed ? (
            <>
              <Edit2 className="w-3.5 h-3.5 text-accent" />
              <span>Edit setup</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              <span>Collapse</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {/* Collapsed State Summary */}
      {collapsed ? (
        <div className="px-5 py-2.5 bg-bg-elevated/40 text-xs text-muted flex flex-wrap items-center gap-y-1 gap-x-4">
          <div className="flex items-center gap-1.5">
            <span className="text-text-secondary">Name:</span>
            <span className="text-[#f0f6fc] font-semibold">{candidateName || "Unnamed Candidate"}</span>
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-text-secondary">Role:</span>
            <span className="text-[#f0f6fc] font-semibold">{seniority} {role}</span>
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-text-secondary">Problem:</span>
            <span className="text-[#f0f6fc] font-semibold">{problem?.title}</span>
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-1.5">
            <span className="text-text-secondary">Lang:</span>
            <span className="text-accent font-semibold">{language}</span>
          </div>
        </div>
      ) : (
        /* Expanded Config Form */
        <div className="p-5 space-y-4 animate-fade-in">
          <p className="text-xs text-muted leading-relaxed">
            Choose the role, seniority, problem, and programming language.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Candidate Name */}
            <div>
              <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
                Candidate Name
              </label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                className={`w-full px-3 py-2 rounded-md border border-border bg-bg-elevated text-[#f0f6fc] text-sm focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-all placeholder-muted/50 ${inputErrorClass("candidateName")}`}
                placeholder="e.g. Ahmed Hassan"
              />
              {fieldError("candidateName")}
            </div>

            {/* Role select */}
            <div>
              <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={`w-full px-3 py-2 rounded-md border border-border bg-bg-elevated text-[#f0f6fc] text-sm focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-all cursor-pointer ${inputErrorClass("role")}`}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r} className="bg-bg-card text-[#f0f6fc]">
                    {r}
                  </option>
                ))}
              </select>
              {fieldError("role")}
            </div>

            {/* Seniority select */}
            <div>
              <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
                Seniority
              </label>
              <select
                value={seniority}
                onChange={(e) => setSeniority(e.target.value)}
                className={`w-full px-3 py-2 rounded-md border border-border bg-bg-elevated text-[#f0f6fc] text-sm focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-all cursor-pointer ${inputErrorClass("seniority")}`}
              >
                {SENIORITIES.map((s) => (
                  <option key={s} value={s} className="bg-bg-card text-[#f0f6fc]">
                    {s}
                  </option>
                ))}
              </select>
              {fieldError("seniority")}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Problem select */}
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
                Problem
              </label>
              <select
                value={problemKey}
                onChange={(e) => setProblemKey(e.target.value)}
                className={`w-full px-3 py-2 rounded-md border border-border bg-bg-elevated text-[#f0f6fc] text-sm focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-all cursor-pointer mb-2 ${inputErrorClass("problemKey")}`}
              >
                {Object.entries(PROBLEMS).map(([key, p]) => (
                  <option key={key} value={key} className="bg-bg-card text-[#f0f6fc]">
                    {p.title}
                  </option>
                ))}
              </select>
              {fieldError("problemKey")}
              <div className="p-3 rounded border border-border bg-bg-elevated/30">
                <span className="text-xs text-muted leading-relaxed line-clamp-2 block">
                  {problem?.description}
                </span>
              </div>
            </div>

            {/* Language Selection */}
            <div>
              <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
                Language
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-3 py-2 rounded border text-xs font-semibold transition-all ${
                      language === lang
                        ? "bg-accent/10 border-accent text-accent"
                        : "bg-bg-elevated border-border text-muted hover:text-[#f0f6fc] hover:border-accent"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
              {fieldError("language")}
            </div>
          </div>
        </div>
      )}    </div>
  );
}
