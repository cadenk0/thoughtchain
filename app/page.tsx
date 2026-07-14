"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LeaderboardEntry, GameMode } from "@/types";

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}
function medal(rank: number) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
}

export default function LeaderboardPage() {
  const [entries, setEntries]       = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading]       = useState(true);
  const [dayId, setDayId]           = useState("");
  const [mode, setMode]             = useState<GameMode>("bridge");
  const [expanded, setExpanded]     = useState<string | null>(null);
  const [todayPuzzle, setTodayPuzzle] = useState<any>(null);

  const fetchBoard = async (did?: string, m?: GameMode) => {
    try {
      const id = did || dayId;
      const mo = m  || mode;
      const res = await fetch(`/api/leaderboard?dayId=${id}&mode=${mo}&limit=50`);
      setEntries((await res.json()).entries || []);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    const init = async () => {
      const res  = await fetch("/api/today");
      const data = await res.json();
      setDayId(data.dayId);
      setTodayPuzzle(data);
      await fetchBoard(data.dayId, mode);
    };
    init().catch(console.error);
  }, []); // eslint-disable-line

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!dayId) return;
    const interval = setInterval(() => fetchBoard(dayId, mode), 30_000);
    return () => clearInterval(interval);
  }, [dayId, mode]); // eslint-disable-line

  const handleMode = (m: GameMode) => {
    setMode(m);
    setExpanded(null);
    setLoading(true);
    fetchBoard(dayId, m);
  };

  return (
    <main className="leaderboard-page">
      <div className="page-header">
        <h1 className="page-title">Rankings</h1>
        {todayPuzzle && mode === "bridge" && (
          <p className="page-subtitle">
            Today: {todayPuzzle.startWord?.toUpperCase()} → {todayPuzzle.targetWord?.toUpperCase()}
          </p>
        )}
        {todayPuzzle && mode === "endless" && (
          <p className="page-subtitle">Today's start: {todayPuzzle.startWord?.toUpperCase()}</p>
        )}
      </div>

      {/* Mode tabs */}
      <div className="lb-mode-tabs">
        <button className={`lb-tab ${mode === "bridge"  ? "lb-tab-active" : ""}`} onClick={() => handleMode("bridge")}>🌉 Bridge</button>
        <button className={`lb-tab ${mode === "endless" ? "lb-tab-active" : ""}`} onClick={() => handleMode("endless")}>∞ Endless</button>
      </div>

      <div className="lb-scoring-note">
        {mode === "bridge"
          ? "Ranked by fewest steps · tie-broken by quality points"
          : "Ranked by total points · tie-broken by chain length"}
      </div>

      {loading ? (
        <div className="lb-loading">
          <div className="loading-brain">🏆</div>
          <p>Loading…</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="lb-empty">
          <p className="lb-empty-text">No scores yet today.</p>
          <Link href="/" className="play-now-btn">Be the first to play →</Link>
        </div>
      ) : mode === "bridge" ? (
        <div className="lb-table">
          <div className="lb-header-bridge">
            <span>Rank</span><span>Player</span><span>Steps</span><span>Pts</span><span>Time</span>
          </div>
          {entries.map((e, i) => (
            <div key={e.sessionId} className="lb-row-wrapper">
              <button
                className={`lb-row lb-row-bridge ${i < 3 ? "lb-row-top3" : ""} ${expanded === e.sessionId ? "lb-row-expanded" : ""}`}
                onClick={() => setExpanded(expanded === e.sessionId ? null : e.sessionId)}
              >
                <span className="lb-rank-display">{medal(e.rank)}</span>
                <span className="lb-username">{e.won ? "✅ " : "❌ "}{e.username}</span>
                <span className="lb-highlight">{e.chainLength}</span>
                <span className="lb-secondary">{e.totalPoints ?? 0}</span>
                <span className="lb-time-display">{formatTime(e.duration)}</span>
              </button>
              {expanded === e.sessionId && (
                <div className="lb-chain-reveal">
                  <div className="lb-chain-words">
                    {e.chain.map((word, idx) => (
                      <span key={idx} className="lb-chain-item">
                        {idx > 0 && <span className="lb-chain-sep">→</span>}
                        <span className="lb-chain-word">{word.toUpperCase()}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="lb-table">
          <div className="lb-header-5col">
            <span>Rank</span><span>Player</span><span>Points</span><span>Links</span><span>Time</span>
          </div>
          {entries.map((e, i) => (
            <div key={e.sessionId} className="lb-row-wrapper">
              <button
                className={`lb-row lb-row-5col ${i < 3 ? "lb-row-top3" : ""} ${expanded === e.sessionId ? "lb-row-expanded" : ""}`}
                onClick={() => setExpanded(expanded === e.sessionId ? null : e.sessionId)}
              >
                <span className="lb-rank-display">{medal(e.rank)}</span>
                <span className="lb-username">{e.username}</span>
                <span className="lb-highlight">{e.totalPoints ?? 0}</span>
                <span className="lb-secondary">{e.chainLength}</span>
                <span className="lb-time-display">{formatTime(e.duration)}</span>
              </button>
              {expanded === e.sessionId && (
                <div className="lb-chain-reveal">
                  <div className="lb-chain-words">
                    {e.chain.map((word, idx) => (
                      <span key={idx} className="lb-chain-item">
                        {idx > 0 && <span className="lb-chain-sep">→</span>}
                        <span className="lb-chain-word">{word.toUpperCase()}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="lb-footer">
        <p className="lb-refresh-note">Updates every 30 seconds · Resets daily at midnight UTC</p>
        <Link href="/" className="back-link">← Back to game</Link>
      </div>
    </main>
  );
}
