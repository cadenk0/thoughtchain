import { getAssociations, checkGuess as datamuseCheck } from "@/lib/datamuse";

export const TOP_K = 25;

export function rankToPoints(rank: number): number {
  if (rank <= 0 || rank > TOP_K) return 0;
  return TOP_K + 1 - rank; // rank 1 = 30pts, rank 30 = 1pt
}

export function getRankLabel(rank: number): string {
  if (rank <= 0) return "—";
  const mod100 = rank % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${rank}th`;
  switch (rank % 10) {
    case 1: return `${rank}st`;
    case 2: return `${rank}nd`;
    case 3: return `${rank}rd`;
    default: return `${rank}th`;
  }
}

// Gold: 1-5, Silver: 6-15, Bronze: 16-30
export function getRankTier(rank: number): "gold" | "silver" | "bronze" | "none" {
  if (rank <= 0) return "none";
  if (rank <= 5) return "gold";
  if (rank <= 15) return "silver";
  return "bronze";
}

export interface GuessValidationResult {
  valid: boolean;
  rank: number;
  rankLabel: string;
  rankTier: "gold" | "silver" | "bronze" | "none";
  points: number;
  topAssociations: string[];
  noData: boolean;
}

export async function validateGuess(
  currentWord: string,
  guess: string
): Promise<GuessValidationResult> {
  const result = await datamuseCheck(currentWord, guess);
  const noData = result.associations.length === 0;

  return {
    valid: result.valid,
    rank: result.valid ? result.rank : -1,
    rankLabel: getRankLabel(result.valid ? result.rank : -1),
    rankTier: getRankTier(result.valid ? result.rank : -1),
    points: rankToPoints(result.valid ? result.rank : -1),
    topAssociations: result.associations,
    noData,
  };
}

export async function getTopAssociations(word: string): Promise<string[]> {
  return getAssociations(word);
}
