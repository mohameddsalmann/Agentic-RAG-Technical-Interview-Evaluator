import "server-only";

import type { KnowledgeDoc } from "./loader";

export interface Chunk {
  source: string;
  text: string;
  offset: number;
  metadata: Record<string, string>;
}

export function chunkDocument(
  doc: KnowledgeDoc,
  chunkSize: number = 600,
  overlap: number = 100
): Chunk[] {
  const { content, source } = doc;
  const chunks: Chunk[] = [];
  let start = 0;

  while (start < content.length) {
    const end = start + chunkSize;
    const chunkText = content.slice(start, end);
    chunks.push({
      source,
      text: chunkText,
      offset: start,
      metadata: extractMetadata(source),
    });

    if (end >= content.length) break;
    start = end - overlap;
  }

  return chunks;
}

export function extractMetadata(source: string): Record<string, string> {
  const meta: Record<string, string> = { source };
  const name = source.toLowerCase();

  if (name.includes("backend")) meta.role = "Backend Engineer";
  else if (name.includes("ai_engineer")) meta.role = "AI Engineer";
  else if (name.includes("fullstack")) meta.role = "Full Stack Engineer";

  if (name.includes("rate_limiter")) {
    meta.problem_type = "System Design";
    meta.problem = "Design a Rate Limiter";
  }
  if (name.includes("rag_system")) {
    meta.problem_type = "RAG System";
    meta.problem = "Design a RAG System";
  }
  if (name.includes("algorithm")) meta.problem_type = "Algorithm";
  if (name.includes("system_design")) meta.problem_type = "System Design";
  if (name.includes("code_quality")) meta.topic = "code_quality";
  if (name.includes("bias")) meta.topic = "bias_mitigation";
  if (name.includes("feedback")) meta.topic = "feedback_format";

  return meta;
}
