import "server-only";

import { loadMarkdownFiles } from "./loader";
import { chunkDocument, type Chunk } from "./chunker";
import { generateEmbedding, isDemoMode } from "../ai/provider";
import { searchMemory, buildMemoryIndex, isMemoryIndexReady, type SearchResult } from "../vector/memory";
export type { SearchResult } from "../vector/memory";
import { isUpstashAvailable, searchUpstash, upsertToUpstash } from "../vector/upstash";

// ---------------------------------------------------------------------------
// Module-level cache
// ---------------------------------------------------------------------------

let _chunksCache: Chunk[] | null = null;

async function getChunks(): Promise<Chunk[]> {
  if (_chunksCache) return _chunksCache;

  const docs = await loadMarkdownFiles();
  const allChunks: Chunk[] = [];
  for (const doc of docs) {
    const chunks = chunkDocument(doc);
    allChunks.push(...chunks);
  }
  _chunksCache = allChunks;
  return allChunks;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export type VectorProvider = "upstash" | "memory" | "keyword";

export function getVectorProvider(): VectorProvider {
  if (isUpstashAvailable()) return "upstash";
  if (!isDemoMode()) return "memory";
  return "keyword";
}

export async function isKnowledgeBaseLoaded(): Promise<boolean> {
  try {
    const chunks = await getChunks();
    return chunks.length > 0;
  } catch {
    return false;
  }
}

export async function ensureIndexBuilt(): Promise<void> {
  const chunks = await getChunks();

  if (isUpstashAvailable()) {
    // Upstash index should be built via scripts/index-knowledge-base.ts
    // We don't auto-build here to avoid latency on first request
    return;
  }

  if (!isMemoryIndexReady()) {
    await buildMemoryIndex(chunks, generateEmbedding);
  }
}

export async function retrieveRubric(
  role: string,
  seniority: string,
  problemType: string,
  problemTitle: string = "",
  query: string = "",
  k: number = 5
): Promise<SearchResult[]> {
  const finalQuery = query || `${role} ${seniority} ${problemType} ${problemTitle} rubric evaluation criteria`.trim();

  try {
    await ensureIndexBuilt();

    if (isUpstashAvailable()) {
      const queryEmbedding = await generateEmbedding(finalQuery);
      const results = await searchUpstash(queryEmbedding, k);
      if (results.length > 0) return results;
    }

    if (!isDemoMode()) {
      const queryEmbedding = await generateEmbedding(finalQuery);
      const results = await searchMemory(queryEmbedding, k);
      if (results.length > 0) return results;
    }
  } catch (err) {
    console.error(`[RAG] Vector search failed: ${err}, using keyword fallback`);
  }

  return keywordSearch(finalQuery, k);
}

export async function retrieveProblemExpectations(
  problemTitle: string
): Promise<SearchResult[]> {
  return retrieveRubric("", "", "", problemTitle, problemTitle, 3);
}

// ---------------------------------------------------------------------------
// Keyword fallback
// ---------------------------------------------------------------------------

function keywordSearch(query: string, k: number = 5): SearchResult[] {
  if (!_chunksCache) {
    // Can't do async here, so return empty if chunks not loaded
    return [];
  }

  const queryLower = query.toLowerCase();
  const queryWords = new Set(queryLower.split(/\s+/).filter((w) => w.length > 0));

  const scored: Array<{ score: number; chunk: Chunk }> = [];
  for (const chunk of _chunksCache) {
    const textLower = chunk.text.toLowerCase();
    let matches = 0;
    for (const word of queryWords) {
      if (textLower.includes(word)) matches++;
    }
    if (matches > 0) {
      scored.push({ score: matches / Math.max(queryWords.size, 1), chunk });
    }
  }

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, k).map(({ score, chunk }) => ({
    source: chunk.source,
    snippet: chunk.text.slice(0, 300).trim(),
    relevance: Math.round(score * 1000) / 1000,
  }));
}

// ---------------------------------------------------------------------------
// Indexing script support
// ---------------------------------------------------------------------------

export async function indexToUpstash(): Promise<void> {
  const chunks = await getChunks();
  await upsertToUpstash(chunks, generateEmbedding);
}

export async function getChunkCount(): Promise<number> {
  const chunks = await getChunks();
  return chunks.length;
}
