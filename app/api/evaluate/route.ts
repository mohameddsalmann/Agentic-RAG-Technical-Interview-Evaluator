import { NextResponse } from "next/server";

import { EvaluateRequestSchema } from "@/types/schemas";
import { runEvaluation } from "@/lib/langgraph/graph";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_INPUT_LENGTH = 50000;

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = EvaluateRequestSchema.safeParse(body);

  if (!parsed.success) {
    const errors = parsed.error.issues.map((i) => i.message);
    return NextResponse.json(
      { error: "Validation failed", details: errors },
      { status: 422 }
    );
  }

  const req = parsed.data;

  if (req.candidate_code.length > MAX_INPUT_LENGTH) {
    return NextResponse.json(
      { error: `Candidate code exceeds maximum length of ${MAX_INPUT_LENGTH} characters` },
      { status: 413 }
    );
  }

  try {
    const result = await runEvaluation(req);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/evaluate] Error:", err);
    return NextResponse.json(
      { error: "Evaluation failed", detail: String(err) },
      { status: 500 }
    );
  }
}
