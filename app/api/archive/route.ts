import { NextRequest, NextResponse } from "next/server";
import { getDayId, getPuzzleNumber, getSeedWordForDate } from "@/data/associations";
import { generateBridgePuzzle } from "@/lib/bridgeGen";

export const dynamic = "force-dynamic";

// The game launched on this date — archive only goes back to here
const LAUNCH_DATE = new Date("2026-07-13T00:00:00.000Z");

export async function GET(request: NextRequest) {
  try {
    const today = new Date();
    const todayId = getDayId(today);

    const puzzles = [];

    // Start from yesterday and go back, stopping at launch date
    let d = new Date(today);
    d.setUTCDate(today.getUTCDate() - 1);

    while (d >= LAUNCH_DATE) {
      const dayId = getDayId(d);

      // Don't include today in the archive
      if (dayId === todayId) { d.setUTCDate(d.getUTCDate() - 1); continue; }

      const bridge = await generateBridgePuzzle(dayId);

      puzzles.push({
        dayId,
        puzzleNumber: getPuzzleNumber(d),
        seedWord:   getSeedWordForDate(d),
        startWord:  bridge?.startWord  ?? "ocean",
        targetWord: bridge?.targetWord ?? "mountain",
        date:       d.toISOString().split("T")[0],
      });

      d.setUTCDate(d.getUTCDate() - 1);
    }

    return NextResponse.json({
      puzzles,
      total: puzzles.length,
      launchDate: LAUNCH_DATE.toISOString().split("T")[0],
    });
  } catch (e) {
    console.error("archive error:", e);
    return NextResponse.json({ error: "Failed to fetch archive" }, { status: 500 });
  }
}
