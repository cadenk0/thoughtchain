import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/store";
import { getDayId } from "@/data/associations";
import { GameMode } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dayId = searchParams.get("dayId") || getDayId();
    const mode = (searchParams.get("mode") || "bridge") as GameMode;
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const entries = await getLeaderboard(dayId, mode, limit);
    return NextResponse.json({ dayId, mode, entries, total: entries.length, updatedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
