/**
 * Generates guaranteed-solvable bridge pairs using a deterministic
 * 4-step random walk through Datamuse associations.
 *
 * Given a date-based seed, we:
 * 1. Pick a start word from a curated list using the seed
 * 2. Walk exactly 4 steps through top-25 Datamuse associations,
 *    using the seed to pick which association to follow at each step
 * 3. The word at step 4 becomes the target
 *
 * This guarantees the puzzle is solvable in exactly 4 steps because
 * we literally walked it. The solution path is stored alongside.
 */

import { getAssociations } from "@/lib/datamuse";

// Seeded pseudo-random number generator (Mulberry32)
function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Turn a date string like "2024-01-15" into a numeric seed
function dateSeed(dateStr: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < dateStr.length; i++) {
    h ^= dateStr.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h;
}

// Pool of interesting seed words to start walks from
const SEED_WORDS = [
  "ocean", "fire", "dream", "star", "forest", "music", "time", "mountain",
  "shadow", "river", "gold", "cloud", "mind", "stone", "wind", "blood",
  "light", "night", "rain", "sun", "ice", "thunder", "glass", "smoke",
  "rose", "wolf", "city", "road", "storm", "mirror", "key", "bone",
  "bird", "clock", "moon", "water", "leaf", "bread", "voice", "sleep",
  "snow", "earth", "ship", "sword", "door", "crown", "dust", "bridge",
  "garden", "bell", "cave", "iron", "lake", "web", "salt", "fog",
  "tide", "ember", "root", "seed", "map", "horn", "path", "arrow",
];

export interface BridgePuzzle {
  startWord: string;
  targetWord: string;
  solutionPath: string[]; // [startWord, step1, step2, step3, targetWord]
  generatedAt: string;    // dayId
}

// In-memory cache so we don't regenerate within the same server process
const puzzleCache: Record<string, BridgePuzzle> = {};

export async function generateBridgePuzzle(dayId: string): Promise<BridgePuzzle | null> {
  if (puzzleCache[dayId]) return puzzleCache[dayId];

  const seed = dateSeed(dayId);
  const rng  = mulberry32(seed);

  // Pick start word deterministically from seed
  const startWord = SEED_WORDS[Math.floor(rng() * SEED_WORDS.length)];

  // Walk exactly 4 steps, picking from top-25 associations at each step
  // We try a few walk attempts in case a word has no associations
  const path: string[] = [startWord];
  const used = new Set<string>([startWord]);

  for (let step = 0; step < 4; step++) {
    const current = path[path.length - 1];
    const assocs  = await getAssociations(current);

    // Filter out already-used words
    const candidates = assocs.filter(w => !used.has(w));
    if (candidates.length === 0) return null; // shouldn't happen with Datamuse

    // Pick deterministically using rng — pick from top 8 to keep chains interesting
    const pool  = candidates.slice(0, Math.min(8, candidates.length));
    const pick  = pool[Math.floor(rng() * pool.length)];
    path.push(pick);
    used.add(pick);
  }

  const puzzle: BridgePuzzle = {
    startWord:    path[0],
    targetWord:   path[path.length - 1],
    solutionPath: path,
    generatedAt:  dayId,
  };

  puzzleCache[dayId] = puzzle;
  return puzzle;
}
