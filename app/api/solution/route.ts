import { NextRequest, NextResponse } from "next/server";
import { findPath } from "@/lib/datamuse";
import { generateBridgePuzzle } from "@/lib/bridgeGen";
import { getDayId } from "@/data/associations";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const start  = searchParams.get("start");
  const target = searchParams.get("target");
  const dayId  = searchParams.get("dayId") || getDayId();

  if (!start || !target) return NextResponse.json({ error: "Missing start or target" }, { status: 400 });

  // Try to get solution from the puzzle generator first (it already walked the path)
  const puzzle = await generateBridgePuzzle(dayId);
  if (puzzle && puzzle.startWord === start && puzzle.targetWord === target) {
    return NextResponse.json({ path: puzzle.solutionPath, steps: puzzle.solutionPath.length - 2 });
  }

  // Fallback: BFS search
  const path = await findPath(start, target, 4);
  if (path) return NextResponse.json({ path, steps: path.length - 2 });

  return NextResponse.json({ path: null, message: "No path found within 4 steps" });
}
