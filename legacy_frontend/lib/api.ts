import type { EvaluateRequest, EvaluateResponse, HealthResponse } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function checkHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_URL}/api/health`);
  if (!res.ok) throw new Error("Health check failed");
  return res.json();
}

export async function runEvaluation(req: EvaluateRequest): Promise<EvaluateResponse> {
  const res = await fetch(`${API_URL}/api/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || "Evaluation failed");
  }
  return res.json();
}

export async function startEvaluation(req: EvaluateRequest): Promise<{ job_id: string; status: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(`${API_URL}/api/evaluate/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error("Failed to start evaluation");
    return res.json();
  } finally {
    clearTimeout(timeout);
  }
}

export async function pollStatus(jobId: string): Promise<{ job_id: string; status: string; steps: any[] }> {
  const res = await fetch(`${API_URL}/api/evaluate/status/${jobId}`);
  if (!res.ok) throw new Error("Status poll failed");
  return res.json();
}

export async function getResult(jobId: string): Promise<EvaluateResponse> {
  const res = await fetch(`${API_URL}/api/evaluate/result/${jobId}`);
  if (!res.ok) throw new Error("Failed to get result");
  return res.json();
}
