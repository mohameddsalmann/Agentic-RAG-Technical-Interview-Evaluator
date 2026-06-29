import "server-only";

import type { Chunk } from "../rag/chunker";

export interface SearchResult {
  source: string;
  snippet: string;
  relevance: number;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

interface CachedEmbedding {
  chunk: Chunk;
  embedding: number[];
}

let _cache: CachedEmbedding[] | null = null;

export async function buildMemoryIndex(
  chunks: Chunk[],
  embedFn: (text: string) => Promise<number[]>
): Promise<void> {
  if (_cache) return;

  _cache = [];
  for (const chunk of chunks) {
    const embedding = await embedFn(chunk.text);
    _cache.push({ chunk, embedding });
  }
}

export async function searchMemory(
  queryEmbedding: number[],
  k: number = 5
): Promise<SearchResult[]> {
  if (!_cache || _cache.length === 0) return [];

  const scored = _cache.map(({ chunk, embedding }) => ({
    chunk,
    score: cosineSimilarity(queryEmbedding, embedding),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, k).map(({ chunk, score }) => ({
    source: chunk.source,
    snippet: chunk.text.slice(0, 300).trim(),
    relevance: Math.round(Math.max(0, score) * 1000) / 1000,
  }));
}

export function isMemoryIndexReady(): boolean {
  return _cache !== null && _cache.length > 0;
}

export function resetMemoryIndex(): void {
  _cache = null;
}
