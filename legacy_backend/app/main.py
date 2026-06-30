"""FastAPI main application for the Agentic RAG Technical Interview Evaluator."""

import time
import uuid
import json
import asyncio
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse

from .config import DEMO_MODE, LLM_MODEL, EMBEDDING_MODEL, BACKEND_HOST, BACKEND_PORT
from .schemas import EvaluateRequest, EvaluateResponse, HealthResponse, RubricEvidence
from .agent_graph import run_evaluation
from . import rag

app = FastAPI(
    title="Agentic RAG Technical Interview Evaluator",
    description="Real AI agent that evaluates technical interview code submissions using RAG + tool calling + LangGraph workflow.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory job store for async evaluation
_jobs: dict[str, dict] = {}


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/api/health")
async def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        demo_mode=DEMO_MODE,
        llm_model=LLM_MODEL if not DEMO_MODE else "demo (no API key)",
        embedding_model=EMBEDDING_MODEL if not DEMO_MODE else "demo (hash-based)",
        vector_db=rag.get_vector_db_name(),
        knowledge_base_loaded=rag.is_loaded(),
    )


@app.post("/api/evaluate", response_model=EvaluateResponse)
async def evaluate(req: EvaluateRequest) -> EvaluateResponse:
    """Run a synchronous evaluation and return the final structured result."""
    if not req.candidate_code.strip():
        raise HTTPException(status_code=400, detail="Candidate code is required")

    request_data = req.model_dump()
    result = run_evaluation(request_data)

    return _build_response(result)


@app.post("/api/evaluate/start")
async def evaluate_start(req: EvaluateRequest) -> dict:
    """Start an async evaluation job. Returns a job_id for polling."""
    if not req.candidate_code.strip():
        raise HTTPException(status_code=400, detail="Candidate code is required")

    job_id = str(uuid.uuid4())
    _jobs[job_id] = {
        "status": "pending",
        "request": req.model_dump(),
        "result": None,
        "steps": [],
        "created_at": time.time(),
    }

    # Run evaluation in background
    asyncio.create_task(_run_job(job_id, req.model_dump()))

    return {"job_id": job_id, "status": "pending"}


@app.get("/api/evaluate/status/{job_id}")
async def evaluate_status(job_id: str) -> dict:
    """Poll the status of an async evaluation job."""
    if job_id not in _jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    job = _jobs[job_id]
    return {
        "job_id": job_id,
        "status": job["status"],
        "steps": job.get("steps", []),
    }


@app.get("/api/evaluate/result/{job_id}")
async def evaluate_result(job_id: str) -> EvaluateResponse:
    """Get the final result of a completed evaluation job."""
    if job_id not in _jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    job = _jobs[job_id]
    if job["status"] != "completed":
        raise HTTPException(status_code=400, detail=f"Job status is '{job['status']}', not completed yet")
    return _build_response(job["result"])


@app.get("/api/evaluate/stream/{job_id}")
async def evaluate_stream(job_id: str):
    """Server-Sent Events stream for real-time progress updates."""
    if job_id not in _jobs:
        raise HTTPException(status_code=404, detail="Job not found")

    async def event_generator():
        last_step_count = 0
        while True:
            job = _jobs.get(job_id, {})
            status = job.get("status", "unknown")
            steps = job.get("steps", [])

            # Send new steps
            if len(steps) > last_step_count:
                for step in steps[last_step_count:]:
                    yield {"event": "step", "data": json.dumps(step)}
                last_step_count = len(steps)

            if status == "completed":
                yield {"event": "complete", "data": json.dumps({"job_id": job_id})}
                break
            elif status == "error":
                yield {"event": "error", "data": json.dumps({"error": job.get("error", "Unknown error")})}
                break

            await asyncio.sleep(0.3)

    return EventSourceResponse(event_generator())


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _run_job(job_id: str, request_data: dict):
    """Run evaluation job in background."""
    job = _jobs[job_id]
    job["status"] = "running"

    try:
        # Run the evaluation (CPU-bound, so use executor)
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, run_evaluation, request_data)

        # Extract steps for progress tracking
        job["steps"] = result.get("agent_steps", [])
        job["result"] = result
        job["status"] = "completed"
    except Exception as e:
        job["status"] = "error"
        job["error"] = str(e)


def _build_response(result: dict) -> EvaluateResponse:
    """Build the EvaluateResponse from the raw evaluation result."""
    scores = result.get("scores", {})
    evidence = result.get("retrieved_rubric_evidence", result.get("retrieved_rubric", []))

    return EvaluateResponse(
        candidate_name=result.get("candidate_name", ""),
        role=result.get("role", ""),
        problem_title=result.get("problem_title", ""),
        overall_score=result.get("overall_score", 0),
        recommendation=result.get("recommendation", "No Hire"),
        scores={
            "correctness": scores.get("correctness", 0),
            "complexity": scores.get("complexity", 0),
            "edge_cases": scores.get("edge_cases", 0),
            "readability": scores.get("readability", 0),
            "maintainability": scores.get("maintainability", 0),
            "communication": scores.get("communication", 0),
        },
        time_complexity=result.get("time_complexity", result.get("complexity", {}).get("time_complexity", "Unknown")),
        space_complexity=result.get("space_complexity", result.get("complexity", {}).get("space_complexity", "Unknown")),
        strengths=result.get("strengths", []),
        weaknesses=result.get("weaknesses", []),
        missed_edge_cases=result.get("missed_edge_cases", []),
        retrieved_rubric_evidence=[
            RubricEvidence(**e) if isinstance(e, dict) else RubricEvidence(source=str(e), snippet="", relevance=0.0)
            for e in evidence
        ],
        bias_mitigation_notes=result.get("bias_mitigation_notes", []),
        final_feedback=result.get("final_feedback", ""),
        human_review_required=True,
        demo_mode=result.get("demo_mode", DEMO_MODE),
        agent_steps=result.get("agent_steps", []),
    )


@app.on_event("startup")
async def startup_event():
    """Initialize RAG knowledge base on startup."""
    print("=" * 60)
    if DEMO_MODE:
        print("Demo mode active: using deterministic mock evaluation")
        print("because no OPENAI_API_KEY is configured.")
    else:
        print(f"LLM Model: {LLM_MODEL}")
        print(f"Embedding Model: {EMBEDDING_MODEL}")
    print(f"Vector DB: {rag.get_vector_db_name()}")
    print(f"Knowledge base chunks: {rag.get_chunk_count()}")
    print("=" * 60)
    rag.get_vector_store()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=BACKEND_HOST, port=BACKEND_PORT)
