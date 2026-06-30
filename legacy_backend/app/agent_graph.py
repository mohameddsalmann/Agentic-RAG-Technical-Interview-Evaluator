"""LangGraph-based multi-step agentic workflow for technical interview evaluation."""

import time
import json
from typing import TypedDict, Any

from . import tools
from .config import DEMO_MODE
from .prompts import SYSTEM_PROMPT


# ---------------------------------------------------------------------------
# State definition
# ---------------------------------------------------------------------------

class EvaluationState(TypedDict, total=False):
    # Input
    candidate_name: str
    role: str
    seniority: str
    problem_title: str
    problem_description: str
    candidate_code: str
    language: str
    problem_type: str

    # Intermediate results
    code_analysis: dict
    retrieved_rubric: list[dict]
    problem_expectations: list[dict]
    complexity: dict
    edge_cases: dict
    scoring: dict
    bias_check: dict

    # Final results
    scores: dict
    strengths: list[str]
    weaknesses: list[str]
    missed_edge_cases: list[str]
    overall_score: int
    recommendation: str
    final_feedback: str
    bias_mitigation_notes: list[str]
    human_review_required: bool

    # Progress tracking
    agent_steps: list[dict]
    demo_mode: bool


def _step(state: EvaluationState, step_name: str, status: str = "completed", detail: str = "") -> dict:
    """Record a step in the agent progress timeline."""
    steps = state.get("agent_steps", [])
    steps.append({
        "step": step_name,
        "status": status,
        "detail": detail,
        "timestamp": time.time(),
    })
    return {"agent_steps": steps}


# ---------------------------------------------------------------------------
# Workflow Nodes
# ---------------------------------------------------------------------------

def input_validation_node(state: EvaluationState) -> dict:
    """Node 1: Validate inputs and detect language."""
    errors = []
    if not state.get("candidate_code", "").strip():
        errors.append("Candidate code is empty")
    if not state.get("problem_title", "").strip():
        errors.append("Problem title is required")
    if not state.get("role", "").strip():
        errors.append("Role is required")

    if errors:
        return {**_step(state, "Input Validation", "error", "; ".join(errors)), "validation_errors": errors}

    # Auto-detect language if not specified
    language = state.get("language", "python")
    code = state.get("candidate_code", "")
    if not language:
        if "def " in code or "import " in code:
            language = "python"
        elif "function " in code or "const " in code or "let " in code:
            language = "javascript"
        elif "#include" in code:
            language = "cpp"
        else:
            language = "python"

    # Determine problem type
    problem_title = state.get("problem_title", "").lower()
    if "rate limiter" in problem_title or "design" in problem_title:
        problem_type = "System Design"
    elif "rag" in problem_title:
        problem_type = "RAG System"
    elif "api" in problem_title or "endpoint" in problem_title:
        problem_type = "Backend API"
    else:
        problem_type = "Algorithm"

    return {
        "language": language,
        "problem_type": problem_type,
        **_step(state, "Input Validation", "completed", f"Language: {language}, Problem type: {problem_type}"),
    }


def code_parsing_node(state: EvaluationState) -> dict:
    """Node 2: Parse and analyze code structure statically."""
    analysis = tools.analyze_code_structure(state["candidate_code"], state["language"])
    detail = f"Found {len(analysis.get('functions', []))} functions, {len(analysis.get('classes', []))} classes"
    if analysis.get("has_syntax_error"):
        detail += f", SYNTAX ERROR: {analysis.get('syntax_error_msg', '')}"
    return {
        "code_analysis": analysis,
        **_step(state, "Code Parsing", "completed", detail),
    }


def rag_retrieval_node(state: EvaluationState) -> dict:
    """Node 3: Retrieve rubric documents and problem expectations from vector DB."""
    rubric = tools.retrieve_rubric(
        state["role"], state["seniority"], state["problem_type"], state["problem_title"]
    )
    expectations = tools.retrieve_problem_expectations(state["problem_title"])
    all_evidence = rubric + expectations

    detail = f"Retrieved {len(all_evidence)} rubric chunks"
    return {
        "retrieved_rubric": all_evidence,
        "retrieved_rubric_evidence": all_evidence,
        **_step(state, "RAG Retrieval", "completed", detail),
    }


def correctness_node(state: EvaluationState) -> dict:
    """Node 4: Evaluate correctness against expected approach."""
    scoring = tools.score_against_rubric(
        {**state.get("code_analysis", {}), "problem_title": state["problem_title"]},
        state.get("retrieved_rubric", []),
        state["candidate_code"],
        state.get("problem_description", ""),
        state["language"],
        state["role"],
        state["seniority"],
    )
    detail = f"Correctness score: {scoring.get('correctness_score', 0)}"
    return {
        "scoring": scoring,
        "strengths": scoring.get("strengths", []),
        "weaknesses": scoring.get("weaknesses", []),
        **_step(state, "Correctness Evaluation", "completed", detail),
    }


def complexity_node(state: EvaluationState) -> dict:
    """Node 5: Analyze time and space complexity."""
    complexity = tools.estimate_complexity(state["candidate_code"], state["language"])
    detail = f"Time: {complexity.get('time_complexity', '?')}, Space: {complexity.get('space_complexity', '?')}"
    return {
        "complexity": complexity,
        **_step(state, "Complexity Analysis", "completed", detail),
    }


def edge_case_node(state: EvaluationState) -> dict:
    """Node 6: Detect missed edge cases."""
    edge_cases = tools.detect_edge_cases(
        state["candidate_code"],
        state.get("problem_description", ""),
        state["language"],
        state.get("retrieved_rubric", []),
    )
    missed = edge_cases.get("missed_edge_cases", [])
    detail = f"Found {len(missed)} missed edge cases"
    return {
        "edge_cases": edge_cases,
        "missed_edge_cases": missed,
        **_step(state, "Edge Case Detection", "completed", detail),
    }


def code_quality_node(state: EvaluationState) -> dict:
    """Node 7: Evaluate code quality (readability, maintainability, etc.)."""
    scoring = state.get("scoring", {})
    detail = f"Readability: {scoring.get('readability_score', 0)}, Maintainability: {scoring.get('maintainability_score', 0)}"
    return {
        **_step(state, "Code Quality Assessment", "completed", detail),
    }


def bias_mitigation_node(state: EvaluationState) -> dict:
    """Node 8: Apply bias mitigation checks."""
    feedback_so_far = " ".join(state.get("strengths", []) + state.get("weaknesses", []))
    bias_check = tools.apply_bias_mitigation_check(feedback_so_far)
    detail = "Biased" if bias_check.get("is_biased") else "Clean - no bias detected"
    return {
        "bias_check": bias_check,
        **_step(state, "Bias Mitigation", "completed", detail),
    }


def scoring_node(state: EvaluationState) -> dict:
    """Node 9: Generate final scores and weighted overall score."""
    scoring = state.get("scoring", {})
    complexity = state.get("complexity", {})
    edge_cases = state.get("edge_cases", {})

    scores = {
        "correctness": scoring.get("correctness_score", 70),
        "complexity": complexity.get("complexity_score", 70),
        "edge_cases": edge_cases.get("edge_case_score", 70),
        "readability": scoring.get("readability_score", 70),
        "maintainability": scoring.get("maintainability_score", 70),
        "communication": scoring.get("communication_score", 70),
    }

    detail = f"Scores: {json.dumps(scores)}"
    return {
        "scores": scores,
        **_step(state, "Scoring", "completed", detail),
    }


def recommendation_node(state: EvaluationState) -> dict:
    """Node 10: Generate recommendation and final feedback."""
    eval_state = {
        "scores": state.get("scores", {}),
        "strengths": state.get("strengths", []),
        "weaknesses": state.get("weaknesses", []),
        "missed_edge_cases": state.get("missed_edge_cases", []),
        "code_analysis": state.get("code_analysis", {}),
        "complexity": state.get("complexity", {}),
    }

    result = tools.generate_feedback(eval_state)

    # Merge bias mitigation notes
    bias_notes = state.get("bias_check", {}).get("bias_mitigation_notes", [])
    all_bias_notes = list(set(result.get("bias_mitigation_notes", []) + bias_notes))

    detail = f"Recommendation: {result['recommendation']}, Score: {result['overall_score']}"
    return {
        "overall_score": result["overall_score"],
        "recommendation": result["recommendation"],
        "final_feedback": result["final_feedback"],
        "bias_mitigation_notes": all_bias_notes,
        "human_review_required": True,
        **_step(state, "Recommendation", "completed", detail),
    }


def report_generation_node(state: EvaluationState) -> dict:
    """Node 11: Compile final structured report."""
    complexity = state.get("complexity", {})
    detail = "Report generated successfully"
    return {
        "time_complexity": complexity.get("time_complexity", "Unknown"),
        "space_complexity": complexity.get("space_complexity", "Unknown"),
        "demo_mode": DEMO_MODE,
        **_step(state, "Report Generation", "completed", detail),
    }


# ---------------------------------------------------------------------------
# Build the LangGraph
# ---------------------------------------------------------------------------

def build_graph():
    """Build and compile the LangGraph evaluation workflow."""
    try:
        from langgraph.graph import StateGraph, END

        workflow = StateGraph(EvaluationState)

        workflow.add_node("node_input_validation", input_validation_node)
        workflow.add_node("node_code_parsing", code_parsing_node)
        workflow.add_node("node_rag_retrieval", rag_retrieval_node)
        workflow.add_node("node_correctness", correctness_node)
        workflow.add_node("node_complexity", complexity_node)
        workflow.add_node("node_edge_case", edge_case_node)
        workflow.add_node("node_code_quality", code_quality_node)
        workflow.add_node("node_bias_mitigation", bias_mitigation_node)
        workflow.add_node("node_scoring", scoring_node)
        workflow.add_node("node_recommendation", recommendation_node)
        workflow.add_node("node_report_generation", report_generation_node)

        workflow.set_entry_point("node_input_validation")
        workflow.add_edge("node_input_validation", "node_code_parsing")
        workflow.add_edge("node_code_parsing", "node_rag_retrieval")
        workflow.add_edge("node_rag_retrieval", "node_correctness")
        workflow.add_edge("node_correctness", "node_complexity")
        workflow.add_edge("node_complexity", "node_edge_case")
        workflow.add_edge("node_edge_case", "node_code_quality")
        workflow.add_edge("node_code_quality", "node_bias_mitigation")
        workflow.add_edge("node_bias_mitigation", "node_scoring")
        workflow.add_edge("node_scoring", "node_recommendation")
        workflow.add_edge("node_recommendation", "node_report_generation")
        workflow.add_edge("node_report_generation", END)

        return workflow.compile()

    except ImportError:
        # Fallback: sequential execution without LangGraph
        return None


# Pre-compiled graph
_compiled_graph = None


def get_compiled_graph():
    global _compiled_graph
    if _compiled_graph is None:
        _compiled_graph = build_graph()
    return _compiled_graph


def run_evaluation(request_data: dict) -> dict:
    """Run the full evaluation workflow. Uses LangGraph if available, else sequential fallback."""
    initial_state: EvaluationState = {
        "candidate_name": request_data.get("candidate_name", ""),
        "role": request_data.get("role", ""),
        "seniority": request_data.get("seniority", "Mid"),
        "problem_title": request_data.get("problem_title", ""),
        "problem_description": request_data.get("problem_description", ""),
        "candidate_code": request_data.get("candidate_code", ""),
        "language": request_data.get("language", "python"),
        "agent_steps": [],
        "demo_mode": DEMO_MODE,
    }

    graph = get_compiled_graph()

    if graph is not None:
        result = graph.invoke(initial_state)
        return dict(result)
    else:
        # Sequential fallback
        state = initial_state
        nodes = [
            input_validation_node, code_parsing_node, rag_retrieval_node,
            correctness_node, complexity_node, edge_case_node,
            code_quality_node, bias_mitigation_node, scoring_node,
            recommendation_node, report_generation_node,
        ]
        for node in nodes:
            update = node(state)
            state = {**state, **update}
        return state
