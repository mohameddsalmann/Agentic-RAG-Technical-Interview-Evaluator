"""Agentic tools: real callable functions used by the LangGraph workflow."""

import re
import ast
import json
import time
from typing import Any

from . import rag
from .config import DEMO_MODE, OPENAI_API_KEY, OPENAI_BASE_URL, LLM_MODEL
from .prompts import (
    CORRECTNESS_PROMPT, COMPLEXITY_PROMPT, EDGE_CASE_PROMPT,
    CODE_QUALITY_PROMPT, SCORING_PROMPT, BIAS_MITIGATION_PROMPT,
)


def _call_llm(prompt: str, system: str = "") -> str:
    """Call the LLM with a prompt. Returns raw text response."""
    if DEMO_MODE:
        return ""

    try:
        from langchain_openai import ChatOpenAI
        kwargs = dict(model=LLM_MODEL, api_key=OPENAI_API_KEY, temperature=0.2, max_tokens=2000)
        if OPENAI_BASE_URL:
            kwargs["base_url"] = OPENAI_BASE_URL
        llm = ChatOpenAI(**kwargs)
        messages = []
        if system:
            messages.append(("system", system))
        messages.append(("human", prompt))

        for attempt in range(3):
            try:
                response = llm.invoke(messages)
                return response.content
            except Exception as e:
                err_str = str(e)
                if "429" in err_str and attempt < 2:
                    wait = 5 * (attempt + 1)
                    print(f"[LLM] Rate limited (429), retrying in {wait}s (attempt {attempt+1}/3)...")
                    time.sleep(wait)
                    continue
                raise
        return ""
    except Exception as e:
        print(f"[LLM] Call failed: {e}")
        return ""


def _parse_json_response(text: str) -> dict:
    """Try to parse a JSON object from LLM response text."""
    if not text:
        return {}
    # Try direct parse
    try:
        return json.loads(text)
    except Exception:
        pass
    # Try extracting from markdown code block
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except Exception:
            pass
    # Try finding first { ... } block
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except Exception:
            pass
    return {}


# ---------------------------------------------------------------------------
# Tool: retrieve_rubric
# ---------------------------------------------------------------------------

def retrieve_rubric(role: str, seniority: str, problem_type: str, problem_title: str = "") -> list[dict]:
    """Retrieve relevant rubric documents from the vector database."""
    return rag.retrieve_rubric(role, seniority, problem_type, problem_title, k=5)


# ---------------------------------------------------------------------------
# Tool: retrieve_problem_expectations
# ---------------------------------------------------------------------------

def retrieve_problem_expectations(problem_title: str) -> list[dict]:
    """Retrieve problem-specific expected solution and criteria."""
    return rag.retrieve_rubric("", "", "", problem_title, query=problem_title, k=3)


# ---------------------------------------------------------------------------
# Tool: analyze_code_structure
# ---------------------------------------------------------------------------

def analyze_code_structure(candidate_code: str, language: str) -> dict:
    """Analyze candidate code structure statically. Does NOT execute code."""
    result = {
        "language": language,
        "functions": [],
        "classes": [],
        "imports": [],
        "line_count": len(candidate_code.strip().splitlines()),
        "has_syntax_error": False,
        "syntax_error_msg": "",
        "key_logic": [],
    }

    if language.lower() == "python":
        try:
            tree = ast.parse(candidate_code)
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    args = [a.arg for a in node.args.args]
                    result["functions"].append({
                        "name": node.name,
                        "args": args,
                        "line": node.lineno,
                    })
                elif isinstance(node, ast.ClassDef):
                    methods = [n.name for n in node.body if isinstance(n, ast.FunctionDef)]
                    result["classes"].append({
                        "name": node.name,
                        "methods": methods,
                        "line": node.lineno,
                    })
                elif isinstance(node, (ast.Import, ast.ImportFrom)):
                    if isinstance(node, ast.Import):
                        result["imports"].append([a.name for a in node.names])
                    else:
                        result["imports"].append(node.module or "")
                elif isinstance(node, ast.For):
                    result["key_logic"].append(f"loop at line {node.lineno}")
                elif isinstance(node, ast.While):
                    result["key_logic"].append(f"while-loop at line {node.lineno}")
                elif isinstance(node, ast.If):
                    result["key_logic"].append(f"conditional at line {node.lineno}")
        except SyntaxError as e:
            result["has_syntax_error"] = True
            result["syntax_error_msg"] = str(e)
    else:
        # Basic regex-based analysis for non-Python languages
        func_pattern = r"(?:def|function|func|void|int|public|private|static).*?\s+(\w+)\s*\("
        result["functions"] = re.findall(func_pattern, candidate_code)
        class_pattern = r"(?:class|struct|interface)\s+(\w+)"
        result["classes"] = re.findall(class_pattern, candidate_code)
        import_pattern = r"^(?:import|from|include|require|#include)\s+.*$"
        result["imports"] = re.findall(import_pattern, candidate_code, re.MULTILINE)

    return result


# ---------------------------------------------------------------------------
# Tool: estimate_complexity
# ---------------------------------------------------------------------------

def estimate_complexity(candidate_code: str, language: str) -> dict:
    """Estimate time and space complexity of the code."""
    if not DEMO_MODE:
        prompt = COMPLEXITY_PROMPT.format(
            language=language,
            candidate_code=candidate_code,
        )
        response = _call_llm(prompt)
        parsed = _parse_json_response(response)
        if parsed:
            return {
                "time_complexity": parsed.get("time_complexity", "Unknown"),
                "space_complexity": parsed.get("space_complexity", "Unknown"),
                "complexity_score": parsed.get("complexity_score", 70),
                "complexity_notes": parsed.get("complexity_notes", ""),
            }

    # Heuristic fallback
    lines = candidate_code.strip().splitlines()
    has_nested_loop = False
    has_loop = False
    has_dict = "dict" in candidate_code or "{}" in candidate_code or "HashMap" in candidate_code
    has_list = "list" in candidate_code or "[]" in candidate_code or "Array" in candidate_code

    if language.lower() == "python":
        try:
            tree = ast.parse(candidate_code)
            for node in ast.walk(tree):
                if isinstance(node, (ast.For, ast.While)):
                    has_loop = True
                    for child in ast.walk(node):
                        if isinstance(child, (ast.For, ast.While)) and child is not node:
                            has_nested_loop = True
        except Exception:
            pass

    if has_nested_loop:
        time_c = "O(n^2)"
        score = 60
    elif has_loop:
        time_c = "O(n)"
        score = 75
    else:
        time_c = "O(1)"
        score = 85

    space_c = "O(n)" if (has_dict or has_list) else "O(1)"

    return {
        "time_complexity": time_c,
        "space_complexity": space_c,
        "complexity_score": score,
        "complexity_notes": f"Heuristic estimate based on code structure analysis. Time: {time_c}, Space: {space_c}.",
    }


# ---------------------------------------------------------------------------
# Tool: detect_edge_cases
# ---------------------------------------------------------------------------

def detect_edge_cases(candidate_code: str, problem_description: str, language: str, rubric_evidence: list[dict]) -> dict:
    """Find missed edge cases by comparing against rubric expectations."""
    if not DEMO_MODE:
        evidence_text = "\n".join([f"- [{e['source']}] {e['snippet']}" for e in rubric_evidence])
        prompt = EDGE_CASE_PROMPT.format(
            problem_title="",
            problem_description=problem_description,
            language=language,
            candidate_code=candidate_code,
            rubric_evidence=evidence_text,
        )
        response = _call_llm(prompt)
        parsed = _parse_json_response(response)
        if parsed:
            return {
                "edge_case_score": parsed.get("edge_case_score", 70),
                "missed_edge_cases": parsed.get("missed_edge_cases", []),
                "edge_case_notes": parsed.get("edge_case_notes", ""),
            }

    # Heuristic fallback
    code_lower = candidate_code.lower()
    missed = []
    score = 70

    checks = [
        ("empty input", "not" in code_lower and "empty" in code_lower, "No empty input handling detected"),
        ("null/None check", "none" in code_lower or "null" in code_lower, "No null/None checks detected"),
        ("negative values", "0" in code_lower and "<" in code_lower, "No negative value handling detected"),
        ("boundary conditions", "==" in code_lower or "<=" in code_lower or ">=" in code_lower, "Limited boundary condition checks"),
        ("type validation", "isinstance" in code_lower or "typeof" in code_lower, "No type validation detected"),
        ("concurrency", "lock" in code_lower or "thread" in code_lower or "mutex" in code_lower, "No concurrency handling detected"),
        ("memory growth", "clean" in code_lower or "purge" in code_lower or "del " in code_lower, "No memory cleanup mechanism detected"),
    ]

    for name, found, msg in checks:
        if not found:
            missed.append(msg)

    if len(missed) <= 1:
        score = 85
    elif len(missed) <= 3:
        score = 70
    else:
        score = 55

    return {
        "edge_case_score": score,
        "missed_edge_cases": missed,
        "edge_case_notes": f"Heuristic edge case analysis. Found {len(missed)} potential gaps.",
    }


# ---------------------------------------------------------------------------
# Tool: score_against_rubric
# ---------------------------------------------------------------------------

def score_against_rubric(analysis: dict, retrieved_rubric: list[dict], candidate_code: str, problem_description: str, language: str, role: str, seniority: str) -> dict:
    """Generate scores for each category based on analysis and rubric."""
    if not DEMO_MODE:
        evidence_text = "\n".join([f"- [{e['source']}] {e['snippet']}" for e in retrieved_rubric])
        correctness_prompt = CORRECTNESS_PROMPT.format(
            problem_title=analysis.get("problem_title", ""),
            problem_description=problem_description,
            role=role,
            seniority=seniority,
            language=language,
            candidate_code=candidate_code,
            rubric_evidence=evidence_text,
        )
        correctness_resp = _call_llm(correctness_prompt)
        correctness_parsed = _parse_json_response(correctness_resp)

        quality_prompt = CODE_QUALITY_PROMPT.format(
            language=language,
            candidate_code=candidate_code,
            rubric_evidence=evidence_text,
        )
        quality_resp = _call_llm(quality_prompt)
        quality_parsed = _parse_json_response(quality_resp)

        if correctness_parsed and quality_parsed:
            return {
                "correctness_score": correctness_parsed.get("correctness_score", 70),
                "correctness_notes": correctness_parsed.get("correctness_notes", ""),
                "strengths": correctness_parsed.get("strengths", []),
                "weaknesses": correctness_parsed.get("weaknesses", []),
                "readability_score": quality_parsed.get("readability_score", 70),
                "maintainability_score": quality_parsed.get("maintainability_score", 70),
                "communication_score": quality_parsed.get("communication_score", 70),
                "quality_notes": quality_parsed.get("quality_notes", ""),
            }

    # Heuristic fallback scoring
    code = candidate_code
    code_lower = code.lower()

    # Correctness heuristics
    has_functions = len(analysis.get("functions", [])) > 0
    has_syntax_error = analysis.get("has_syntax_error", False)
    line_count = analysis.get("line_count", 0)

    correctness = 70
    if has_syntax_error:
        correctness -= 20
    if has_functions:
        correctness += 10
    if line_count > 5:
        correctness += 5
    correctness = min(max(correctness, 0), 100)

    # Readability heuristics
    readability = 75
    if any(c.isupper() for c in code):  # has some naming convention
        readability += 5
    if "def " in code or "function " in code_lower:
        readability += 5
    if line_count > 50:
        readability -= 10
    if line_count < 5:
        readability -= 5
    readability = min(max(readability, 0), 100)

    # Maintainability heuristics
    maintainability = 75
    if len(analysis.get("functions", [])) > 1:
        maintainability += 10
    if len(analysis.get("classes", [])) > 0:
        maintainability += 5
    if line_count > 100:
        maintainability -= 10
    maintainability = min(max(maintainability, 0), 100)

    # Communication (code comments / docstrings)
    communication = 65
    if "#" in code or "//" in code or '"""' in code or "'''" in code:
        communication += 15
    if "docstring" in code_lower or "doc" in code_lower:
        communication += 5
    communication = min(max(communication, 0), 100)

    # Strengths and weaknesses
    strengths = []
    weaknesses = []
    if has_functions:
        strengths.append("Code is organized into functions")
    if not has_syntax_error:
        strengths.append("No syntax errors detected")
    if line_count < 10:
        weaknesses.append("Solution may be too simplistic for the problem")
    if not any(c in code for c in ["#", "//", '"""']):
        weaknesses.append("Lacks comments or documentation")

    return {
        "correctness_score": correctness,
        "correctness_notes": "Heuristic correctness analysis based on code structure.",
        "strengths": strengths,
        "weaknesses": weaknesses,
        "readability_score": readability,
        "maintainability_score": maintainability,
        "communication_score": communication,
        "quality_notes": "Heuristic code quality analysis.",
    }


# ---------------------------------------------------------------------------
# Tool: generate_feedback
# ---------------------------------------------------------------------------

def generate_feedback(evaluation_state: dict) -> dict:
    """Generate final feedback, overall score, and recommendation."""
    scores = evaluation_state.get("scores", {})
    weights = {
        "correctness": 0.30,
        "complexity": 0.15,
        "edge_cases": 0.15,
        "readability": 0.10,
        "maintainability": 0.10,
        "communication": 0.20,
    }

    overall = 0
    for key, weight in weights.items():
        overall += scores.get(key, 70) * weight
    overall = round(overall)

    if not DEMO_MODE:
        prompt = SCORING_PROMPT.format(evaluation_state=json.dumps(evaluation_state, indent=2))
        response = _call_llm(prompt)
        parsed = _parse_json_response(response)
        if parsed:
            recommendation = parsed.get("recommendation", _recommendation_from_score(overall))
            return {
                "overall_score": parsed.get("overall_score", overall),
                "recommendation": recommendation,
                "final_feedback": parsed.get("final_feedback", ""),
                "bias_mitigation_notes": parsed.get("bias_mitigation_notes", []),
            }

    # Heuristic fallback
    recommendation = _recommendation_from_score(overall)
    strengths = evaluation_state.get("strengths", [])
    weaknesses = evaluation_state.get("weaknesses", [])
    missed = evaluation_state.get("missed_edge_cases", [])

    feedback = (
        f"The candidate's solution scores {overall}/100 overall. "
        f"Strengths include: {'; '.join(strengths[:3]) if strengths else 'basic code structure'}. "
        f"Areas for improvement: {'; '.join(weaknesses[:3]) if weaknesses else 'general depth'}. "
        f"Missed edge cases: {'; '.join(missed[:3]) if missed else 'none explicitly identified'}. "
        f"Recommendation: {recommendation}. Human review required."
    )

    return {
        "overall_score": overall,
        "recommendation": recommendation,
        "final_feedback": feedback,
        "bias_mitigation_notes": [
            "Feedback is based solely on technical code analysis.",
            "No personal traits or background information were considered.",
            "Human review is required before any hiring decision.",
        ],
    }


def _recommendation_from_score(score: int) -> str:
    if score >= 90:
        return "Strong Hire"
    elif score >= 75:
        return "Hire"
    elif score >= 65:
        return "Lean Hire"
    elif score >= 50:
        return "Lean No Hire"
    else:
        return "No Hire"


# ---------------------------------------------------------------------------
# Tool: apply_bias_mitigation_check
# ---------------------------------------------------------------------------

def apply_bias_mitigation_check(feedback: str) -> dict:
    """Check feedback for bias and return mitigation notes."""
    if not DEMO_MODE:
        prompt = BIAS_MITIGATION_PROMPT.format(feedback=feedback)
        response = _call_llm(prompt)
        parsed = _parse_json_response(response)
        if parsed:
            notes = parsed.get("corrected_notes", [])
            if parsed.get("is_biased") and not notes:
                notes = ["Feedback reviewed for bias - no issues found."]
            return {
                "is_biased": parsed.get("is_biased", False),
                "bias_issues": parsed.get("bias_issues", []),
                "bias_mitigation_notes": notes if notes else [
                    "Feedback is based solely on technical code analysis.",
                    "No personal traits or background information were considered.",
                ],
            }

    # Heuristic check
    biased_terms = ["he", "she", "his", "her", "young", "old", "junior candidate", "senior candidate"]
    feedback_lower = feedback.lower()
    found_bias = [term for term in biased_terms if term in feedback_lower]

    notes = [
        "Feedback is based solely on technical code analysis.",
        "No personal traits or background information were considered.",
        "Human review is required before any hiring decision.",
    ]

    if found_bias:
        notes.append(f"Potential biased language detected: {', '.join(found_bias)}. Review recommended.")

    return {
        "is_biased": len(found_bias) > 0,
        "bias_issues": found_bias,
        "bias_mitigation_notes": notes,
    }
