import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";

export interface KnowledgeDoc {
  source: string;
  content: string;
}

let _docsCache: KnowledgeDoc[] | null = null;

export async function loadMarkdownFiles(): Promise<KnowledgeDoc[]> {
  if (_docsCache) return _docsCache;

  const kbDir = path.join(process.cwd(), "knowledge_base");
  const files = await fs.readdir(kbDir);
  const mdFiles = files.filter((f) => f.endsWith(".md")).sort();

  const docs: KnowledgeDoc[] = [];
  for (const filename of mdFiles) {
    const filepath = path.join(kbDir, filename);
    const content = await fs.readFile(filepath, "utf-8");
    docs.push({ source: filename, content });
  }

  _docsCache = docs;
  return docs;
}

export function isKnowledgeBaseLoaded(): boolean {
  return _docsCache !== null && _docsCache.length > 0;
}

export function resetCache(): void {
  _docsCache = null;
}
