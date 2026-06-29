import "server-only";

import { Index } from "@upstash/vector";
import type { Chunk } from "../rag/chunker";
import type { SearchResult } from "./memory";

let _index: Index | null = null;

function getIndex(): Index | null {
  const url = process.env.UPSTASH_VECTOR_REST_URL?.trim();
  const token = process.env.UPSTASH_VECTOR_REST_TOKEN?.trim();

  if (!url || !token) return null;

  if (_index) return _index;

  _index = new Index({ url, token });
  return _index;
}

export function isUpstashAvailable(): boolean {
  return getIndex() !== null;
}

export async function upsertToUpstash(
  chunks: Chunk[],
  embedFn: (text: string) => Promise<number[]>
): Promise<void> {
  const index = getIndex();
  if (!index) throw new Error("Upstash Vector not configured");

  const vectors = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const embedding = await embedFn(chunk.text);
    vectors.push({
      id: i.toString(),
      vector: embedding,
      metadata: {
        source: chunk.source,
        text: chunk.text,
        ...chunk.metadata,
      },
    });
  }

  await index.upsert(vectors);
}

export async function searchUpstash(
  queryEmbedding: number[],
  k: number = 5
): Promise<SearchResult[]> {
  const index = getIndex();
  if (!index) return [];

  const results = await index.query({
    vector: queryEmbedding,
    topK: k,
    includeMetadata: true,
  });

  return results.map((result) => ({
    source: (result.metadata?.source as string) ?? "unknown",
    snippet: ((result.metadata?.text as string) ?? "").slice(0, 300).trim(),
    relevance: Math.round((result.score ?? 0) * 1000) / 1000,
  }));
}
