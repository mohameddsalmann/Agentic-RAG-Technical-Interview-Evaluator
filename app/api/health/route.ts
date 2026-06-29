import { NextResponse } from "next/server";

import { isDemoMode, getLLMModelName, getEmbeddingModel } from "@/lib/ai/provider";
import { getVectorProvider } from "@/lib/rag/retriever";
import { isKnowledgeBaseLoaded } from "@/lib/rag/loader";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 10;

export async function GET() {
  const demoMode = isDemoMode();
  const vectorProvider = getVectorProvider();

  let kbLoaded = false;
  try {
    kbLoaded = await isKnowledgeBaseLoaded();
  } catch {
    kbLoaded = false;
  }

  return NextResponse.json({
    status: "ok",
    mode: demoMode ? "demo" : "production",
    llmAvailable: !demoMode,
    vectorAvailable: vectorProvider !== "keyword",
    vectorProvider,
    model: demoMode ? null : getLLMModelName(),
    embeddingModel: demoMode ? null : getEmbeddingModel(),
    knowledgeBaseLoaded: kbLoaded,
  });
}
