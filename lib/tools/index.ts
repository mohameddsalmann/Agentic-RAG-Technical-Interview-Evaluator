import "server-only";

import { callLLM, parseJsonResponse, isDemoMode } from "../ai/provider";
import { retrieveRubric, retrieveProblemExpectations, type SearchResult } from "../rag/retriever";
import {
  CORRECTNESS_PROMPT,
  COMPLEXITY_PROMPT,
  EDGE_CASE_PROMPT,
  CODE_QUALITY_PROMPT,
  SCORING_PROMPT,
  BIAS_MITIGATION_PROMPT,
} from "../prompts";

// ---------------------------------------------------------------------------
// Tool 1: retrieveRubric
// ---------------------------------------------------------------------------

export async function toolRetrieveRubric(
  role: string,
  seniority: string,
  problemType: string,
  problemTitle: string = ""
): Promise<SearchResult[]> {
  return retrieveRubric(role, seniority, problemType, problemTitle, "", 5);
}

// ---------------------------------------------------------------------------
// Tool 2: retrieveProblemExpectations
// ---------------------------------------------------------------------------

export async function toolRetrieveProblemExpectations(
  problemTitle: string
): Promise<SearchResult[]> {
  return retrieveProblemExpectations(problemTitle);
}

// ---------------------------------------------------------------------------
// Tool 3: analyzeCodeStructure
// ---------------------------------------------------------------------------

export interface CodeAnalysis {
  language: string;
  functions: Array<{ name: string; args: string[]; line: number } | string>;
  classes: Array<{ name: string; methods: string[]; line: number } | string>;
  imports: string[];
  line_count: number;
  has_syntax_error: boolean;
  syntax_error_msg: string;
  key_logic: string[];
}

export function analyzeCodeStructure(candidateCode: string, language: string): CodeAnalysis {
  const result: CodeAnalysis = {
    language,
    functions: [],
    classes: [],
    imports: [],
    line_count: candidateCode.trim().split("\n").length,
    has_syntax_error: false,
    syntax_error_msg: "",
    key_logic: [],
  };

  if (language.toLowerCase() === "python") {
    analyzePython(candidateCode, result);
  } else {
    analyzeGeneric(candidateCode, result);
  }

  return result;
}

function analyzePython(code: string, result: CodeAnalysis): void {
  const lines = code.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    const funcMatch = trimmed.match(/^def\s+(\w+)\s*\((.*)\)/);
    if (funcMatch) {
      const args = funcMatch[2]
        .split(",")
        .map((a) => a.trim().split("=")[0].trim())
        .filter((a) => a.length > 0);
      result.functions.push({ name: funcMatch[1], args, line: i + 1 });
    }

    const classMatch = trimmed.match(/^class\s+(\w+)/);
    if (classMatch) {
      const methods: string[] = [];
      for (let j = i + 1; j < lines.length; j++) {
        const innerLine = lines[j].trim();
        if (innerLine.match(/^def\s+(\w+)/)) {
          const m = innerLine.match(/^def\s+(\w+)/);
          if (m) methods.push(m[1]);
        }
        if (lines[j].match(/^\S/) && j > i) break;
      }
      result.classes.push({ name: classMatch[1], methods, line: i + 1 });
    }

    if (trimmed.match(/^(import|from)\s+/)) {
      result.imports.push(trimmed);
    }

    if (trimmed.match(/^for\s+/)) {
      result.key_logic.push(`loop at line ${i + 1}`);
    }
    if (trimmed.match(/^while\s+/)) {
      result.key_logic.push(`while-loop at line ${i + 1}`);
    }
    if (trimmed.match(/^if\s+/)) {
      result.key_logic.push(`conditional at line ${i + 1}`);
    }
  }

  const hasDef = code.includes("def ");
  const hasClass = code.includes("class ");
  if (!hasDef && !hasClass && code.trim().length > 0) {
    result.has_syntax_error = true;
    result.syntax_error_msg = "No function or class definitions found in Python code";
  }
}

function analyzeGeneric(code: string, result: CodeAnalysis): void {
  const funcPattern = /(?:def|function|func|void|int|public|private|static)[\s\S]*?(\w+)\s*\(/g;
  let match: RegExpExecArray | null;
  while ((match = funcPattern.exec(code)) !== null) {
    result.functions.push(match[1]);
  }

  const classPattern = /(?:class|struct|interface)\s+(\w+)/g;
  while ((match = classPattern.exec(code)) !== null) {
    result.classes.push(match[1]);
  }

  const importPattern = /^(?:import|from|include|require|#include)\s+.*$/gm;
  while ((match = importPattern.exec(code)) !== null) {
    result.imports.push(match[0]);
  }
}

// ---------------------------------------------------------------------------
// Tool 4: estimateComplexity
// ---------------------------------------------------------------------------

export interface ComplexityResult {
  time_complexity: string;
  space_complexity: string;
  complexity_score: number;
  complexity_notes: string;
}

export async function estimateComplexity(
  candidateCode: string,
  language: string
): Promise<ComplexityResult> {
  if (!isDemoMode()) {
    const prompt = COMPLEXITY_PROMPT
      .replace("{language}", language)
      .replace("{candidate_code}", candidateCode);

    const response = await callLLM(prompt);
    const parsed = parseJsonResponse(response);
    if (Object.keys(parsed).length > 0) {
      return {
        time_complexity: (parsed.time_complexity as string) || "Unknown",
        space_complexity: (parsed.space_complexity as string) || "Unknown",
        complexity_score: (parsed.complexity_score as number) || 70,
        complexity_notes: (parsed.complexity_notes as string) || "",
      };
    }
  }

  const hasNestedLoop = detectNestedLoop(candidateCode, language);
  const hasLoop = detectLoop(candidateCode, language);
  const hasDict = candidateCode.includes("dict") || candidateCode.includes("{}") || candidateCode.includes("HashMap");
  const hasList = candidateCode.includes("list") || candidateCode.includes("[]") || candidateCode.includes("Array");

  let timeC: string;
  let score: number;

  if (hasNestedLoop) {
    timeC = "O(n^2)";
    score = 60;
  } else if (hasLoop) {
    timeC = "O(n)";
    score = 75;
  } else {
    timeC = "O(1)";
    score = 85;
  }

  const spaceC = hasDict || hasList ? "O(n)" : "O(1)";

  return {
    time_complexity: timeC,
    space_complexity: spaceC,
    complexity_score: score,
    complexity_notes: `Heuristic estimate based on code structure analysis. Time: ${timeC}, Space: ${spaceC}.`,
  };
}

function detectLoop(code: string, language: string): boolean {
  if (language.toLowerCase() === "python") {
    return /^(for|while)\s/m.test(code);
  }
  return /(for|while)\s*\(/m.test(code);
}

function detectNestedLoop(code: string, language: string): boolean {
  const lines = code.split("\n");
  let inLoop = false;
  let loopIndent = -1;

  for (const line of lines) {
    const trimmed = line.trim();
    const indent = line.length - trimmed.length;

    if (language.toLowerCase() === "python") {
      if (trimmed.match(/^(for|while)\s/)) {
        if (inLoop && indent > loopIndent) return true;
        inLoop = true;
        loopIndent = indent;
      } else if (inLoop && indent <= loopIndent && trimmed.length > 0 && !trimmed.startsWith("#")) {
        inLoop = false;
      }
    } else {
      if (trimmed.match(/(for|while)\s*\(/)) {
        if (inLoop) return true;
        inLoop = true;
      }
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// Tool 5: detectEdgeCases
// ---------------------------------------------------------------------------

export interface EdgeCaseResult {
  edge_case_score: number;
  missed_edge_cases: string[];
  edge_case_notes: string;
}

export async function detectEdgeCases(
  candidateCode: string,
  problemDescription: string,
  language: string,
  rubricEvidence: SearchResult[]
): Promise<EdgeCaseResult> {
  if (!isDemoMode()) {
    const evidenceText = rubricEvidence
      .map((e) => `- [${e.source}] ${e.snippet}`)
      .join("\n");
    const prompt = EDGE_CASE_PROMPT
      .replace("{problem_title}", "")
      .replace("{problem_description}", problemDescription)
      .replace("{language}", language)
      .replace("{candidate_code}", candidateCode)
      .replace("{rubric_evidence}", evidenceText);

    const response = await callLLM(prompt);
    const parsed = parseJsonResponse(response);
    if (Object.keys(parsed).length > 0) {
      return {
        edge_case_score: (parsed.edge_case_score as number) || 70,
        missed_edge_cases: (parsed.missed_edge_cases as string[]) || [],
        edge_case_notes: (parsed.edge_case_notes as string) || "",
      };
    }
  }

  const codeLower = candidateCode.toLowerCase();
  const missed: string[] = [];

  const checks: Array<[string, boolean, string]> = [
    ["empty input", codeLower.includes("not") && codeLower.includes("empty"), "No empty input handling detected"],
    ["null/None check", codeLower.includes("none") || codeLower.includes("null"), "No null/None checks detected"],
    ["negative values", codeLower.includes("0") && codeLower.includes("<"), "No negative value handling detected"],
    ["boundary conditions", codeLower.includes("==") || codeLower.includes("<=") || codeLower.includes(">="), "Limited boundary condition checks"],
    ["type validation", codeLower.includes("isinstance") || codeLower.includes("typeof"), "No type validation detected"],
    ["concurrency", codeLower.includes("lock") || codeLower.includes("thread") || codeLower.includes("mutex"), "No concurrency handling detected"],
    ["memory growth", codeLower.includes("clean") || codeLower.includes("purge") || codeLower.includes("del "), "No memory cleanup mechanism detected"],
  ];

  for (const [, found, msg] of checks) {
    if (!found) missed.push(msg);
  }

  let score: number;
  if (missed.length <= 1) score = 85;
  else if (missed.length <= 3) score = 70;
  else score = 55;

  return {
    edge_case_score: score,
    missed_edge_cases: missed,
    edge_case_notes: `Heuristic edge case analysis. Found ${missed.length} potential gaps.`,
  };
}

// ---------------------------------------------------------------------------
// Tool 6: scoreAgainstRubric
// ---------------------------------------------------------------------------

export interface ScoringResult {
  correctness_score: number;
  correctness_notes: string;
  strengths: string[];
  weaknesses: string[];
  readability_score: number;
  maintainability_score: number;
  communication_score: number;
  quality_notes: string;
}

export async function scoreAgainstRubric(
  analysis: CodeAnalysis,
  retrievedRubric: SearchResult[],
  candidateCode: string,
  problemDescription: string,
  language: string,
  role: string,
  seniority: string
): Promise<ScoringResult> {
  if (!isDemoMode()) {
    const evidenceText = retrievedRubric
      .map((e) => `- [${e.source}] ${e.snippet}`)
      .join("\n");

    const correctnessPrompt = CORRECTNESS_PROMPT
      .replace("{problem_title}", "")
      .replace("{problem_description}", problemDescription)
      .replace("{role}", role)
      .replace("{seniority}", seniority)
      .replace("{language}", language)
      .replace("{candidate_code}", candidateCode)
      .replace("{rubric_evidence}", evidenceText);

    const correctnessResp = await callLLM(correctnessPrompt);
    const correctnessParsed = parseJsonResponse(correctnessResp);

    const qualityPrompt = CODE_QUALITY_PROMPT
      .replace("{language}", language)
      .replace("{candidate_code}", candidateCode)
      .replace("{rubric_evidence}", evidenceText);

    const qualityResp = await callLLM(qualityPrompt);
    const qualityParsed = parseJsonResponse(qualityResp);

    if (Object.keys(correctnessParsed).length > 0 && Object.keys(qualityParsed).length > 0) {
      return {
        correctness_score: (correctnessParsed.correctness_score as number) || 70,
        correctness_notes: (correctnessParsed.correctness_notes as string) || "",
        strengths: (correctnessParsed.strengths as string[]) || [],
        weaknesses: (correctnessParsed.weaknesses as string[]) || [],
        readability_score: (qualityParsed.readability_score as number) || 70,
        maintainability_score: (qualityParsed.maintainability_score as number) || 70,
        communication_score: (qualityParsed.communication_score as number) || 70,
        quality_notes: (qualityParsed.quality_notes as string) || "",
      };
    }
  }

  return heuristicScoring(analysis, candidateCode);
}

function heuristicScoring(analysis: CodeAnalysis, candidateCode: string): ScoringResult {
  const codeLower = candidateCode.toLowerCase();
  const hasFunctions = analysis.functions.length > 0;
  const hasSyntaxError = analysis.has_syntax_error;
  const lineCount = analysis.line_count;

  let correctness = 70;
  if (hasSyntaxError) correctness -= 20;
  if (hasFunctions) correctness += 10;
  if (lineCount > 5) correctness += 5;
  correctness = Math.min(Math.max(correctness, 0), 100);

  let readability = 75;
  if (/[A-Z]/.test(candidateCode)) readability += 5;
  if (codeLower.includes("def ") || codeLower.includes("function ")) readability += 5;
  if (lineCount > 50) readability -= 10;
  if (lineCount < 5) readability -= 5;
  readability = Math.min(Math.max(readability, 0), 100);

  let maintainability = 75;
  if (analysis.functions.length > 1) maintainability += 10;
  if (analysis.classes.length > 0) maintainability += 5;
  if (lineCount > 100) maintainability -= 10;
  maintainability = Math.min(Math.max(maintainability, 0), 100);

  let communication = 65;
  if (candidateCode.includes("#") || candidateCode.includes("//") || candidateCode.includes('"""') || candidateCode.includes("'''")) {
    communication += 15;
  }
  if (codeLower.includes("docstring") || codeLower.includes("doc")) communication += 5;
  communication = Math.min(Math.max(communication, 0), 100);

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  if (hasFunctions) strengths.push("Code is organized into functions");
  if (!hasSyntaxError) strengths.push("No syntax errors detected");
  if (lineCount < 10) weaknesses.push("Solution may be too simplistic for the problem");
  if (!candidateCode.includes("#") && !candidateCode.includes("//") && !candidateCode.includes('"""')) {
    weaknesses.push("Lacks comments or documentation");
  }

  return {
    correctness_score: correctness,
    correctness_notes: "Heuristic correctness analysis based on code structure.",
    strengths,
    weaknesses,
    readability_score: readability,
    maintainability_score: maintainability,
    communication_score: communication,
    quality_notes: "Heuristic code quality analysis.",
  };
}

// ---------------------------------------------------------------------------
// Tool 7: generateFeedback
// ---------------------------------------------------------------------------

export interface FeedbackResult {
  overall_score: number;
  recommendation: string;
  final_feedback: string;
  bias_mitigation_notes: string[];
}

export async function generateFeedback(evaluationState: Record<string, unknown>): Promise<FeedbackResult> {
  const scores = (evaluationState.scores as Record<string, number>) || {};
  const weights: Record<string, number> = {
    correctness: 0.30,
    complexity: 0.15,
    edge_cases: 0.15,
    readability: 0.10,
    maintainability: 0.10,
    communication: 0.20,
  };

  let overall = 0;
  for (const [key, weight] of Object.entries(weights)) {
    overall += (scores[key] ?? 70) * weight;
  }
  overall = Math.round(overall);

  if (!isDemoMode()) {
    const prompt = SCORING_PROMPT.replace(
      "{evaluation_state}",
      JSON.stringify(evaluationState, null, 2)
    );
    const response = await callLLM(prompt);
    const parsed = parseJsonResponse(response);
    if (Object.keys(parsed).length > 0) {
      const recommendation = (parsed.recommendation as string) || recommendationFromScore(overall);
      return {
        overall_score: (parsed.overall_score as number) || overall,
        recommendation,
        final_feedback: (parsed.final_feedback as string) || "",
        bias_mitigation_notes: (parsed.bias_mitigation_notes as string[]) || [],
      };
    }
  }

  const recommendation = recommendationFromScore(overall);
  const strengths = (evaluationState.strengths as string[]) || [];
  const weaknesses = (evaluationState.weaknesses as string[]) || [];
  const missed = (evaluationState.missed_edge_cases as string[]) || [];

  const feedback =
    `The candidate's solution scores ${overall}/100 overall. ` +
    `Strengths include: ${strengths.slice(0, 3).join("; ") || "basic code structure"}. ` +
    `Areas for improvement: ${weaknesses.slice(0, 3).join("; ") || "general depth"}. ` +
    `Missed edge cases: ${missed.slice(0, 3).join("; ") || "none explicitly identified"}. ` +
    `Recommendation: ${recommendation}. Human review required.`;

  return {
    overall_score: overall,
    recommendation,
    final_feedback: feedback,
    bias_mitigation_notes: [
      "Feedback is based solely on technical code analysis.",
      "No personal traits or background information were considered.",
      "Human review is required before any hiring decision.",
    ],
  };
}

function recommendationFromScore(score: number): string {
  if (score >= 90) return "Strong Hire";
  if (score >= 75) return "Hire";
  if (score >= 65) return "Lean Hire";
  if (score >= 50) return "Lean No Hire";
  return "No Hire";
}

// ---------------------------------------------------------------------------
// Tool 8: applyBiasMitigationCheck
// ---------------------------------------------------------------------------

export interface BiasCheckResult {
  is_biased: boolean;
  bias_issues: string[];
  bias_mitigation_notes: string[];
}

export async function applyBiasMitigationCheck(feedback: string): Promise<BiasCheckResult> {
  if (!isDemoMode()) {
    const prompt = BIAS_MITIGATION_PROMPT.replace("{feedback}", feedback);
    const response = await callLLM(prompt);
    const parsed = parseJsonResponse(response);
    if (Object.keys(parsed).length > 0) {
      let notes = (parsed.corrected_notes as string[]) || [];
      if (parsed.is_biased && notes.length === 0) {
        notes = ["Feedback reviewed for bias - no issues found."];
      }
      if (notes.length === 0) {
        notes = [
          "Feedback is based solely on technical code analysis.",
          "No personal traits or background information were considered.",
        ];
      }
      return {
        is_biased: (parsed.is_biased as boolean) || false,
        bias_issues: (parsed.bias_issues as string[]) || [],
        bias_mitigation_notes: notes,
      };
    }
  }

  const biasedTerms = ["he", "she", "his", "her", "young", "old", "junior candidate", "senior candidate"];
  const feedbackLower = feedback.toLowerCase();
  const foundBias = biasedTerms.filter((term) => feedbackLower.includes(term));

  const notes = [
    "Feedback is based solely on technical code analysis.",
    "No personal traits or background information were considered.",
    "Human review is required before any hiring decision.",
  ];

  if (foundBias.length > 0) {
    notes.push(`Potential biased language detected: ${foundBias.join(", ")}. Review recommended.`);
  }

  return {
    is_biased: foundBias.length > 0,
    bias_issues: foundBias,
    bias_mitigation_notes: notes,
  };
}
