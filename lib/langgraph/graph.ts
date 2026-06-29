import "server-only";

import { StateGraph, END } from "@langchain/langgraph";

import { EvaluationState, makeStep, type EvaluationStateType } from "./state";
import {
  analyzeCodeStructure,
  toolRetrieveRubric,
  toolRetrieveProblemExpectations,
  estimateComplexity,
  detectEdgeCases,
  scoreAgainstRubric,
  generateFeedback,
  applyBiasMitigationCheck,
} from "../tools";
import { isDemoMode } from "../ai/provider";
import type { EvaluateRequest, EvaluateResponse } from "../../types/schemas";
import type { RubricEvidence, ScoreBreakdown } from "../../types/schemas";

// ---------------------------------------------------------------------------
// Node 1: Input Validation
// ---------------------------------------------------------------------------

async function inputValidationNode(
  state: EvaluationStateType
): Promise<Partial<EvaluationStateType>> {
  const errors: string[] = [];
  if (!state.candidate_code?.trim()) errors.push("Candidate code is empty");
  if (!state.problem_title?.trim()) errors.push("Problem title is required");
  if (!state.role?.trim()) errors.push("Role is required");

  if (errors.length > 0) {
    return {
      ...makeStep(state.agent_steps, "Input Validation", "error", errors.join("; ")),
      validation_errors: errors,
    };
  }

  let language = state.language || "python";
  const code = state.candidate_code || "";
  if (!language) {
    if (code.includes("def ") || code.includes("import ")) language = "python";
    else if (code.includes("function ") || code.includes("const ") || code.includes("let ")) language = "javascript";
    else if (code.includes("#include")) language = "cpp";
    else language = "python";
  }

  const problemTitleLower = (state.problem_title || "").toLowerCase();
  let problemType = "Algorithm";
  if (problemTitleLower.includes("rate limiter") || problemTitleLower.includes("design")) {
    problemType = "System Design";
  } else if (problemTitleLower.includes("rag")) {
    problemType = "RAG System";
  } else if (problemTitleLower.includes("api") || problemTitleLower.includes("endpoint")) {
    problemType = "Backend API";
  }

  return {
    language,
    problem_type: problemType,
    ...makeStep(state.agent_steps, "Input Validation", "completed", `Language: ${language}, Problem type: ${problemType}`),
  };
}

// ---------------------------------------------------------------------------
// Node 2: Code Parsing
// ---------------------------------------------------------------------------

async function codeParsingNode(
  state: EvaluationStateType
): Promise<Partial<EvaluationStateType>> {
  const analysis = analyzeCodeStructure(state.candidate_code, state.language);
  const funcCount = Array.isArray(analysis.functions) ? analysis.functions.length : 0;
  const classCount = Array.isArray(analysis.classes) ? analysis.classes.length : 0;
  let detail = `Found ${funcCount} functions, ${classCount} classes`;
  if (analysis.has_syntax_error) {
    detail += `, SYNTAX ERROR: ${analysis.syntax_error_msg}`;
  }

  return {
    code_analysis: analysis,
    ...makeStep(state.agent_steps, "Code Parsing", "completed", detail),
  };
}

// ---------------------------------------------------------------------------
// Node 3: RAG Retrieval
// ---------------------------------------------------------------------------

async function ragRetrievalNode(
  state: EvaluationStateType
): Promise<Partial<EvaluationStateType>> {
  const rubric = await toolRetrieveRubric(
    state.role, state.seniority, state.problem_type, state.problem_title
  );
  const expectations = await toolRetrieveProblemExpectations(state.problem_title);
  const allEvidence: RubricEvidence[] = [...rubric, ...expectations];

  return {
    retrieved_rubric: allEvidence,
    retrieved_rubric_evidence: allEvidence,
    ...makeStep(state.agent_steps, "RAG Retrieval", "completed", `Retrieved ${allEvidence.length} rubric chunks`),
  };
}

// ---------------------------------------------------------------------------
// Node 4: Correctness Evaluation
// ---------------------------------------------------------------------------

async function correctnessNode(
  state: EvaluationStateType
): Promise<Partial<EvaluationStateType>> {
  const analysis = state.code_analysis as Record<string, unknown>;
  const scoring = await scoreAgainstRubric(
    { ...analysis, problem_title: state.problem_title } as never,
    state.retrieved_rubric,
    state.candidate_code,
    state.problem_description,
    state.language,
    state.role,
    state.seniority
  );

  return {
    scoring,
    strengths: scoring.strengths,
    weaknesses: scoring.weaknesses,
    ...makeStep(state.agent_steps, "Correctness Evaluation", "completed", `Correctness score: ${scoring.correctness_score}`),
  };
}

// ---------------------------------------------------------------------------
// Node 5: Complexity Analysis
// ---------------------------------------------------------------------------

async function complexityNode(
  state: EvaluationStateType
): Promise<Partial<EvaluationStateType>> {
  const complexity = await estimateComplexity(state.candidate_code, state.language);

  return {
    complexity,
    ...makeStep(state.agent_steps, "Complexity Analysis", "completed", `Time: ${complexity.time_complexity}, Space: ${complexity.space_complexity}`),
  };
}

// ---------------------------------------------------------------------------
// Node 6: Edge Case Detection
// ---------------------------------------------------------------------------

async function edgeCaseNode(
  state: EvaluationStateType
): Promise<Partial<EvaluationStateType>> {
  const edgeCases = await detectEdgeCases(
    state.candidate_code,
    state.problem_description,
    state.language,
    state.retrieved_rubric
  );

  return {
    edge_cases: edgeCases,
    missed_edge_cases: edgeCases.missed_edge_cases,
    ...makeStep(state.agent_steps, "Edge Case Detection", "completed", `Found ${edgeCases.missed_edge_cases.length} missed edge cases`),
  };
}

// ---------------------------------------------------------------------------
// Node 7: Code Quality Assessment
// ---------------------------------------------------------------------------

async function codeQualityNode(
  state: EvaluationStateType
): Promise<Partial<EvaluationStateType>> {
  const scoring = state.scoring as Record<string, number>;
  const detail = `Readability: ${scoring?.readability_score ?? 0}, Maintainability: ${scoring?.maintainability_score ?? 0}`;

  return {
    ...makeStep(state.agent_steps, "Code Quality Assessment", "completed", detail),
  };
}

// ---------------------------------------------------------------------------
// Node 8: Bias Mitigation
// ---------------------------------------------------------------------------

async function biasMitigationNode(
  state: EvaluationStateType
): Promise<Partial<EvaluationStateType>> {
  const feedbackSoFar = [...state.strengths, ...state.weaknesses].join(" ");
  const biasCheck = await applyBiasMitigationCheck(feedbackSoFar);
  const detail = biasCheck.is_biased ? "Biased" : "Clean - no bias detected";

  return {
    bias_check: biasCheck,
    ...makeStep(state.agent_steps, "Bias Mitigation", "completed", detail),
  };
}

// ---------------------------------------------------------------------------
// Node 9: Scoring
// ---------------------------------------------------------------------------

async function scoringNode(
  state: EvaluationStateType
): Promise<Partial<EvaluationStateType>> {
  const scoring = state.scoring as Record<string, number>;
  const complexity = state.complexity as Record<string, number>;
  const edgeCases = state.edge_cases as Record<string, number>;

  const scores: ScoreBreakdown = {
    correctness: scoring?.correctness_score ?? 70,
    complexity: complexity?.complexity_score ?? 70,
    edge_cases: edgeCases?.edge_case_score ?? 70,
    readability: scoring?.readability_score ?? 70,
    maintainability: scoring?.maintainability_score ?? 70,
    communication: scoring?.communication_score ?? 70,
  };

  return {
    scores,
    ...makeStep(state.agent_steps, "Scoring", "completed", `Scores: ${JSON.stringify(scores)}`),
  };
}

// ---------------------------------------------------------------------------
// Node 10: Recommendation
// ---------------------------------------------------------------------------

async function recommendationNode(
  state: EvaluationStateType
): Promise<Partial<EvaluationStateType>> {
  const evalState = {
    scores: state.scores,
    strengths: state.strengths,
    weaknesses: state.weaknesses,
    missed_edge_cases: state.missed_edge_cases,
    code_analysis: state.code_analysis,
    complexity: state.complexity,
  };

  const result = await generateFeedback(evalState as Record<string, unknown>);

  const biasCheck = state.bias_check as Record<string, unknown>;
  const biasNotes = (biasCheck?.bias_mitigation_notes as string[]) || [];
  const allBiasNotes = [...new Set([...result.bias_mitigation_notes, ...biasNotes])];

  return {
    overall_score: result.overall_score,
    recommendation: result.recommendation,
    final_feedback: result.final_feedback,
    bias_mitigation_notes: allBiasNotes,
    human_review_required: true,
    ...makeStep(state.agent_steps, "Recommendation", "completed", `Recommendation: ${result.recommendation}, Score: ${result.overall_score}`),
  };
}

// ---------------------------------------------------------------------------
// Node 11: Report Generation
// ---------------------------------------------------------------------------

async function reportGenerationNode(
  state: EvaluationStateType
): Promise<Partial<EvaluationStateType>> {
  const complexity = state.complexity as Record<string, string>;

  return {
    time_complexity: complexity?.time_complexity || "Unknown",
    space_complexity: complexity?.space_complexity || "Unknown",
    demo_mode: isDemoMode(),
    ...makeStep(state.agent_steps, "Report Generation", "completed", "Report generated successfully"),
  };
}

// ---------------------------------------------------------------------------
// Build and compile graph
// ---------------------------------------------------------------------------

let _compiledGraph: ReturnType<typeof buildGraph> | null = null;

function buildGraph() {
  // LangGraph JS uses a fluent builder pattern for type inference.
  // We cast to a generic type to allow sequential addNode/addEdge calls.
  const workflow = new StateGraph(EvaluationState) as StateGraph<typeof EvaluationState.State> & {
    addNode: (name: string, fn: (state: EvaluationStateType) => Promise<Partial<EvaluationStateType>>) => void;
    addEdge: (from: string, to: string) => void;
    compile: () => unknown;
  };

  workflow.addNode("node_input_validation", inputValidationNode);
  workflow.addNode("node_code_parsing", codeParsingNode);
  workflow.addNode("node_rag_retrieval", ragRetrievalNode);
  workflow.addNode("node_correctness", correctnessNode);
  workflow.addNode("node_complexity", complexityNode);
  workflow.addNode("node_edge_case", edgeCaseNode);
  workflow.addNode("node_code_quality", codeQualityNode);
  workflow.addNode("node_bias_mitigation", biasMitigationNode);
  workflow.addNode("node_scoring", scoringNode);
  workflow.addNode("node_recommendation", recommendationNode);
  workflow.addNode("node_report_generation", reportGenerationNode);

  workflow.addEdge("__start__", "node_input_validation");
  workflow.addEdge("node_input_validation", "node_code_parsing");
  workflow.addEdge("node_code_parsing", "node_rag_retrieval");
  workflow.addEdge("node_rag_retrieval", "node_correctness");
  workflow.addEdge("node_correctness", "node_complexity");
  workflow.addEdge("node_complexity", "node_edge_case");
  workflow.addEdge("node_edge_case", "node_code_quality");
  workflow.addEdge("node_code_quality", "node_bias_mitigation");
  workflow.addEdge("node_bias_mitigation", "node_scoring");
  workflow.addEdge("node_scoring", "node_recommendation");
  workflow.addEdge("node_recommendation", "node_report_generation");
  workflow.addEdge("node_report_generation", END);

  return workflow.compile() as { invoke: (state: EvaluationStateType) => Promise<unknown> };
}

function getCompiledGraph() {
  if (!_compiledGraph) {
    _compiledGraph = buildGraph();
  }
  return _compiledGraph;
}

// ---------------------------------------------------------------------------
// Sequential fallback (if LangGraph fails)
// ---------------------------------------------------------------------------

async function runSequential(
  state: EvaluationStateType
): Promise<EvaluationStateType> {
  let s = state;
  const nodes = [
    inputValidationNode, codeParsingNode, ragRetrievalNode,
    correctnessNode, complexityNode, edgeCaseNode,
    codeQualityNode, biasMitigationNode, scoringNode,
    recommendationNode, reportGenerationNode,
  ];

  for (const node of nodes) {
    const update = await node(s);
    s = { ...s, ...update } as EvaluationStateType;
  }

  return s;
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export async function runEvaluation(request: EvaluateRequest): Promise<EvaluateResponse> {
  const initialState: EvaluationStateType = {
    candidate_name: request.candidate_name,
    role: request.role,
    seniority: request.seniority,
    problem_title: request.problem_title,
    problem_description: request.problem_description,
    candidate_code: request.candidate_code,
    language: request.language,
    problem_type: "",
    code_analysis: {},
    retrieved_rubric: [],
    retrieved_rubric_evidence: [],
    problem_expectations: [],
    complexity: {},
    edge_cases: {},
    scoring: {},
    bias_check: {},
    scores: {} as ScoreBreakdown,
    strengths: [],
    weaknesses: [],
    missed_edge_cases: [],
    overall_score: 0,
    recommendation: "",
    final_feedback: "",
    bias_mitigation_notes: [],
    human_review_required: true,
    time_complexity: "",
    space_complexity: "",
    agent_steps: [],
    demo_mode: isDemoMode(),
    validation_errors: [],
  };

  let result: EvaluationStateType;

  try {
    const graph = getCompiledGraph();
    const output = await graph.invoke(initialState);
    result = output as EvaluationStateType;
  } catch (err) {
    console.error(`[LangGraph] Graph execution failed, using sequential fallback: ${err}`);
    result = await runSequential(initialState);
  }

  const scores = (result.scores || {}) as ScoreBreakdown;

  return {
    candidate_name: result.candidate_name,
    role: result.role,
    problem_title: result.problem_title,
    overall_score: result.overall_score,
    recommendation: result.recommendation,
    scores,
    time_complexity: result.time_complexity || "",
    space_complexity: result.space_complexity || "",
    strengths: result.strengths || [],
    weaknesses: result.weaknesses || [],
    missed_edge_cases: result.missed_edge_cases || [],
    retrieved_rubric_evidence: result.retrieved_rubric_evidence || [],
    bias_mitigation_notes: result.bias_mitigation_notes || [],
    final_feedback: result.final_feedback || "",
    human_review_required: result.human_review_required ?? true,
    demo_mode: result.demo_mode ?? false,
    agent_steps: result.agent_steps || [],
  };
}
