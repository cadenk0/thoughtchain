"use client";

import { useState } from "react";
import { GameMode, ChainNode } from "@/types";
import { BridgeWinAnimation } from "@/components/BridgeWinAnimation";

interface GameOverPanelProps {
  gameMode: GameMode;
  chainLength: number;
  totalPoints: number;
  isWon: boolean;
  startWord: string;
  targetWord?: string;
  currentWord: string;
  lastWrongGuess?: string | null;
  topAssociations?: string[] | null;
  solutionPath?: string[] | null;
  playerChain: ChainNode[];
  onSubmit: (username: string) => void;
  onPlayAgain: () => void;
  isSubmitting: boolean;
  isSubmitted: boolean;
  isArchiveMode: boolean;
  rank?: number | null;
  percentile?: number | null;
  savedUsername?: string;
}

export function GameOverPanel({
  gameMode, chainLength, totalPoints, isWon,
  startWord, targetWord, currentWord,
  lastWrongGuess, topAssociations, solutionPath, playerChain,
  onSubmit, onPlayAgain, isSubmitting, isSubmitted, isArchiveMode,
  rank, percentile, savedUsername = "",
}: GameOverPanelProps) {
  const [username, setUsername] = useState(savedUsername);
  const [showAssociations, setShowAssociations] = useState(false);
  const [fetchedAssociations, setFetchedAssociations] = useState<string[] | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const associationsToShow = topAssociations?.length ? topAssociations : fetchedAssociations;

  const handleToggleReveal = async () => {
    const next = !showAssociations;
    setShowAssociations(next);
    if (next && !associationsToShow && !isFetching) {
      setIsFetching(true);
      try {
        const res = await fetch(`/api/associations?word=${encodeURIComponent(currentWord)}`);
        if (res.ok) setFetchedAssociations((await res.json()).associations || []);
      } catch { } finally { setIsFetching(false); }
    }
  };

  let emoji = "💭", title = "Game Over";
  if (gameMode === "bridge") {
    if (isWon) { emoji = "🎉"; title = `Bridged in ${chainLength} step${chainLength !== 1 ? "s" : ""}!`; }
    else { emoji = "🔗"; title = chainLength === 0 ? "No moves made" : "Bridge Incomplete"; }
  } else {
    if (chainLength === 0) { emoji = "💭"; title = "No chain started"; }
    else if (chainLength < 3) { emoji = "🌱"; title = "Short chain"; }
    else if (chainLength < 7) { emoji = "⛓️"; title = "Solid chain!"; }
    else { emoji = "🧠"; title = "Incredible chain!"; }
  }

  return (
    <div className="game-over-panel">
      {/* Network animation for bridge wins */}
      {gameMode === "bridge" && isWon && (
        <BridgeWinAnimation
          startWord={startWord}
          targetWord={targetWord || ""}
          chain={playerChain}
          solutionPath={solutionPath || null}
        />
      )}

      <div className="game-over-header">
        <div className="game-over-icon">{emoji}</div>
        <h2 className="game-over-title">{title}</h2>
        <div className="game-over-scores">
          <div className="game-over-score-item">
            <span className="score-number">{chainLength}</span>
            <span className="score-label">{gameMode === "bridge" ? "steps" : "links"}</span>
          </div>
          {totalPoints > 0 && (
            <>
              <div className="score-divider">·</div>
              <div className="game-over-score-item">
                <span className="score-number score-number-pts">{totalPoints}</span>
                <span className="score-label">pts</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Answer key / solution path */}
      {gameMode === "bridge" && solutionPath && solutionPath.length > 0 && (
        <div className="solution-key">
          <p className="solution-key-label">One possible path ({solutionPath.length - 2} intermediate step{solutionPath.length - 2 !== 1 ? "s" : ""}):</p>
          <div className="solution-key-path">
            {solutionPath.map((word, i) => (
              <span key={i} className="solution-key-item">
                {i > 0 && <span className="solution-key-arrow">→</span>}
                <span className={`solution-key-word ${word === startWord || word === targetWord ? "solution-key-word-endpoint" : ""}`}>
                  {word.toUpperCase()}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Endless: wrong guess reveal */}
      {gameMode === "endless" && lastWrongGuess && (
        <div className="wrong-guess-info">
          <p className="wrong-guess-text">
            <span className="wrong-word">"{lastWrongGuess.toUpperCase()}"</span> isn't in top 25 for{" "}
            <span className="wrong-from">"{currentWord.toUpperCase()}"</span>
          </p>
          <button className="reveal-btn" onClick={handleToggleReveal}>
            {showAssociations ? "Hide" : "Show"} top associations
          </button>
          {showAssociations && (
            <div className="associations-reveal">
              {isFetching ? <p className="associations-label">Loading…</p>
                : associationsToShow?.length ? (
                  <>
                    <p className="associations-label">Top 25 for "{currentWord.toUpperCase()}":</p>
                    <div className="associations-list">
                      {associationsToShow.map((word, i) => (
                        <span key={word} className={`association-chip ${word === lastWrongGuess?.toLowerCase() ? "association-chip-miss" : ""}`}>
                          <span className="assoc-rank">{i + 1}</span>{word}
                        </span>
                      ))}
                    </div>
                  </>
                ) : <p className="associations-label">No data available.</p>}
            </div>
          )}
        </div>
      )}

      {/* Bridge: incomplete hint */}
      {gameMode === "bridge" && !isWon && chainLength > 0 && (
        <div className="wrong-guess-info">
          <p className="wrong-guess-text">You made it to <span className="wrong-from">"{currentWord.toUpperCase()}"</span> but didn't reach <span className="wrong-word">"{targetWord?.toUpperCase()}"</span>.</p>
        </div>
      )}

      {/* Submit / rank */}
      {isArchiveMode ? (
        <div className="archive-mode-note">
          <p>Archive plays don't count toward the leaderboard.</p>
          <button onClick={onPlayAgain} className="play-again-btn">Try again ↺</button>
        </div>
      ) : isSubmitted ? (
        <div className="submitted-info">
          {rank != null && <div className="rank-display"><span className="rank-num">#{rank}</span><span className="rank-label-text">today's {gameMode} leaderboard</span></div>}
          {percentile != null && <p className="percentile-text">Better than <strong>{percentile}%</strong> of players</p>}
          <button onClick={onPlayAgain} className="play-again-btn play-again-btn-secondary">Play again ↺</button>
        </div>
      ) : (
        <div className="submit-form">
          <p className="submit-prompt">Save your score</p>
          <div className="submit-row">
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value.slice(0, 20))} placeholder="Your name (optional)" className="username-input" maxLength={20} />
            <button onClick={() => onSubmit(username || "Anonymous")} disabled={isSubmitting} className="submit-score-btn">
              {isSubmitting ? "Saving…" : "Save"}
            </button>
          </div>
          <button onClick={onPlayAgain} className="play-again-link">Skip &amp; play again ↺</button>
        </div>
      )}
    </div>
  );
}
