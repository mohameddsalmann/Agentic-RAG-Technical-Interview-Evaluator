"""Comprehensive end-to-end test for the Agentic RAG Interview Evaluator."""
import urllib.request
import json
import time
import sys

API = "http://localhost:8000"

def post(path, body):
    data = json.dumps(body).encode()
    req = urllib.request.Request(
        f"{API}{path}", data=data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    resp = urllib.request.urlopen(req, timeout=120)
    return json.loads(resp.read())

def get(path):
    req = urllib.request.Request(f"{API}{path}")
    resp = urllib.request.urlopen(req, timeout=30)
    return json.loads(resp.read())

passed = 0
failed = 0

def check(name, condition, detail=""):
    global passed, failed
    if condition:
        print(f"  PASS: {name}")
        passed += 1
    else:
        print(f"  FAIL: {name} {detail}")
        failed += 1

print("=" * 60)
print("TEST 1: Health Check")
print("=" * 60)
health = get("/api/health")
check("status is ok", health["status"] == "ok")
check("demo_mode is False", health["demo_mode"] == False, f"got {health['demo_mode']}")
check("llm_model is set", len(health["llm_model"]) > 0, f"got '{health['llm_model']}'")
check("knowledge_base_loaded", health["knowledge_base_loaded"] == True)

print()
print("=" * 60)
print("TEST 2: Full Evaluation (Rate Limiter)")
print("=" * 60)

rate_limiter_code = """class RateLimiter:
    def __init__(self, max_requests, window_seconds):
        self.max_requests = max_requests
        self.window = window_seconds
        self.requests = {}

    def is_allowed(self, user_id, timestamp):
        if user_id not in self.requests:
            self.requests[user_id] = []

        # Remove old timestamps outside the window
        self.requests[user_id] = [
            t for t in self.requests[user_id]
            if t > timestamp - self.window
        ]

        if len(self.requests[user_id]) >= self.max_requests:
            return False

        self.requests[user_id].append(timestamp)
        return True
"""

t0 = time.time()
result = post("/api/evaluate", {
    "candidate_name": "Ahmed Hassan",
    "role": "Backend Engineer",
    "seniority": "Mid",
    "problem_title": "Design a Rate Limiter",
    "problem_description": "Design and implement a rate limiter that limits the number of requests a user can make within a given time window. Consider per-user limits, sliding vs fixed window, timestamp cleanup, concurrency, and memory growth.",
    "candidate_code": rate_limiter_code,
    "language": "python",
})
elapsed = time.time() - t0
print(f"  Evaluation completed in {elapsed:.1f}s")

check("candidate_name", result["candidate_name"] == "Ahmed Hassan")
check("role", result["role"] == "Backend Engineer")
check("problem_title", result["problem_title"] == "Design a Rate Limiter")
check("overall_score is 0-100", 0 <= result["overall_score"] <= 100, f"got {result['overall_score']}")
check("recommendation is valid", result["recommendation"] in ["Strong Hire", "Hire", "Lean Hire", "Lean No Hire", "No Hire"], f"got {result['recommendation']}")
check("human_review_required", result["human_review_required"] == True)
check("demo_mode is False", result["demo_mode"] == False)

scores = result["scores"]
check("correctness score 0-100", 0 <= scores["correctness"] <= 100)
check("complexity score 0-100", 0 <= scores["complexity"] <= 100)
check("edge_cases score 0-100", 0 <= scores["edge_cases"] <= 100)
check("readability score 0-100", 0 <= scores["readability"] <= 100)
check("maintainability score 0-100", 0 <= scores["maintainability"] <= 100)
check("communication score 0-100", 0 <= scores["communication"] <= 100)

check("time_complexity is set", len(result["time_complexity"]) > 0, f"got '{result['time_complexity']}'")
check("space_complexity is set", len(result["space_complexity"]) > 0, f"got '{result['space_complexity']}'")
check("strengths is a list", isinstance(result["strengths"], list) and len(result["strengths"]) > 0)
check("weaknesses is a list", isinstance(result["weaknesses"], list) and len(result["weaknesses"]) > 0)
check("missed_edge_cases is a list", isinstance(result["missed_edge_cases"], list))
check("retrieved_rubric_evidence is a list", isinstance(result["retrieved_rubric_evidence"], list) and len(result["retrieved_rubric_evidence"]) > 0)
check("bias_mitigation_notes is a list", isinstance(result["bias_mitigation_notes"], list) and len(result["bias_mitigation_notes"]) > 0)
check("final_feedback is non-empty", len(result["final_feedback"]) > 50)
check("agent_steps has 11 steps", len(result["agent_steps"]) == 11, f"got {len(result['agent_steps'])}")

print()
print("  Agent Steps:")
for step in result["agent_steps"]:
    print(f"    [{step['status']}] {step['step']}: {step['detail'][:80]}")

print()
print("=" * 60)
print("TEST 3: Async Evaluation (Start + Status + Result)")
print("=" * 60)

start_resp = post("/api/evaluate/start", {
    "candidate_name": "Test Candidate",
    "role": "AI Engineer",
    "seniority": "Senior",
    "problem_title": "Design a RAG System",
    "problem_description": "Design a RAG system with chunking, embeddings, vector storage, retrieval, and generation.",
    "candidate_code": "def rag_search(query, docs):\n    return docs[:3]\n",
    "language": "python",
})
job_id = start_resp["job_id"]
check("job_id returned", len(job_id) > 0)
check("status is pending", start_resp["status"] in ["pending", "running"])

print(f"  Job ID: {job_id}")
print("  Waiting for job to complete...")

for attempt in range(30):
    time.sleep(2)
    status = get(f"/api/evaluate/status/{job_id}")
    if status["status"] == "completed":
        print(f"  Job completed after {(attempt+1)*2}s")
        break
    elif status["status"] == "error":
        print(f"  Job error: {status}")
        break
    steps = status.get("steps", [])
    print(f"  Status: {status['status']}, steps so far: {len(steps)}")

check("async job completed", status["status"] == "completed", f"got {status['status']}")

if status["status"] == "completed":
    async_result = get(f"/api/evaluate/result/{job_id}")
    check("async result has score", 0 <= async_result["overall_score"] <= 100)
    check("async result has recommendation", async_result["recommendation"] in ["Strong Hire", "Hire", "Lean Hire", "Lean No Hire", "No Hire"])

print()
print("=" * 60)
print("TEST 4: Edge Cases")
print("=" * 60)

# Empty code
try:
    post("/api/evaluate", {
        "candidate_name": "Test",
        "role": "Backend Engineer",
        "seniority": "Mid",
        "problem_title": "Test",
        "problem_description": "Test",
        "candidate_code": "",
        "language": "python",
    })
    check("empty code rejected", False, "should have raised error")
except urllib.error.HTTPError as e:
    check("empty code rejected", e.code == 400)

# Different language (JavaScript)
js_result = post("/api/evaluate", {
    "candidate_name": "JS Candidate",
    "role": "Full Stack Engineer",
    "seniority": "Junior",
    "problem_title": "Two Sum",
    "problem_description": "Given an array of integers and a target, return indices of two numbers that add up to target.",
    "candidate_code": "function twoSum(nums, target) {\n  const map = {};\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map[diff] !== undefined) return [map[diff], i];\n    map[nums[i]] = i;\n  }\n}",
    "language": "javascript",
})
check("JS evaluation succeeds", js_result["overall_score"] >= 0)
check("JS candidate name", js_result["candidate_name"] == "JS Candidate")

print()
print("=" * 60)
print(f"RESULTS: {passed} passed, {failed} failed")
print("=" * 60)

sys.exit(0 if failed == 0 else 1)
