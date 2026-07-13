import { NextRequest, NextResponse } from "next/server";
import { getCacheStats, getAssociations } from "@/lib/datamuse";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  const stats = getCacheStats();
  const cachePath = path.join(process.cwd(), "data", "association-cache.json");
  let words: string[] = [];
  try { words = Object.keys(JSON.parse(fs.readFileSync(cachePath, "utf-8"))).sort(); } catch {}
  return NextResponse.json({ cachedWords: words.length, memoryCache: stats.memory, diskCache: stats.disk, words });
}

export async function POST(request: NextRequest) {
  const { words } = await request.json();
  if (!Array.isArray(words)) return NextResponse.json({ error: "Provide { words: string[] }" }, { status: 400 });
  const results: Record<string, number> = {};
  for (const word of words.slice(0, 20)) {
    const assocs = await getAssociations(word);
    results[word] = assocs.length;
  }
  return NextResponse.json({ warmed: results });
}
