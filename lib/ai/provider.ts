import "server-only";

import OpenAI from "openai";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

function getApiKey(): string | null {
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  const openrouterKey = process.env.OPENROUTER_API_KEY?.trim();
  const fallbackKey = process.env.FALLBACK_API_KEY?.trim();
  return openaiKey || openrouterKey || fallbackKey || null;
}

function getBaseUrl(): string | null {
  const openaiUrl = process.env.OPENAI_BASE_URL?.trim();
  if (openaiUrl) return openaiUrl;
  const openrouterUrl = process.env.OPENROUTER_BASE_URL?.trim();
  if (openrouterUrl) return openrouterUrl;
  const fallbackUrl = process.env.FALLBACK_BASE_URL?.trim();
  if (fallbackUrl) return fallbackUrl;
  return null;
}

function getModelName(): string {
  const envModel = process.env.MODEL_NAME?.trim() || process.env.LLM_MODEL?.trim();
  if (envModel) return envModel;
  if (process.env.OPENROUTER_API_KEY?.trim() || process.env.FALLBACK_API_KEY?.trim()) {
    return process.env.FALLBACK_MODEL?.trim() || "google/gemini-2.0-flash-001";
  }
  return "gpt-4o-mini";
}

function getEmbeddingModelName(): string {
  return process.env.EMBEDDING_MODEL?.trim() || "text-embedding-3-small";
}

function getEmbeddingBaseUrl(): string | null {
  const embeddingUrl = process.env.EMBEDDING_BASE_URL?.trim();
  if (embeddingUrl) return embeddingUrl;
  return getBaseUrl();
}

function getEmbeddingApiKey(): string | null {
  const embeddingKey = process.env.EMBEDDING_API_KEY?.trim();
  if (embeddingKey) return embeddingKey;
  return getApiKey();
}

// ---------------------------------------------------------------------------
// Public flags
// ---------------------------------------------------------------------------

export function isDemoMode(): boolean {
  return !getApiKey();
}

export function getLLMModelName(): string {
  return getModelName();
}

export function getEmbeddingModel(): string {
  return getEmbeddingModelName();
}

// ---------------------------------------------------------------------------
// Model instance
// ---------------------------------------------------------------------------

let _client: OpenAI | null = null;
let _embeddingClient: OpenAI | null = null;

function getClient(): OpenAI | null {
  if (isDemoMode()) return null;

  if (_client) return _client;

  const apiKey = getApiKey()!;
  const baseUrl = getBaseUrl();

  _client = new OpenAI({
    apiKey,
    ...(baseUrl ? { baseURL: baseUrl } : {}),
  });

  return _client;
}

function getEmbeddingClient(): OpenAI | null {
  if (isDemoMode()) return null;

  if (_embeddingClient) return _embeddingClient;

  const apiKey = getEmbeddingApiKey();
  if (!apiKey) return null;

  const baseUrl = getEmbeddingBaseUrl();

  _embeddingClient = new OpenAI({
    apiKey,
    ...(baseUrl ? { baseURL: baseUrl } : {}),
  });

  return _embeddingClient;
}

// ---------------------------------------------------------------------------
// LLM call with retry/backoff
// ---------------------------------------------------------------------------

export async function callLLM(prompt: string, system: string = ""): Promise<string> {
  if (isDemoMode()) return "";

  const client = getClient();
  if (!client) return "";

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = system
    ? [{ role: "system", content: system }, { role: "user", content: prompt }]
    : [{ role: "user", content: prompt }];

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const completion = await client.chat.completions.create({
        model: getModelName(),
        messages,
        temperature: 0.2,
        max_tokens: 2000,
      });
      return completion.choices[0]?.message?.content ?? "";
    } catch (err) {
      const errStr = String(err);
      if (errStr.includes("429") && attempt < 2) {
        const wait = 5000 * (attempt + 1);
        console.warn(`[LLM] Rate limited (429), retrying in ${wait}ms (attempt ${attempt + 1}/3)...`);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
      console.error(`[LLM] Call failed: ${err}`);

      // Try fallback provider if configured
      const fallbackKey = process.env.FALLBACK_API_KEY?.trim();
      const fallbackUrl = process.env.FALLBACK_BASE_URL?.trim();
      const fallbackModel = process.env.FALLBACK_MODEL?.trim();
      if (fallbackKey && fallbackUrl && fallbackModel && attempt === 0) {
        console.warn(`[LLM] Attempting fallback provider: ${fallbackModel}`);
        try {
          const fallbackClient = new OpenAI({ apiKey: fallbackKey, baseURL: fallbackUrl });
          const fbCompletion = await fallbackClient.chat.completions.create({
            model: fallbackModel,
            messages,
            temperature: 0.2,
            max_tokens: 2000,
          });
          return fbCompletion.choices[0]?.message?.content ?? "";
        } catch (fbErr) {
          console.error(`[LLM] Fallback also failed: ${fbErr}`);
        }
      }
      return "";
    }
  }
  return "";
}

// ---------------------------------------------------------------------------
// Embeddings
// ---------------------------------------------------------------------------

export async function generateEmbedding(text: string): Promise<number[]> {
  if (isDemoMode()) {
    return dummyEmbedding(text);
  }

  try {
    const client = getEmbeddingClient();
    if (!client) return dummyEmbedding(text);

    const response = await client.embeddings.create({
      model: getEmbeddingModelName(),
      input: text,
    });
    return response.data[0].embedding;
  } catch (err) {
    console.error(`[Embedding] Failed, using dummy: ${err}`);
    return dummyEmbedding(text);
  }
}

// ---------------------------------------------------------------------------
// Dummy embedding (deterministic hash-based, for demo mode)
// ---------------------------------------------------------------------------

async function dummyEmbedding(text: string): Promise<number[]> {
  const dim = 256;
  const crypto = await import("node:crypto");
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);

  const vec: number[] = [];
  let h: Buffer = Buffer.from(bytes);

  while (vec.length < dim) {
    h = crypto.createHash("sha256").update(h).digest();
    for (let i = 0; i < h.length && vec.length < dim; i++) {
      vec.push((h[i] - 128) / 128.0);
    }
  }

  return vec.slice(0, dim);
}

// ---------------------------------------------------------------------------
// JSON response parser
// ---------------------------------------------------------------------------

export function parseJsonResponse(text: string): Record<string, unknown> {
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    // continue
  }

  const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1]);
    } catch {
      // continue
    }
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {
      // continue
    }
  }

  return {};
}
