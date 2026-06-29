import type { EvaluateRequest, EvaluateResponse, HealthResponse } from "@/types";

export async function checkHealth(): Promise<HealthResponse> {
  const res = await fetch("/api/health");
  if (!res.ok) throw new Error("Health check failed");
  return res.json();
}

export async function runEvaluation(req: EvaluateRequest): Promise<EvaluateResponse> {
  const res = await fetch("/api/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || err.detail || "Evaluation failed");
  }
  return res.json();
}
