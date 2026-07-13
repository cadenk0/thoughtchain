import { LeaderboardEntry, GameMode } from "@/types";

interface InMemoryStore {
  leaderboards: { [key: string]: LeaderboardEntry[] }; // key = `${dayId}:${mode}`
  rateLimits: { [key: string]: { count: number; resetAt: number } };
}

const memStore: InMemoryStore = { leaderboards: {}, rateLimits: {} };

function boardKey(dayId: string, mode: GameMode) {
  return `${dayId}:${mode}`;
}

/**
 * Bridge score: lower is better.
 * Formula: steps * 100 - totalPoints
 * Fewer steps = much better; tie-broken by semantic quality (points).
 */
function bridgeScore(entry: LeaderboardEntry): number {
  return entry.chainLength * 100 - (entry.totalPoints ?? 0);
}

export async function getLeaderboard(
  dayId: string,
  mode: GameMode,
  limit = 50
): Promise<LeaderboardEntry[]> {
  const entries = memStore.leaderboards[boardKey(dayId, mode)] || [];

  const sorted = [...entries].sort((a, b) => {
    if (mode === "bridge") {
      // Won first, then by bridgeScore ascending (fewer steps + higher quality)
      if (a.won !== b.won) return (b.won ? 1 : 0) - (a.won ? 1 : 0);
      return bridgeScore(a) - bridgeScore(b);
    }
    // Endless: highest points first, tie-break chain length, then speed
    return (
      (b.totalPoints ?? 0) - (a.totalPoints ?? 0) ||
      b.chainLength - a.chainLength ||
      a.duration - b.duration
    );
  });

  return sorted.slice(0, limit).map((e, i) => ({ ...e, rank: i + 1 }));
}

export async function resetLeaderboard(dayId: string, mode: GameMode): Promise<void> {
  memStore.leaderboards[boardKey(dayId, mode)] = [];
}

export async function submitToLeaderboard(
  entry: Omit<LeaderboardEntry, "rank"> & { dayId: string }
): Promise<void> {
  const { dayId, gameMode } = entry as any;
  if (!dayId || !gameMode) return;
  const key = boardKey(dayId, gameMode);
  if (!memStore.leaderboards[key]) memStore.leaderboards[key] = [];
  const board = memStore.leaderboards[key];
  const filtered = board.filter((e) => e.sessionId !== entry.sessionId);
  filtered.push({ ...entry, rank: 0 });
  memStore.leaderboards[key] = filtered;
}

export async function checkRateLimit(
  identifier: string,
  limit = 30,
  windowMs = 60000
): Promise<{ allowed: boolean; remaining: number }> {
  const now = Date.now();
  const key = `rate:${identifier}`;
  const existing = memStore.rateLimits[key];
  if (!existing || existing.resetAt < now) {
    memStore.rateLimits[key] = { count: 1, resetAt: now + windowMs };
    return { allowed: true, remaining: limit - 1 };
  }
  if (existing.count >= limit) return { allowed: false, remaining: 0 };
  existing.count++;
  return { allowed: true, remaining: limit - existing.count };
}

export async function getUserRank(
  dayId: string,
  mode: GameMode,
  entry: Partial<LeaderboardEntry>
): Promise<number> {
  const board = await getLeaderboard(dayId, mode, 1000);
  if (mode === "bridge") {
    const myScore = (entry.chainLength ?? 999) * 100 - (entry.totalPoints ?? 0);
    const myWon = entry.won ?? false;
    // Count how many are better: won when I didn't, or same won status with lower bridgeScore
    return board.filter(e => {
      if (e.won && !myWon) return true;
      if (!e.won && myWon) return false;
      return bridgeScore(e) < myScore;
    }).length + 1;
  }
  return board.filter(e => (e.totalPoints ?? 0) > (entry.totalPoints ?? 0)).length + 1;
}

export async function getPercentile(
  dayId: string,
  mode: GameMode,
  entry: Partial<LeaderboardEntry>
): Promise<number> {
  const board = await getLeaderboard(dayId, mode, 1000);
  if (!board.length) return 100;
  // What % did worse than me?
  if (mode === "bridge") {
    const myScore = (entry.chainLength ?? 999) * 100 - (entry.totalPoints ?? 0);
    const myWon = entry.won ?? false;
    const worse = board.filter(e => {
      if (myWon && !e.won) return true;
      if (!myWon && e.won) return false;
      return bridgeScore(e) > myScore;
    }).length;
    return Math.round((worse / board.length) * 100);
  }
  return Math.round(
    (board.filter(e => (e.totalPoints ?? 0) < (entry.totalPoints ?? 0)).length / board.length) * 100
  );
}
