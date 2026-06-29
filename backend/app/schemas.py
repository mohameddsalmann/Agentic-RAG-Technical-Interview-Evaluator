"""Pydantic schemas for request/response models."""

from pydantic import BaseModel, Field
from typing import Optional


class EvaluateRequest(BaseModel):
    candidate_name: str = Field(..., description="Name of the candidate")
    role: str = Field(..., description="e.g. Backend Engineer, AI Engineer, Full Stack Engineer")
    seniority: str = Field("Mid", description="Junior, Mid, or Senior")
    problem_title: str = Field(..., description="Title of the interview problem")
    problem_description: str = Field("", description="Description of the problem")
    candidate_code: str = Field(..., description="The candidate's code submission")
    language: str = Field("python", description="Programming language of the submission")


class ScoreBreakdown(BaseModel):
    correctness: int = 0
    complexity: int = 0
    edge_cases: int = 0
    readability: int = 0
    maintainability: int = 0
    communication: int = 0


class RubricEvidence(BaseModel):
    source: str = ""
    snippet: str = ""
    relevance: float = 0.0


class EvaluateResponse(BaseModel):
    candidate_name: str
    role: str
    problem_title: str
    overall_score: int
    recommendation: str
    scores: ScoreBreakdown
    time_complexity: str = ""
    space_complexity: str = ""
    strengths: list[str] = []
    weaknesses: list[str] = []
    missed_edge_cases: list[str] = []
    retrieved_rubric_evidence: list[RubricEvidence] = []
    bias_mitigation_notes: list[str] = []
    final_feedback: str = ""
    human_review_required: bool = True
    demo_mode: bool = False
    agent_steps: list[dict] = []


class HealthResponse(BaseModel):
    status: str = "ok"
    demo_mode: bool = False
    llm_model: str = ""
    embedding_model: str = ""
    vector_db: str = ""
    knowledge_base_loaded: bool = False
