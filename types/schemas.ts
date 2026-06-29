import { z } from "zod";

// ---------------------------------------------------------------------------
// Agent Step (timeline entry)
// ---------------------------------------------------------------------------

export const AgentStepSchema = z.object({
  step: z.string(),
  status: z.enum(["pending", "running", "completed", "error"]),
  detail: z.string().default(""),
  timestamp: z.number(),
});

// ---------------------------------------------------------------------------
// Score Breakdown
// ---------------------------------------------------------------------------

export const ScoreBreakdownSchema = z.object({
  correctness: z.number().int().min(0).max(100).default(0),
  complexity: z.number().int().min(0).max(100).default(0),
  edge_cases: z.number().int().min(0).max(100).default(0),
  readability: z.number().int().min(0).max(100).default(0),
  maintainability: z.number().int().min(0).max(100).default(0),
  communication: z.number().int().min(0).max(100).default(0),
});

// ---------------------------------------------------------------------------
// Rubric Evidence (citation)
// ---------------------------------------------------------------------------

export const RubricEvidenceSchema = z.object({
  source: z.string().default(""),
  snippet: z.string().default(""),
  relevance: z.number().min(0).max(1).default(0),
});

// ---------------------------------------------------------------------------
// Evaluate Request
// ---------------------------------------------------------------------------

export const EvaluateRequestSchema = z.object({
  candidate_name: z.string().min(1, "Candidate name is required"),
  role: z.string().min(1, "Role is required"),
  seniority: z.string().default("Mid"),
  problem_title: z.string().min(1, "Problem title is required"),
  problem_description: z.string().default(""),
  candidate_code: z.string().min(1, "Candidate code is required"),
  language: z.string().default("python"),
});

// ---------------------------------------------------------------------------
// Evaluate Response
// ---------------------------------------------------------------------------

export const EvaluateResponseSchema = z.object({
  candidate_name: z.string(),
  role: z.string(),
  problem_title: z.string(),
  overall_score: z.number().int().min(0).max(100),
  recommendation: z.string(),
  scores: ScoreBreakdownSchema,
  time_complexity: z.string().default(""),
  space_complexity: z.string().default(""),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  missed_edge_cases: z.array(z.string()).default([]),
  retrieved_rubric_evidence: z.array(RubricEvidenceSchema).default([]),
  bias_mitigation_notes: z.array(z.string()).default([]),
  final_feedback: z.string().default(""),
  human_review_required: z.boolean().default(true),
  demo_mode: z.boolean().default(false),
  agent_steps: z.array(AgentStepSchema).default([]),
});

// ---------------------------------------------------------------------------
// Health Response
// ---------------------------------------------------------------------------

export const HealthResponseSchema = z.object({
  status: z.string(),
  mode: z.enum(["production", "demo"]),
  llmAvailable: z.boolean(),
  vectorAvailable: z.boolean(),
  vectorProvider: z.enum(["upstash", "memory", "keyword"]),
  model: z.string().nullable(),
  embeddingModel: z.string().nullable(),
  knowledgeBaseLoaded: z.boolean(),
});

// ---------------------------------------------------------------------------
// Evaluation State (internal LangGraph state)
// ---------------------------------------------------------------------------

export const EvaluationStateSchema = z.object({
  // Input
  candidate_name: z.string(),
  role: z.string(),
  seniority: z.string(),
  problem_title: z.string(),
  problem_description: z.string().default(""),
  candidate_code: z.string(),
  language: z.string().default("python"),
  problem_type: z.string().default(""),

  // Intermediate results
  code_analysis: z.record(z.unknown()).optional(),
  retrieved_rubric: z.array(z.record(z.unknown())).default([]),
  retrieved_rubric_evidence: z.array(RubricEvidenceSchema).default([]),
  problem_expectations: z.array(z.record(z.unknown())).default([]),
  complexity: z.record(z.unknown()).default({}),
  edge_cases: z.record(z.unknown()).default({}),
  scoring: z.record(z.unknown()).default({}),
  bias_check: z.record(z.unknown()).default({}),

  // Final results
  scores: ScoreBreakdownSchema.optional(),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  missed_edge_cases: z.array(z.string()).default([]),
  overall_score: z.number().int().default(0),
  recommendation: z.string().default(""),
  final_feedback: z.string().default(""),
  bias_mitigation_notes: z.array(z.string()).default([]),
  human_review_required: z.boolean().default(true),

  // Progress tracking
  agent_steps: z.array(AgentStepSchema).default([]),
  demo_mode: z.boolean().default(false),

  // Validation
  validation_errors: z.array(z.string()).optional(),
});

// ---------------------------------------------------------------------------
// Inferred TypeScript Types
// ---------------------------------------------------------------------------

export type AgentStep = z.infer<typeof AgentStepSchema>;
export type ScoreBreakdown = z.infer<typeof ScoreBreakdownSchema>;
export type RubricEvidence = z.infer<typeof RubricEvidenceSchema>;
export type EvaluateRequest = z.infer<typeof EvaluateRequestSchema>;
export type EvaluateResponse = z.infer<typeof EvaluateResponseSchema>;
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
export type EvaluationState = z.infer<typeof EvaluationStateSchema>;
