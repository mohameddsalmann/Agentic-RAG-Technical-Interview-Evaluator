export interface ScoreBreakdown {
  correctness: number;
  complexity: number;
  edge_cases: number;
  readability: number;
  maintainability: number;
  communication: number;
}

export interface RubricEvidence {
  source: string;
  snippet: string;
  relevance: number;
}

export interface AgentStep {
  step: string;
  status: string;
  detail: string;
  timestamp: number;
}

export interface EvaluateRequest {
  candidate_name: string;
  role: string;
  seniority: string;
  problem_title: string;
  problem_description: string;
  candidate_code: string;
  language: string;
}

export interface EvaluateResponse {
  candidate_name: string;
  role: string;
  problem_title: string;
  overall_score: number;
  recommendation: string;
  scores: ScoreBreakdown;
  time_complexity: string;
  space_complexity: string;
  strengths: string[];
  weaknesses: string[];
  missed_edge_cases: string[];
  retrieved_rubric_evidence: RubricEvidence[];
  bias_mitigation_notes: string[];
  final_feedback: string;
  human_review_required: boolean;
  demo_mode: boolean;
  agent_steps: AgentStep[];
}

export interface HealthResponse {
  status: string;
  demo_mode: boolean;
  llm_model: string;
  embedding_model: string;
  vector_db: string;
  knowledge_base_loaded: boolean;
}

export const ROLES = ["Backend Engineer", "AI Engineer", "Full Stack Engineer"] as const;
export const SENIORITIES = ["Junior", "Mid", "Senior"] as const;
export const PROBLEM_TYPES = ["Algorithm", "Backend API", "System Design", "RAG System"] as const;

export const PROBLEMS: Record<string, { title: string; description: string }> = {
  "Design a Rate Limiter": {
    title: "Design a Rate Limiter",
    description:
      "Design and implement a rate limiter that limits the number of requests a user can make within a given time window. Consider per-user limits, sliding vs fixed window, timestamp cleanup, concurrency, and memory growth.",
  },
  "Two Sum": {
    title: "Two Sum",
    description:
      "Given an array of integers and a target value, return the indices of two numbers that add up to the target. Assume exactly one solution exists.",
  },
  "Design a RAG System": {
    title: "Design a RAG System",
    description:
      "Design and implement a Retrieval-Augmented Generation system that can answer questions based on a knowledge base of documents. Include chunking, embeddings, vector storage, retrieval, and generation.",
  },
  "Build a REST API CRUD": {
    title: "Build a REST API CRUD",
    description:
      "Design and implement a REST API with CRUD operations for a resource (e.g., tasks, users). Include proper HTTP methods, status codes, validation, and error handling.",
  },
};

export const DEFAULT_CODE = `class RateLimiter:
    def __init__(self, max_requests, window_seconds):
        self.max_requests = max_requests
        self.window = window_seconds
        self.requests = {}  # user_id -> list of timestamps

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
`;
