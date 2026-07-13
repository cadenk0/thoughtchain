import { NextRequest, NextResponse } from "next/server";
import { validateGuess, getTopAssociations } from "@/lib/similarity";
import { checkRateLimit } from "@/lib/store";
import { ChainNode, GameMode } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
    const { allowed, remaining } = await checkRateLimit(ip, 60, 60000);
    if (!allowed) return NextResponse.json({ error: "Too many requests. Slow down!" }, { status: 429 });

    const body = await request.json();
    const { word, guess, sessionId, chain = [], seedWord, gameMode = "endless", targetWord } = body;

    if (!word || !guess || !sessionId) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    if (!/^[a-zA-Z\s-]{1,30}$/.test(guess)) return NextResponse.json({ error: "Letters only, max 30 characters." }, { status: 400 });

    const normalizedGuess = guess.toLowerCase().trim();
    const currentChain: ChainNode[] = chain || [];
    const totalPoints = currentChain.reduce((sum, n) => sum + (n.points || 0), 0);

    // Duplicate check
    const usedWords = new Set([
      (seedWord || word).toLowerCase(),
      word.toLowerCase(),
      ...currentChain.map((n: ChainNode) => n.word.toLowerCase()),
    ]);
    if (usedWords.has(normalizedGuess)) {
      return NextResponse.json({
        valid: false, duplicate: true, word: normalizedGuess,
        reason: `"${normalizedGuess.toUpperCase()}" is already in your chain!`,
        chain: currentChain, chainLength: currentChain.length, totalPoints, isComplete: false, isWon: false,
      });
    }

    const result = await validateGuess(word, guess);

    if (result.noData) {
      return NextResponse.json({
        valid: false, duplicate: false, noData: true, word: normalizedGuess,
        reason: `No association data found for "${word}". Try a different word.`,
        chain: currentChain, chainLength: currentChain.length, totalPoints, isComplete: false, isWon: false,
      });
    }

    if (result.valid) {
      const newNode: ChainNode = {
        word: normalizedGuess,
        rank: result.rank, rankLabel: result.rankLabel, rankTier: result.rankTier,
        points: result.points, timestamp: Date.now(),
      };
      const newChain = [...currentChain, newNode];
      const newTotalPoints = totalPoints + result.points;

      // Bridge win condition: guessed the target word
      const isWin = gameMode === "bridge" && normalizedGuess === (targetWord || "").toLowerCase().trim();

      return NextResponse.json({
        valid: true, duplicate: false, word: normalizedGuess,
        rank: result.rank, rankLabel: result.rankLabel, rankTier: result.rankTier,
        points: result.points, chain: newChain, chainLength: newChain.length,
        totalPoints: newTotalPoints, isComplete: isWin, isWon: isWin,
      });
    } else {
      // Invalid guess — game over for endless; not for bridge (just doesn't advance)
      const topAssociations = result.topAssociations.length > 0
        ? result.topAssociations
        : await getTopAssociations(word);

      return NextResponse.json({
        valid: false, duplicate: false, word: normalizedGuess,
        reason: `"${normalizedGuess}" is not in the top 25 associations for "${word}"`,
        topAssociations, chain: currentChain, chainLength: currentChain.length, totalPoints,
        isComplete: gameMode === "endless", // bridge: invalid guess doesn't end game
        isWon: false,
      });
    }
  } catch (error) {
    console.error("Guess API error:", error);
    return NextResponse.json({ error: "Failed to process guess" }, { status: 500 });
  }
}
