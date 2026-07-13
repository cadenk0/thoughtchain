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
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dayId, setDayId] = useState("");
  const [mode, setMode] = useState<GameMode>("bridge");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [todayPuzzle, setTodayPuzzle] = useState<any>(null);

  const fetchBoard = async (did?: string, m?: GameMode) => {
    setLoading(true);
    try {
      const id = did || dayId;
      const mo = m || mode;
      const res = await fetch(`/api/leaderboard?dayId=${id}&mode=${mo}&limit=50`);
      setEntries((await res.json()).entries || []);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const init = async () => {
      const res = await fetch("/api/today");
      const data = await res.json();
      setDayId(data.dayId);
      setTodayPuzzle(data);
      await fetchBoard(data.dayId, mode);
    };
    init().catch(console.error);
  }, []); // eslint-disable-line

  const handleMode = (m: GameMode) => {
    setMode(m);
    setExpanded(null);
    fetchBoard(dayId, m);
  };

  const handleReset = async () => {
    if (!resetConfirm) { setResetConfirm(true); return; }
    setResetting(true); setResetConfirm(false);
    await fetch("/api/reset-leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dayId, mode }),
    });
    await fetchBoard(dayId, mode);
    setResetting(false);
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
          <p className="page-subtitle">Today's seed: {todayPuzzle.seedWord?.toUpperCase()}</p>
        )}
      </div>

      {/* Mode tabs */}
      <div className="lb-mode-tabs">
        <button className={`lb-tab ${mode === "bridge" ? "lb-tab-active" : ""}`} onClick={() => handleMode("bridge")}>
          🌉 Bridge
        </button>
        <button className={`lb-tab ${mode === "endless" ? "lb-tab-active" : ""}`} onClick={() => handleMode("endless")}>
          ∞ Endless
        </button>
      </div>

      {/* Scoring explainer */}
      <div className="lb-scoring-note">
        {mode === "bridge"
          ? "Bridge: ranked by fewest steps to reach the target (tie-broken by quality points)"
          : "Endless: ranked by total points (rank 1 = 30pts, rank 30 = 1pt per word)"}
      </div>

      <div className="lb-toolbar">
        <button onClick={() => fetchBoard(dayId, mode)} className="lb-refresh-btn" disabled={loading}>↻ Refresh</button>
        <button onClick={handleReset} disabled={resetting} className={`lb-reset-btn ${resetConfirm ? "lb-reset-btn-confirm" : ""}`}>
          {resetting ? "Clearing…" : resetConfirm ? "Tap again to confirm" : "Reset"}
        </button>
        {resetConfirm && <button onClick={() => setResetConfirm(false)} className="lb-cancel-btn">Cancel</button>}
      </div>

      {loading ? (
        <div className="lb-loading"><div className="loading-brain">🏆</div><p>Loading…</p></div>
      ) : entries.length === 0 ? (
        <div className="lb-empty">
          <p className="lb-empty-text">No scores yet today.</p>
          <Link href="/" className="play-now-btn">Be the first to play →</Link>
        </div>
      ) : (
        <div className="lb-table">
          {mode === "bridge" ? (
            <>
              <div className="lb-header-row lb-header-bridge">
                <span>Rank</span><span>Player</span><span>Steps</span><span>Pts</span><span>Time</span>
              </div>
              {entries.map((e, i) => (
                <div key={e.sessionId} className="lb-row-wrapper">
                  <button
                    className={`lb-row lb-row-bridge ${i < 3 ? "lb-row-top3" : ""} ${expanded === e.sessionId ? "lb-row-expanded" : ""}`}
                    onClick={() => setExpanded(expanded === e.sessionId ? null : e.sessionId)}
                  >
                    <span className="lb-rank-display">{medal(e.rank)}</span>
                    <span className="lb-username">
                      {e.won ? "✅ " : "❌ "}{e.username}
                    </span>
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
            </>
          ) : (
            <>
              <div className="lb-header-row lb-header-5col">
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
            </>
          )}
        </div>
      )}

      <div className="lb-footer">
        <p className="lb-refresh-note">Resets daily at midnight UTC</p>
        <Link href="/" className="back-link">← Back to game</Link>
      </div>
    </main>
  );
}
