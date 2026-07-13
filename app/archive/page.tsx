"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGameStore } from "@/store/gameStore";

interface ArchivePuzzle {
  dayId: string;
  puzzleNumber: number;
  seedWord: string;
  startWord: string;
  targetWord: string;
  date: string;
}

export default function ArchivePage() {
  const [puzzles, setPuzzles] = useState<ArchivePuzzle[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { gameMode, startArchiveBridge, startArchiveEndless } = useGameStore();

  useEffect(() => {
    fetch("/api/archive")
      .then((r) => r.json())
      .then((d) => setPuzzles(d.puzzles || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handlePlay = (puzzle: ArchivePuzzle) => {
    if (gameMode === "bridge") {
      startArchiveBridge(puzzle.dayId, puzzle.startWord, puzzle.targetWord, puzzle.puzzleNumber);
    } else {
      startArchiveEndless(puzzle.dayId, puzzle.startWord, puzzle.puzzleNumber);
    }
    router.push("/");
  };

  return (
    <main className="archive-page">
      <div className="page-header">
        <h1 className="page-title">Archive</h1>
        <p className="page-subtitle">
          Past puzzles · {gameMode === "bridge" ? "Bridge" : "Endless"} mode · Scores don't count
        </p>
      </div>

      {loading ? (
        <div className="lb-loading">
          <div className="loading-brain">📚</div>
          <p>Loading…</p>
        </div>
      ) : puzzles.length === 0 ? (
        <div className="lb-empty">
          <p className="lb-empty-text" style={{ fontSize: "32px" }}>📅</p>
          <p className="lb-empty-text">No past puzzles yet.</p>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", textAlign: "center" }}>
            Come back tomorrow — completed puzzles will appear here day by day.
          </p>
          <Link href="/" className="play-now-btn">Play today's puzzle →</Link>
        </div>
      ) : (
        <div className="archive-grid">
          {puzzles.map((puzzle) => (
            <button
              key={puzzle.dayId}
              className="archive-card archive-card-btn"
              onClick={() => handlePlay(puzzle)}
            >
              <div className="archive-meta">
                <span className="archive-num">#{puzzle.puzzleNumber}</span>
                <span className="archive-date">
                  {new Date(puzzle.date + "T00:00:00Z").toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    timeZone: "UTC",
                  })}
                </span>
              </div>
              {gameMode === "bridge" ? (
                <div className="archive-bridge-pair">
                  <span className="archive-word">{puzzle.startWord?.toUpperCase()}</span>
                  <span className="archive-bridge-arrow">→</span>
                  <span className="archive-word archive-word-target">{puzzle.targetWord?.toUpperCase()}</span>
                </div>
              ) : (
                <div className="archive-word">{puzzle.startWord?.toUpperCase()}</div>
              )}
              <div className="archive-play-label">Tap to play →</div>
            </button>
          ))}
        </div>
      )}

      <div className="lb-footer">
        <Link href="/" className="back-link">← Back to today's game</Link>
      </div>
    </main>
  );
}
