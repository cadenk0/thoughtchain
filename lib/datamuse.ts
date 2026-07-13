/**
 * Datamuse API — free, no key, huge vocabulary, works for any English word.
 *
 * Endpoints used:
 *   ?rel_trg=word  → "triggered by" (free association / semantic triggers)
 *   ?ml=word       → "means like" (synonyms / semantic neighbors)
 *
 * We fetch both, merge by score, deduplicate, and take top 25.
 * Results are cached in memory (per server process) and on disk permanently.
 */

import fs from "fs";
import path from "path";

const CACHE_PATH = path.join(process.cwd(), "data", "association-cache.json");
const TOP_K = 25;
const BASE = "https://api.datamuse.com";

// In-memory cache
const memCache: Record<string, string[]> = {};

// ─── Disk cache ───────────────────────────────────────────────────────────────

function readDiskCache(): Record<string, string[]> {
  try { return JSON.parse(fs.readFileSync(CACHE_PATH, "utf-8")); }
  catch { return {}; }
}

function saveToDisk(word: string, associations: string[]): void {
  try {
    const existing = readDiskCache();
    existing[word] = associations;
    fs.writeFileSync(CACHE_PATH, JSON.stringify(existing, null, 2), "utf-8");
  } catch (e) {
    console.warn("[datamuse] Failed to write cache:", e);
  }
}

// ─── Datamuse fetch ───────────────────────────────────────────────────────────

interface DatamuseWord {
  word: string;
  score: number;
  tags?: string[];
}

async function fetchEndpoint(params: string): Promise<DatamuseWord[]> {
  const url = `${BASE}/words?${params}&max=50`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return [];
    const data: DatamuseWord[] = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.warn(`[datamuse] fetch failed for ${params}:`, e);
    return [];
  }
}

async function fetchAssociations(word: string): Promise<string[]> {
  const key = word.toLowerCase().trim();

  // Fetch triggered-by and means-like in parallel
  const [triggered, similar] = await Promise.all([
    fetchEndpoint(`rel_trg=${encodeURIComponent(key)}`),
    fetchEndpoint(`ml=${encodeURIComponent(key)}`),
  ]);

  // Merge: triggered words score at face value, similar words score at half weight
  // (so free associations rank higher than synonyms)
  const scoreMap = new Map<string, number>();

  for (const { word: w, score } of triggered) {
    const clean = w.toLowerCase().trim();
    if (clean && clean !== key && /^[a-z]+$/.test(clean)) {
      scoreMap.set(clean, (scoreMap.get(clean) ?? 0) + score);
    }
  }
  for (const { word: w, score } of similar) {
    const clean = w.toLowerCase().trim();
    if (clean && clean !== key && /^[a-z]+$/.test(clean)) {
      scoreMap.set(clean, (scoreMap.get(clean) ?? 0) + Math.floor(score * 0.5));
    }
  }

  // Sort by combined score descending
  const sorted = [...scoreMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, TOP_K)
    .map(([w]) => w);

  return sorted;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function getAssociations(word: string): Promise<string[]> {
  const key = word.toLowerCase().trim();
  if (!key) return [];

  // 1. Memory
  if (memCache[key]?.length >= 5) return memCache[key];

  // 2. Disk
  const disk = readDiskCache();
  if (disk[key]?.length >= 5) {
    memCache[key] = disk[key];
    return disk[key];
  }

  // 3. Datamuse API
  console.log(`[datamuse] Fetching associations for "${key}"`);
  const results = await fetchAssociations(key);

  if (results.length > 0) {
    memCache[key] = results;
    saveToDisk(key, results);
    console.log(`[datamuse] ✓ cached ${results.length} words for "${key}"`);
  } else {
    console.warn(`[datamuse] No results for "${key}"`);
  }

  return results;
}

/** Check a guess. Returns rank (1-based, -1 if not found), associations list. */
export async function checkGuess(
  currentWord: string,
  guess: string
): Promise<{ valid: boolean; rank: number; associations: string[] }> {
  const associations = await getAssociations(currentWord);
  if (!associations.length) return { valid: false, rank: -1, associations: [] };

  const normalizedGuess = guess.toLowerCase().trim();
  const idx = associations.indexOf(normalizedGuess);
  const rank = idx + 1; // 0 if not found → rank 0
  const valid = rank > 0 && rank <= TOP_K;

  return { valid, rank: valid ? rank : -1, associations };
}

export function getCacheStats(): { memory: number; disk: number } {
  return {
    memory: Object.keys(memCache).length,
    disk: Object.keys(readDiskCache()).length,
  };
}

/**
 * BFS to find a path from startWord to targetWord through associations.
 * Returns null if no path found within maxDepth steps.
 * Used server-side to guarantee bridge puzzles are solvable.
 */
export async function findPath(
  startWord: string,
  targetWord: string,
  maxDepth = 6
): Promise<string[] | null> {
  const start = startWord.toLowerCase().trim();
  const target = targetWord.toLowerCase().trim();
  if (start === target) return [start];

  // BFS queue: each element is [currentWord, pathSoFar]
  const queue: [string, string[]][] = [[start, [start]]];
  const visited = new Set<string>([start]);

  while (queue.length > 0) {
    const [word, path] = queue.shift()!;
    if (path.length > maxDepth) continue;

    const assocs = await getAssociations(word);
    for (const assoc of assocs.slice(0, 15)) { // top 15 per word for speed
      if (assoc === target) return [...path, assoc];
      if (!visited.has(assoc) && path.length < maxDepth) {
        visited.add(assoc);
        queue.push([assoc, [...path, assoc]]);
      }
    }
  }
  return null;
}
