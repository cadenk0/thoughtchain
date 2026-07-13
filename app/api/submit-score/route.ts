import { NextRequest, NextResponse } from "next/server";
import { submitToLeaderboard, checkRateLimit, getUserRank, getPercentile } from "@/lib/store";
import { getTodaysPuzzle } from "@/data/associations";
import { SubmitScorePayload, GameMode } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
    const { allowed } = await checkRateLimit(`submit:${ip}`, 5, 300000);
    if (!allowed) return NextResponse.json({ error: "Too many submissions" }, { status: 429 });

    const body: SubmitScorePayload & { gameMode: GameMode } = await request.json();
    const { sessionId, dayId, chain, username, duration, gameMode = "endless", won = false } = body;

    if (!sessionId || !chain) return NextResponse.json({ error: "Invalid submission" }, { status: 400 });

    const today = getTodaysPuzzle();
    const targetDayId = dayId || today.dayId;
    const sanitizedUsername = (username || "Anonymous")
      .replace(/[^a-zA-Z0-9_\-\s]/g, "").slice(0, 20).trim() || "Anonymous";

    const chainLength = chain.length;
    const totalPoints = chain.reduce((sum, n) => sum + (n.points || 0), 0);
    const bridgeScore = chainLength * 100 - totalPoints;

    const entry = {
      sessionId, dayId: targetDayId, gameMode,
      username: sanitizedUsername,
      chainLength, totalPoints, bridgeScore,
      won,
      score: totalPoints,
      duration: Math.max(1, Math.round(duration)),
      chain: chain.map((n) => n.word),
      submittedAt: new Date().toISOString(),
    };

    await submitToLeaderboard(entry as any);

    const entryForRank = { chainLength, totalPoints, won };
    const [rank, percentile] = await Promise.all([
      getUserRank(targetDayId, gameMode, entryForRank),
      getPercentile(targetDayId, gameMode, entryForRank),
    ]);

    return NextResponse.json({ success: true, chainLength, totalPoints, bridgeScore, rank, percentile, won });
  } catch (error) {
    console.error("Submit score error:", error);
    return NextResponse.json({ error: "Failed to submit score" }, { status: 500 });
  }
}
