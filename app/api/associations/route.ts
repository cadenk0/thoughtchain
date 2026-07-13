import { NextRequest, NextResponse } from "next/server";
import { getTopAssociations } from "@/lib/similarity";
import { getCacheStats } from "@/lib/datamuse";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const word = searchParams.get("word");
    if (!word) return NextResponse.json({ error: "Missing word parameter" }, { status: 400 });

    const associations = await getTopAssociations(word);
    const stats = getCacheStats();

    return NextResponse.json({ word: word.toLowerCase().trim(), associations, cached: associations.length > 0, cacheStats: stats });
  } catch {
    return NextResponse.json({ error: "Failed to fetch associations" }, { status: 500 });
  }
}
