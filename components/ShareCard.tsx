"use client";

import { useState } from "react";
import { ChainNode, GameMode } from "@/types";

interface ShareCardProps {
  chain: ChainNode[];
  seedWord: string;
  targetWord?: string;
  chainLength: number;
  totalPoints: number;
  puzzleNumber: number;
  gameMode: GameMode;
  isWon?: boolean;
  rank?: number | null;
  percentile?: number | null;
}

export function ShareCard({ chain, seedWord, targetWord, chainLength, totalPoints, puzzleNumber, gameMode, isWon, rank, percentile }: ShareCardProps) {
  const [copied, setCopied] = useState(false);
  const allWords = [seedWord, ...chain.map((n) => n.word)];

  let shareText = "";
  if (gameMode === "bridge") {
    const result = isWon ? `✅ Bridged in ${chainLength} step${chainLength !== 1 ? "s" : ""}` : `❌ Incomplete`;
    shareText = [
      `🌉 ThoughtChain Bridge #${puzzleNumber}`,
      `${seedWord.toUpperCase()} → ${targetWord?.toUpperCase()}`,
      "",
      allWords.map((w, i) => i === 0 ? w.toUpperCase() : `↓\n${w.toUpperCase()}`).join("\n"),
      "",
      `${result} · ${totalPoints} quality pts`,
      percentile != null ? `Top ${100 - percentile}% of players` : "",
      rank ? `Rank: #${rank}` : "",
      "",
      "Play at thoughtchain.game",
    ].filter(Boolean).join("\n").replace(/\n{3,}/g, "\n\n").trim();
  } else {
    shareText = [
      `🧠 ThoughtChain Endless #${puzzleNumber}`,
      "",
      allWords.map((w, i) => i === 0 ? w.toUpperCase() : `↓\n${w.toUpperCase()}`).join("\n"),
      "",
      `${chainLength} links · ${totalPoints} pts`,
      percentile != null ? `Top ${100 - percentile}% of players` : "",
      rank ? `Rank: #${rank}` : "",
      "",
      "Play at thoughtchain.game",
    ].filter(Boolean).join("\n").replace(/\n{3,}/g, "\n\n").trim();
  }

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(shareText); }
    catch {
      const ta = document.createElement("textarea");
      ta.value = shareText; document.body.appendChild(ta); ta.select();
      document.execCommand("copy"); document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="share-card">
      <div className="share-preview">
        <div className="share-header">
          <span className="share-emoji">{gameMode === "bridge" ? "🌉" : "🧠"}</span>
          <span className="share-title">ThoughtChain {gameMode === "bridge" ? "Bridge" : "Endless"} #{puzzleNumber}</span>
        </div>
        {gameMode === "bridge" && targetWord && (
          <p className="share-bridge-route">{seedWord.toUpperCase()} → {targetWord.toUpperCase()}</p>
        )}
        <div className="share-chain">
          {allWords.map((word, i) => (
            <div key={i} className="share-chain-item">
              {i > 0 && <div className="share-chain-arrow">↓</div>}
              <div className="share-chain-word">{word.toUpperCase()}</div>
            </div>
          ))}
        </div>
        <div className="share-stats">
          <span className="share-score">
            {gameMode === "bridge"
              ? `${chainLength} steps · ${totalPoints}pts`
              : `${chainLength} links · ${totalPoints}pts`}
          </span>
          {percentile != null && <span className="share-rank">Top {100 - percentile}%</span>}
        </div>
      </div>
      <button onClick={handleCopy} className={`copy-btn ${copied ? "copy-btn-success" : ""}`}>
        {copied ? (
          <><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> Copied!</>
        ) : (
          <><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="5" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1.5" /><path d="M5 5V4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1h-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg> Copy Result</>
        )}
      </button>
    </div>
  );
}
