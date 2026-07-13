import { NextResponse } from "next/server";
import { getDayId, getPuzzleNumber, getSeedWordForDate } from "@/data/associations";
import { generateBridgePuzzle } from "@/lib/bridgeGen";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const now       = new Date();
    const dayId     = getDayId(now);
    const puzzleNum = getPuzzleNumber(now);
    const seedWord  = getSeedWordForDate(now);

    // Generate today's bridge puzzle (guaranteed 5-step solvable)
    const bridge = await generateBridgePuzzle(dayId);

    return NextResponse.json({
      dayId,
      puzzleNumber: puzzleNum,
      date: now.toUTCString(),
      seedWord,
      startWord:   bridge?.startWord   ?? "ocean",
      targetWord:  bridge?.targetWord  ?? "mountain",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("today route error:", e);
    return NextResponse.json({ error: "Failed to get today's puzzle" }, { status: 500 });
  }
}
