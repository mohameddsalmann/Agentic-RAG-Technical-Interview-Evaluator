# 🚀 Agentic RAG Technical Interview Evaluator

> **An AI-powered interview evaluation platform that analyzes candidate code, retrieves role-specific hiring rubrics, runs a multi-step LangGraph agent workflow, and generates evidence-based technical feedback with human-in-the-loop safeguards.**

This project is designed as a **production-style AI engineering portfolio project** that shows more than a chatbot. It demonstrates real agentic behavior, retrieval-augmented generation, tool calling, structured scoring, bias-aware feedback, streaming progress, and a polished recruiter-friendly UI.

---

## ✨ Recruiter Snapshot

| Area | What This Project Demonstrates |
|---|---|
| **AI Engineering** | LangGraph JS agent workflow, RAG retrieval, LLM reasoning, tool calling, structured outputs |
| **Full-Stack Engineering** | Next.js App Router, Route Handlers, Zod schemas, TypeScript end-to-end, Vercel deployment |
| **Frontend Engineering** | Animated Next.js dashboard, Monaco code editor, real-time agent timeline, polished reports |
| **Product Thinking** | Solves a real hiring pain: inconsistent technical interview evaluation |
| **Responsible AI** | Bias mitigation, evidence-only feedback, and mandatory human review before hiring decisions |
| **Resume Value** | Strong end-to-end project that looks practical, technical, and business-aware |

---

## 🎯 Problem

Technical interview evaluation is often:

- Time-consuming for engineering teams
- Inconsistent across interviewers
- Hard to standardize across roles and seniority levels
- Vulnerable to vague or biased feedback
- Difficult to explain with clear evidence

This project solves that by building an **AI assistant for interviewers**, not a replacement for humans.

The system analyzes candidate code, retrieves the correct rubric, evaluates multiple technical dimensions, explains the reasoning with evidence, and clearly marks the final recommendation as **advisory only**.

---

## 🧠 What Makes This Project Impressive?

Most AI portfolio projects stop at “send prompt to LLM and show response.”

This project goes further:

- ✅ Uses a real **LangGraph multi-step agent workflow**
- ✅ Uses **RAG over hiring rubrics and expected solutions**
- ✅ Calls dedicated tools for code structure, complexity, edge cases, scoring, and feedback
- ✅ Produces structured JSON reports instead of unstructured text
- ✅ Streams agent progress in real time using SSE
- ✅ Supports both real OpenAI mode and deterministic demo mode
- ✅ Includes bias mitigation and human-in-the-loop review
- ✅ Ships with a polished animated single-page UI

---

## 🏗️ Architecture

```txt
┌─────────────────────────────────────────────────────────────┐
│                  Next.js App Router (TypeScript)            │
│                                                             │
│  Animated single-page dashboard                             │
│  Monaco code editor                                         │
│  Agent workflow timeline                                    │
│  Evidence-based evaluation report                           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              LangGraph JS Agent Workflow              │    │
│  │                                                     │    │
│  │  1. Validate Input                                  │    │
│  │  2. Parse Candidate Code                            │    │
│  │  3. Retrieve Rubrics with RAG                        │    │
│  │  4. Evaluate Correctness                            │    │
│  │  5. Analyze Complexity                              │    │
│  │  6. Detect Edge Cases                               │    │
│  │  7. Assess Code Quality                             │    │
│  │  8. Apply Bias Mitigation                           │    │
│  │  9. Score Against Rubric                            │    │
│  │ 10. Generate Recommendation                         │    │
│  │ 11. Build Final Report                              │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Route Handlers (app/api/)                                  │
│  ├─ GET  /api/health                                        │
│  └─ POST /api/evaluate                                      │
│                                                             │
│  Tools Layer (lib/tools/)                                   │
│  ├─ Code structure analyzer                                 │
│  ├─ Complexity estimator                                    │
│  ├─ Edge-case detector                                      │
│  ├─ Rubric retriever                                        │
│  ├─ Scoring engine                                          │
│  └─ Feedback generator                                      │
│                                                             │
│  RAG Layer (lib/rag/, lib/vector/)                          │
│  ├─ Upstash Vector (production)                             │
│  ├─ In-memory vector fallback (local/dev)                   │
│  ├─ Keyword search fallback                                 │
│  └─ 10 markdown knowledge-base documents                    │
│                                                             │
│  LLM Layer (lib/ai/)                                        │
│  ├─ OpenAI / OpenRouter via OpenAI SDK                      │
│  └─ Demo mode with deterministic heuristics                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔥 Core Features

### 1. Real Agentic Workflow

The evaluator does not generate a single LLM response directly. It passes each submission through an **11-node LangGraph workflow**, where every step performs a specific evaluation task.

| # | Node | Purpose |
|---|---|---|
| 1 | Input Validation | Validates code, role, seniority, and problem metadata |
| 2 | Code Parsing | Performs static analysis on candidate code |
| 3 | RAG Retrieval | Retrieves relevant rubrics, expected solutions, and feedback guidelines |
| 4 | Correctness Evaluation | Checks whether the candidate solved the core problem |
| 5 | Complexity Analysis | Estimates time and space complexity with reasoning |
| 6 | Edge Case Detection | Finds missing edge cases and failure scenarios |
| 7 | Code Quality Review | Reviews naming, readability, modularity, maintainability, and safety |
| 8 | Bias Mitigation | Removes personal assumptions and non-technical judgments |
| 9 | Scoring | Produces weighted scores across evaluation dimensions |
| 10 | Recommendation | Generates an evidence-based advisory recommendation |
| 11 | Report Generation | Returns a structured final report with citations and review notes |

---

### 2. RAG-Based Rubric Retrieval

The system retrieves role-specific evaluation criteria from a local knowledge base instead of relying only on the model’s memory.

Knowledge base documents include:

- Backend engineer rubric
- AI engineer rubric
- Full-stack engineer rubric
- Algorithm problem rubric
- System design rubric
- Code quality standards
- Bias mitigation guidelines
- Interview feedback format
- Expected solution for a rate limiter
- Expected solution for a RAG system

Documents are chunked (600 chars, 100 overlap), embedded with `text-embedding-3-small`, and stored in **Upstash Vector** (production) or **in-memory** with keyword fallback (local/dev).

This makes the evaluation more consistent, explainable, and grounded.

---

### 3. Tool Calling Layer

The agent uses dedicated tools to separate concerns and make the workflow easier to debug, test, and extend.

| Tool | Responsibility |
|---|---|
| `retrieve_rubric` | Finds role, seniority, and problem-specific evaluation criteria |
| `retrieve_problem_expectations` | Retrieves expected solution patterns |
| `analyze_code_structure` | Extracts functions, classes, imports, and logic patterns |
| `estimate_complexity` | Estimates time and space complexity |
| `detect_edge_cases` | Identifies missing null checks, limits, concurrency cases, and failure paths |
| `score_against_rubric` | Converts analysis into weighted technical scores |
| `generate_feedback` | Produces clear interviewer-ready feedback |
| `apply_bias_mitigation_check` | Ensures the final report is based only on technical evidence |

---

### 4. Human-in-the-Loop Hiring Safety

The system is intentionally designed to **assist**, not replace, interviewers.

Every report includes:

- Technical evidence
- Rubric citations
- Strengths and weaknesses
- Missed edge cases
- Bias mitigation notes
- Advisory recommendation
- Required human review flag

This makes the project stronger because it shows practical awareness of responsible AI in hiring workflows.

---

## 🖥️ UI Experience

The frontend is built as a polished, recruiter-friendly single-page dashboard.

It includes:

- Animated hero section
- Monaco code editor
- Role, seniority, and problem configuration
- Real-time agent progress timeline
- Workflow visualization
- Structured score cards
- Retrieved rubric evidence
- Human review warning section
- Smooth animations using Framer Motion
- Glassmorphism and gradient design system

The goal is to make the technical depth visible within the first 30 seconds of opening the project.

---

## 🧪 Example Evaluation Output

```json
{
  "candidate_name": "Ahmed Hassan",
  "role": "Backend Engineer",
  "seniority": "Mid",
  "problem_title": "Design a Rate Limiter",
  "overall_score": 84,
  "recommendation": "Hire",
  "scores": {
    "correctness": 85,
    "complexity": 80,
    "edge_cases": 75,
    "readability": 90,
    "maintainability": 85,
    "communication": 80
  },
  "time_complexity": "O(1) average per request",
  "space_complexity": "O(n) for tracked users and timestamps",
  "strengths": [
    "Solution is modular and easy to follow",
    "Uses clear data structures for request tracking",
    "Handles the main rate-limiting logic correctly"
  ],
  "weaknesses": [
    "Does not fully address distributed rate limiting",
    "Missing cleanup strategy for expired request records",
    "Concurrency behavior is not clearly handled"
  ],
  "missed_edge_cases": [
    "Concurrent requests from the same user",
    "Clock skew in distributed environments",
    "Memory growth under high-cardinality traffic"
  ],
  "bias_mitigation_notes": [
    "Feedback is based only on technical evidence from the submitted code.",
    "No personal traits or demographic assumptions were used.",
    "Human review is required before any hiring decision."
  ],
  "human_review_required": true,
  "demo_mode": false
}
```

---

## 🛠️ Tech Stack

### Application

- Next.js 16 (App Router)
- TypeScript (strict)
- Tailwind CSS
- Framer Motion
- Monaco Editor
- Lucide React

### AI & RAG

- LangGraph JS (@langchain/langgraph)
- OpenAI SDK (OpenAI / OpenRouter)
- Zod (schema validation)
- Upstash Vector
- In-memory vector fallback
- text-embedding-3-small

### Deployment

- **Single Vercel Next.js application** (no separate backend service)
- Repository root is the Next.js app root
- Serverless Node.js runtime
- Environment-based configuration
- Local demo mode without API key

> **Note:** `legacy_backend/` and `legacy_frontend/` are archived reference only. They are not used at runtime and are excluded from Vercel deployment via `.vercelignore`.

---

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd agentic-rag-interview-evaluator
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your API keys (optional — works in demo mode without keys)
```

---

### 4. Run Development Server

```bash
npm run dev
```

App runs on `http://localhost:3000`

---

### 5. Build for Production

```bash
npm run build
npm run start
```

---

## 🚀 Deploy to Vercel

1. Push your repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and import the repository.
3. Vercel should detect **Framework: Next.js** and **Root directory: /**. If not, make sure `.vercelignore` is present and the repository root contains `package.json` and `next.config.ts`.
4. Add environment variables in the Vercel dashboard:
   - `OPENAI_API_KEY` (or `OPENROUTER_API_KEY`, or `FALLBACK_API_KEY`)
   - `OPENAI_BASE_URL` (if using Groq or another OpenAI-compatible provider)
   - `LLM_MODEL` or `MODEL_NAME`
   - `FALLBACK_API_KEY`, `FALLBACK_BASE_URL`, `FALLBACK_MODEL` (optional fallback)
   - `EMBEDDING_MODEL`, `EMBEDDING_BASE_URL`, `EMBEDDING_API_KEY` (if using a separate embedding provider)
   - `UPSTASH_VECTOR_REST_URL` and `UPSTASH_VECTOR_REST_TOKEN` (for production RAG)
5. Deploy. Vercel automatically detects Next.js and runs `npm run build` from the repository root.

> **Important:** This project deploys as a single Next.js application. There is no separate FastAPI backend service. The API endpoints are Next.js Route Handlers at `app/api/health/route.ts` and `app/api/evaluate/route.ts`.

### Upstash Vector Indexing

Before first deployment with Upstash, index the knowledge base:

```bash
npx tsx scripts/index-knowledge-base.ts
```

---

## 🔐 Environment Variables

Create a `.env` file from `.env.example`.

```env
# LLM Provider
OPENAI_API_KEY=
OPENAI_BASE_URL=                      # e.g. https://api.groq.com/openai/v1
LLM_MODEL=                            # e.g. llama-3.3-70b-versatile or gpt-4o-mini
MODEL_NAME=                           # alias for LLM_MODEL

# Fallback LLM Provider
FALLBACK_API_KEY=
FALLBACK_BASE_URL=                    # e.g. https://openrouter.ai/api/v1
FALLBACK_MODEL=                       # e.g. meta-llama/llama-3.3-70b-instruct:free

# OpenRouter (alternative)
OPENROUTER_API_KEY=
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Embeddings
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_BASE_URL=                   # e.g. https://generativelanguage.googleapis.com/v1beta/openai
EMBEDDING_API_KEY=                    # if different from OPENAI_API_KEY

# Vector DB
UPSTASH_VECTOR_REST_URL=
UPSTASH_VECTOR_REST_TOKEN=
```

The project works without any API key using deterministic demo mode.

```txt
Demo mode active: using deterministic mock evaluation because no API key is configured.
```

---

## 📡 API Overview

### Evaluate Candidate

```http
POST /api/evaluate
```

Example request:

```json
{
  "candidate_name": "Ahmed Hassan",
  "role": "Backend Engineer",
  "seniority": "Mid",
  "problem_title": "Design a Rate Limiter",
  "problem_description": "Design and implement a rate limiter for user requests.",
  "candidate_code": "class RateLimiter:\n    ...",
  "language": "python"
}
```

---

### Health Check

```bash
curl http://localhost:3000/api/health
```

Returns:
```json
{
  "status": "ok",
  "mode": "production",
  "llmAvailable": true,
  "vectorAvailable": true,
  "vectorProvider": "upstash",
  "model": "gpt-4o-mini",
  "embeddingModel": "text-embedding-3-small",
  "knowledgeBaseLoaded": true
}
```

---

## 📁 Project Structure

```txt
/
  /app
    layout.tsx
    page.tsx
    globals.css
    /api
      /health/route.ts
      /evaluate/route.ts
  /components
    Hero.tsx
    EvaluatorDashboard.tsx
    EvaluationReport.tsx
    AgentTimeline.tsx
    WorkflowVisualization.tsx
    KnowledgeBaseSection.tsx
    EvaluationDimensions.tsx
    HumanInTheLoop.tsx
    ResumeImpact.tsx
  /lib
    api.ts
    /ai
      provider.ts
    /rag
      loader.ts
      chunker.ts
      retriever.ts
    /vector
      upstash.ts
      memory.ts
    /tools
      index.ts
    /langgraph
      state.ts
      graph.ts
    /prompts
      index.ts
  /types
    index.ts
    schemas.ts
  /knowledge_base
    backend_engineer_rubric.md
    ai_engineer_rubric.md
    fullstack_engineer_rubric.md
    rate_limiter_expected_solution.md
    rag_system_expected_solution.md
    algorithm_problem_rubric.md
    system_design_rubric.md
    code_quality_standards.md
    bias_mitigation_guidelines.md
    interview_feedback_format.md
  /scripts
    index-knowledge-base.ts
  /baseline
    capture_baseline.py
    /fixtures
      *.json
  /legacy_backend
    README.md
    (original FastAPI backend — reference only, not deployed)
  /legacy_frontend
    README.md
    (original frontend — reference only, not deployed)

README.md
.env.example
next.config.ts
tsconfig.json
package.json
.vercelignore
```

---

## 📌 Resume Bullets

Use these bullets directly on your resume:

- Built an **Agentic RAG technical interview evaluator** that analyzes candidate code, retrieves role-specific hiring rubrics, and generates structured evidence-based feedback.
- Implemented an **11-node LangGraph workflow** for input validation, code parsing, RAG retrieval, correctness evaluation, complexity analysis, edge-case detection, scoring, recommendation generation, and report creation.
- Designed a **RAG pipeline over hiring rubrics, expected solutions, code quality standards, and bias mitigation guidelines** using embeddings and vector search.
- Developed a polished **Next.js evaluation dashboard** with Monaco editor, real-time agent progress streaming, structured scorecards, and human-in-the-loop review safeguards.
- Added responsible AI controls including **bias mitigation checks, evidence-only feedback, advisory recommendations, and mandatory human review** before hiring decisions.

---

## 🚀 Future Improvements

- Add support for Java, Go, Rust, and JavaScript code analysis
- Add live interview transcript evaluation
- Add interviewer follow-up question generation
- Add custom rubric upload
- Add ATS integrations
- Add multi-agent evaluator debate
- Add organization-level calibration analytics
- Add candidate trend dashboards
- Add plagiarism and similarity detection
- Add secure sandboxed code execution for optional test-case validation

---

## 🧩 Why This Belongs in a Portfolio

This project is strong for AI Engineer, Backend Engineer, and Full-Stack AI Engineer applications because it combines:

- Practical business problem
- Real AI workflow
- RAG grounding
- Tool-based reasoning
- Backend API design
- Streaming UX
- Responsible AI
- Clean visual presentation
- Resume-ready impact

It proves the ability to build an AI system that is not only impressive in a demo, but also structured like a product that could be extended for real hiring teams.

---

## 📄 License

MIT — Portfolio and educational use.
