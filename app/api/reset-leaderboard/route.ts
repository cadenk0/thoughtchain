import { NextRequest, NextResponse } from "next/server";
import { resetLeaderboard } from "@/lib/store";
import { getDayId } from "@/data/associations";
import { GameMode } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const dayId = body.dayId || getDayId();
    const mode = (body.mode || "bridge") as GameMode;
    await resetLeaderboard(dayId, mode);
    return NextResponse.json({ success: true, dayId, mode });
  } catch {
    return NextResponse.json({ error: "Failed to reset" }, { status: 500 });
  }
}
