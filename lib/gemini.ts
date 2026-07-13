/**
 * Gemini association engine.
 *
 * AQ. auth keys (June 2026+): use x-goog-api-key header.
 *   - Primary: Interactions API (/v1beta/interactions) with gemini-3.5-flash
 *   - Fallback: generateContent (/v1beta/models/...generateContent) with gemini-2.0-flash
 *
 * AIza standard keys (legacy): use ?key= query param.
 *   - generateContent endpoint only
 */

import fs from "fs";
import path from "path";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const CACHE_PATH = path.join(process.cwd(), "data", "association-cache.json");
const TOP_K = 30;

const isAuthKey = !!GEMINI_API_KEY?.startsWith("AQ.");

// In-memory cache and per-model rate-limit cooldowns
const memCache: Record<string, string[]> = {};
const modelCooldowns: Record<string, number> = {};

// Startup log
if (GEMINI_API_KEY) {
  console.log(`[gemini] Key loaded — type: ${isAuthKey ? "AQ. (Interactions API)" : "AIza (generateContent)"}, prefix: ${GEMINI_API_KEY.slice(0, 12)}...`);
} else {
  console.warn("[gemini] WARNING: GEMINI_API_KEY not set. Add it to .env.local and restart.");
}

// ─── Disk cache ───────────────────────────────────────────────────────────────

function readDiskCache(): Record<string, string[]> {
  try { return JSON.parse(fs.readFileSync(CACHE_PATH, "utf-8")); }
  catch { return {}; }
}

function writeToDiskCache(word: string, associations: string[]): void {
  try {
    const existing = readDiskCache();
    existing[word] = associations;
    fs.writeFileSync(CACHE_PATH, JSON.stringify(existing, null, 2), "utf-8");
  } catch (e) {
    console.warn("[gemini] Failed to write disk cache:", e);
  }
}

// ─── Shared response handler ──────────────────────────────────────────────────

async function parseResponse(response: Response, model: string, word: string): Promise<string[] | null> {
  if (!response.ok) {
    let body: any = {};
    try { body = await response.json(); } catch {}

    const status = body?.error?.status ?? "";
    const message = body?.error?.message ?? JSON.stringify(body).slice(0, 200);

    if (response.status === 429 || status === "RESOURCE_EXHAUSTED") {
      const retryInfo = body?.error?.details?.find((d: any) => d["@type"]?.includes("RetryInfo"));
      const retrySec = parseInt(String(retryInfo?.retryDelay ?? "60").replace(/\D/g, "")) || 60;
      modelCooldowns[model] = Date.now() + (retrySec + 5) * 1000;
      console.warn(`[gemini] ${model} rate-limited — cooldown ${retrySec + 5}s`);
      return null;
    }

    console.error(`[gemini] ${model} HTTP ${response.status}: ${message}`);
    return null;
  }

  let body: any = {};
  try { body = await response.json(); } catch {
    console.error(`[gemini] ${model} failed to parse JSON response`);
    return null;
  }

  // Extract text from Interactions API response (steps array)
  // Structure: { steps: [{ type: "model_output", content: [{ type: "text", text: "..." }] }] }
  let text = "";
  if (body?.steps) {
    for (const step of body.steps) {
      if (step.type === "model_output") {
        for (const block of step.content ?? []) {
          if (block.type === "text" && block.text) {
            text = block.text.trim();
            break;
          }
        }
      }
      if (text) break;
    }
  }

  // Extract text from generateContent response (candidates array)
  // Structure: { candidates: [{ content: { parts: [{ text: "..." }] } }] }
  if (!text && body?.candidates) {
    text = body.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
  }

  if (!text) {
    console.error(`[gemini] ${model} returned empty text for "${word}". Full response:`, JSON.stringify(body).slice(0, 300));
    return null;
  }

  // Parse the JSON array from the text
  const clean = text.replace(/```json\n?|```/g, "").trim();
  try {
    const parsed = JSON.parse(clean);
    if (!Array.isArray(parsed)) {
      console.error(`[gemini] ${model} response was not an array for "${word}":`, clean.slice(0, 100));
      return null;
    }
    const result = (parsed as unknown[])
      .filter((x): x is string => typeof x === "string")
      .map((s) => s.toLowerCase().trim().replace(/[^a-z\s]/g, "").trim())
      .filter((s) => s.length > 1 && s !== word.toLowerCase())
      .slice(0, TOP_K);
    if (result.length < 10) {
      console.error(`[gemini] ${model} only returned ${result.length} valid words for "${word}"`);
      return null;
    }
    return result;
  } catch (e) {
    console.error(`[gemini] ${model} JSON parse failed for "${word}". Text was:`, clean.slice(0, 150));
    return null;
  }
}

// ─── Prompt ───────────────────────────────────────────────────────────────────

const PROMPT = (word: string) =>
  `You are a semantic association expert modeling average human word associations.

For the word "${word}", list exactly 30 words that people most commonly free-associate with it, ranked from STRONGEST to WEAKEST association.

Rules:
- Single words only (no phrases, no hyphens)
- Common English words a typical adult would think of
- Ranked by how many people would think of it first
- No repeats, no punctuation, all lowercase
- Return ONLY a valid JSON array of exactly 30 strings, nothing else, no explanation

Example output: ["bone","cat","pet","bark","puppy","leash","fur","tail","fetch","friend","loyal","wag","collar","paw","vet","walk","kennel","breed","guard","bite","hound","bark","sniff","play","jump","sit","heel","kibble","treat","cuddle"]`;

// ─── Interactions API call (AQ. keys) ────────────────────────────────────────

async function callInteractionsAPI(model: string, word: string): Promise<string[] | null> {
  if (!GEMINI_API_KEY) return null;
  if (modelCooldowns[model] && Date.now() < modelCooldowns[model]) {
    console.log(`[gemini] ${model} in cooldown (${Math.ceil((modelCooldowns[model] - Date.now()) / 1000)}s left)`);
    return null;
  }

  console.log(`[gemini] Interactions API → ${model} for "${word}"`);
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY,
      "Api-Revision": "2026-05-20",
    },
    body: JSON.stringify({
      model,
      input: PROMPT(word),
      store: false, // stateless — we manage our own cache
    }),
  });

  return parseResponse(response, model, word);
}

// ─── generateContent API call (both key types) ───────────────────────────────

async function callGenerateContent(model: string, word: string): Promise<string[] | null> {
  if (!GEMINI_API_KEY) return null;
  if (modelCooldowns[model] && Date.now() < modelCooldowns[model]) {
    console.log(`[gemini] ${model} in cooldown (${Math.ceil((modelCooldowns[model] - Date.now()) / 1000)}s left)`);
    return null;
  }

  // AQ. keys use x-goog-api-key header; AIza keys use ?key= query param
  const url = isAuthKey
    ? `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
    : `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (isAuthKey) headers["x-goog-api-key"] = GEMINI_API_KEY;

  console.log(`[gemini] generateContent → ${model} for "${word}"`);
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      contents: [{ parts: [{ text: PROMPT(word) }] }],
      generationConfig: { maxOutputTokens: 400, temperature: 0.1, topP: 0.8 },
    }),
  });

  return parseResponse(response, model, word);
}

// ─── Generate with full fallback chain ───────────────────────────────────────

async function generateAssociations(word: string): Promise<string[] | null> {
  if (!GEMINI_API_KEY) return null;

  if (isAuthKey) {
    // AQ. key path: try Interactions API first, then generateContent fallback
    const interactionsModels = ["gemini-3.5-flash", "gemini-2.0-flash"];
    for (const model of interactionsModels) {
      try {
        const result = await callInteractionsAPI(model, word);
        if (result) return result;
      } catch (e) {
        console.error(`[gemini] Interactions API ${model} threw:`, e);
      }
    }

    // Fallback to generateContent with AQ. key
    const generateModels = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-flash"];
    for (const model of generateModels) {
      try {
        const result = await callGenerateContent(model, word);
        if (result) return result;
      } catch (e) {
        console.error(`[gemini] generateContent ${model} threw:`, e);
      }
    }
  } else {
    // AIza key path: generateContent only
    const models = ["gemini-2.0-flash-lite", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b"];
    for (const model of models) {
      try {
        const result = await callGenerateContent(model, word);
        if (result) return result;
      } catch (e) {
        console.error(`[gemini] generateContent ${model} threw:`, e);
      }
    }
  }

  console.error(`[gemini] All methods exhausted for "${word}"`);
  return null;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export type AssociationSource = "memory" | "disk" | "gemini" | "none";

export interface AssociationResult {
  associations: string[];
  source: AssociationSource;
  cached: boolean;
}

export async function getAssociations(word: string): Promise<AssociationResult> {
  const key = word.toLowerCase().trim();
  if (!key) return { associations: [], source: "none", cached: true };

  // 1. Memory cache
  if (memCache[key]?.length >= 10) return { associations: memCache[key], source: "memory", cached: true };

  // 2. Disk cache
  const disk = readDiskCache();
  if (disk[key]?.length >= 10) {
    memCache[key] = disk[key];
    return { associations: disk[key], source: "disk", cached: true };
  }

  // 3. Gemini (slow path)
  console.log(`[gemini] cache miss for "${key}"`);
  const generated = await generateAssociations(key);
  if (generated?.length) {
    memCache[key] = generated;
    writeToDiskCache(key, generated);
    return { associations: generated, source: "gemini", cached: false };
  }

  return { associations: [], source: "none", cached: false };
}

export async function checkGuess(
  currentWord: string,
  guess: string
): Promise<{ valid: boolean; rank: number; associations: string[]; source: AssociationSource; cached: boolean }> {
  const result = await getAssociations(currentWord);
  if (!result.associations.length) {
    return { valid: false, rank: -1, associations: [], source: result.source, cached: result.cached };
  }
  const normalizedGuess = guess.toLowerCase().trim();
  const idx = result.associations.indexOf(normalizedGuess);
  const rank = idx + 1;
  const valid = rank > 0 && rank <= TOP_K;
  return { valid, rank: valid ? rank : -1, associations: result.associations, source: result.source, cached: result.cached };
}

export function getCacheStats() {
  const disk = readDiskCache();
  const cooldowns = Object.entries(modelCooldowns)
    .filter(([, until]) => Date.now() < until)
    .map(([model, until]) => ({ model, recoverIn: `${Math.ceil((until - Date.now()) / 1000)}s` }));
  return { memory: Object.keys(memCache).length, disk: Object.keys(disk).length, cooldowns };
}

export async function warmWord(word: string): Promise<boolean> {
  const result = await getAssociations(word);
  return result.associations.length > 0;
}
