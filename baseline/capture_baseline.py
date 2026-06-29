"""Capture baseline API responses and golden fixtures before migration."""
import urllib.request
import json
import os
import time

BASE_URL = "http://localhost:8000"
OUT_DIR = os.path.join(os.path.dirname(__file__), "fixtures")

os.makedirs(OUT_DIR, exist_ok=True)


def get(path):
    req = urllib.request.Request(f"{BASE_URL}{path}")
    resp = urllib.request.urlopen(req, timeout=30)
    return json.loads(resp.read())


def post(path, data):
    req = urllib.request.Request(
        f"{BASE_URL}{path}",
        data=json.dumps(data).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    resp = urllib.request.urlopen(req, timeout=300)
    return json.loads(resp.read())


# 1. Health
print("Capturing /api/health...")
health = get("/api/health")
with open(os.path.join(OUT_DIR, "health_response.json"), "w") as f:
    json.dump(health, f, indent=2)
print(f"  Health: {health['status']}, demo={health['demo_mode']}, model={health['llm_model']}")

# 2. Golden evaluation fixtures
fixtures = [
    {
        "name": "strong_rate_limiter",
        "request": {
            "candidate_name": "Ahmed Hassan",
            "role": "Backend Engineer",
            "seniority": "Mid",
            "problem_title": "Design a Rate Limiter",
            "problem_description": "Design and implement a rate limiter that limits the number of requests a user can make within a given time window.",
            "candidate_code": """class RateLimiter:
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
""",
            "language": "python",
        },
    },
    {
        "name": "weak_two_sum",
        "request": {
            "candidate_name": "Test Candidate",
            "role": "Backend Engineer",
            "seniority": "Junior",
            "problem_title": "Two Sum",
            "problem_description": "Given an array of integers and a target value, return the indices of two numbers that add up to the target.",
            "candidate_code": """def two_sum(nums, target):
    for i in range(len(nums)):
        for j in range(len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
""",
            "language": "python",
        },
    },
    {
        "name": "js_crud_api",
        "request": {
            "candidate_name": "Jane Doe",
            "role": "Full Stack Engineer",
            "seniority": "Senior",
            "problem_title": "Build a REST API CRUD",
            "problem_description": "Design and implement a REST API with CRUD operations for a resource.",
            "candidate_code": """const express = require('express');
const app = express();
app.use(express.json());

let tasks = [];

app.get('/tasks', (req, res) => res.json(tasks));
app.post('/tasks', (req, res) => {
    const task = { id: Date.now(), ...req.body };
    tasks.push(task);
    res.status(201).json(task);
});
app.delete('/tasks/:id', (req, res) => {
    tasks = tasks.filter(t => t.id !== parseInt(req.params.id));
    res.status(204).send();
});

app.listen(3000);
""",
            "language": "javascript",
        },
    },
]

for fixture in fixtures:
    name = fixture["name"]
    req = fixture["request"]
    print(f"Capturing evaluation: {name}...")
    try:
        result = post("/api/evaluate", req)
        with open(os.path.join(OUT_DIR, f"{name}_request.json"), "w") as f:
            json.dump(req, f, indent=2)
        with open(os.path.join(OUT_DIR, f"{name}_response.json"), "w") as f:
            json.dump(result, f, indent=2)
        print(f"  Score: {result['overall_score']}, Rec: {result['recommendation']}, Steps: {len(result['agent_steps'])}")
    except Exception as e:
        print(f"  ERROR: {e}")

print("\nBaseline capture complete. Fixtures saved to baseline/fixtures/")
