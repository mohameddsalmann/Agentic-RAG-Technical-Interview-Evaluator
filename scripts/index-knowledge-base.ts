#!/usr/bin/env tsx
/**
 * Index knowledge base markdown files into Upstash Vector.
 *
 * Usage: npx tsx scripts/index-knowledge-base.ts
 *
 * Requires UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN env vars.
 */

import { indexToUpstash, getChunkCount } from "../lib/rag/retriever";

async function main() {
  console.log("=== Knowledge Base Indexing Script ===\n");

  if (!process.env.UPSTASH_VECTOR_REST_URL || !process.env.UPSTASH_VECTOR_REST_TOKEN) {
    console.error("Error: UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN must be set.");
    process.exit(1);
  }

  const count = await getChunkCount();
  console.log(`Found ${count} chunks to index.`);

  console.log("Indexing to Upstash Vector...");
  await indexToUpstash();
  console.log("Indexing complete!");
}

main().catch((err) => {
  console.error("Indexing failed:", err);
  process.exit(1);
});
