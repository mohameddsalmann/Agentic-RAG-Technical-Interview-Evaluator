import "server-only";

import { Annotation } from "@langchain/langgraph";
import type { ScoreBreakdown, RubricEvidence, AgentStep } from "../../types/schemas";
import type { CodeAnalysis, ComplexityResult, EdgeCaseResult, ScoringResult, BiasCheckResult } from "../tools";

export const EvaluationState = Annotation.Root({
  // Input
  candidate_name: Annotation<string>,
  role: Annotation<string>,
  seniority: Annotation<string>,
  problem_title: Annotation<string>,
  problem_description: Annotation<string>,
  candidate_code: Annotation<string>,
  language: Annotation<string>,
  problem_type: Annotation<string>,

  // Intermediate results
  code_analysis: Annotation<CodeAnalysis | Record<string, never>>,
  retrieved_rubric: Annotation<RubricEvidence[]>,
  retrieved_rubric_evidence: Annotation<RubricEvidence[]>,
  problem_expectations: Annotation<RubricEvidence[]>,
  complexity: Annotation<ComplexityResult | Record<string, never>>,
  edge_cases: Annotation<EdgeCaseResult | Record<string, never>>,
  scoring: Annotation<ScoringResult | Record<string, never>>,
  bias_check: Annotation<BiasCheckResult | Record<string, never>>,

  // Final results
  scores: Annotation<ScoreBreakdown | Record<string, never>>,
  strengths: Annotation<string[]>,
  weaknesses: Annotation<string[]>,
  missed_edge_cases: Annotation<string[]>,
  overall_score: Annotation<number>,
  recommendation: Annotation<string>,
  final_feedback: Annotation<string>,
  bias_mitigation_notes: Annotation<string[]>,
  human_review_required: Annotation<boolean>,
  time_complexity: Annotation<string>,
  space_complexity: Annotation<string>,

  // Progress tracking
  agent_steps: Annotation<AgentStep[]>,
  demo_mode: Annotation<boolean>,

  // Validation
  validation_errors: Annotation<string[]>,
});

export type EvaluationStateType = typeof EvaluationState.State;

export function makeStep(
  steps: AgentStep[],
  stepName: string,
  status: AgentStep["status"] = "completed",
  detail: string = ""
): { agent_steps: AgentStep[] } {
  const newSteps = [...steps, {
    step: stepName,
    status,
    detail,
    timestamp: Date.now() / 1000,
  }];
  return { agent_steps: newSteps };
}
