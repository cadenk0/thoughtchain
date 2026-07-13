"use client";

import { useEffect, useRef } from "react";
import { ChainNode } from "@/types";

interface ChainDisplayProps {
  seedWord: string;
  targetWord?: string;
  chain: ChainNode[];
  currentWord: string;
  isComplete: boolean;
  isWon?: boolean;
  lastWrongGuess?: string | null;
}

export function ChainDisplay({ seedWord, targetWord, chain, currentWord, isComplete, isWon, lastWrongGuess }: ChainDisplayProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [chain.length, isComplete]);

  const hasChain = chain.length > 0;

  // Bridge empty state: show start → ? → target big and centered
  if (!hasChain && !isComplete && targetWord) {
    return (
      <div className="bridge-start-view">
        <div className="bridge-start-node bridge-start-node-start">
          <div className="bsn-label">START</div>
          <div className="bsn-word">{seedWord.toUpperCase()}</div>
        </div>
        <div className="bridge-start-dots">
          <span /><span /><span />
        </div>
        <div className="bridge-start-node bridge-start-node-target">
          <div className="bsn-label">GOAL</div>
          <div className="bsn-word">{targetWord.toUpperCase()}</div>
        </div>
      </div>
    );
  }

  // Endless empty state
  if (!hasChain && !isComplete) {
    return (
      <div className="endless-start-view">
        <div className="endless-start-word">{seedWord.toUpperCase()}</div>
        <div className="endless-start-hint">Type the first word that comes to mind</div>
      </div>
    );
  }

  // Chain in progress or complete
  const allWords = [{ word: seedWord, rank: undefined, rankLabel: undefined, rankTier: undefined as any, points: undefined }, ...chain];

  return (
    <div className="chain-container">
      {allWords.map((node, index) => {
        const isFirst = index === 0;
        const isLast = index === allWords.length - 1;
        const isNew = isLast && index > 0;
        const isTarget = targetWord && node.word.toLowerCase() === targetWord.toLowerCase();

        return (
          <div key={`${node.word}-${index}`} className="chain-node-wrapper">
            <div className={["chain-node", isFirst ? "chain-node-seed" : "chain-node-guess", isNew ? "chain-node-new" : "", isLast && !isComplete ? "chain-node-active" : "", isTarget && isWon ? "chain-node-win" : ""].filter(Boolean).join(" ")}>
              <div className="chain-node-inner">
                {isFirst && <span className="chain-label">START</span>}
                {isTarget && isWon && <span className="chain-label chain-label-win">GOAL ✓</span>}
                <span className="chain-word">{node.word.toUpperCase()}</span>
              </div>
              {!isFirst && node.rankLabel && (
                <div className="chain-node-meta">
                  <span className={`rank-pill rank-pill-${node.rankTier || "bronze"}`}>
                    {node.rankTier === "gold" && "★ "}{node.rankLabel} closest
                  </span>
                  {node.points != null && <span className="points-pill">+{node.points}pts</span>}
                </div>
              )}
            </div>
            {!isLast && (
              <div className="chain-arrow">
                <svg width="12" height="18" viewBox="0 0 12 18" fill="none">
                  <path d="M6 0 L6 12 M2 8 L6 12 L10 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </div>
        );
      })}

      {/* Endless: wrong guess */}
      {isComplete && !isWon && lastWrongGuess && (
        <div className="chain-node-wrapper">
          <div className="chain-arrow chain-arrow-wrong">
            <svg width="12" height="18" viewBox="0 0 12 18" fill="none">
              <path d="M6 0 L6 12 M2 8 L6 12 L10 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="chain-node chain-node-wrong">
            <div className="chain-node-inner">
              <span className="chain-label chain-label-wrong">✗ WRONG</span>
              <span className="chain-word chain-word-wrong">{lastWrongGuess.toUpperCase()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Bridge: target placeholder — only show when chain is in progress but not won */}
      {targetWord && hasChain && !isWon && (
        <div className="chain-node-wrapper">
          <div className="chain-arrow chain-arrow-target">
            <svg width="12" height="18" viewBox="0 0 12 18" fill="none">
              <path d="M6 0 L6 12 M2 8 L6 12 L10 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 3" />
            </svg>
          </div>
          <div className="chain-node chain-node-target">
            <div className="chain-node-inner">
              <span className="chain-label chain-label-target">GOAL</span>
              <span className="chain-word chain-word-target">{targetWord.toUpperCase()}</span>
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
