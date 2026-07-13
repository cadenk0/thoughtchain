"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { ChainDisplay } from "@/components/ChainDisplay";
import { GuessInput } from "@/components/GuessInput";
import { GameOverPanel } from "@/components/GameOverPanel";
import { ShareCard } from "@/components/ShareCard";
import { ChainNode, GameMode } from "@/types";

type FeedbackType = "success" | "error" | "warning" | "info";

export default function GamePage() {
  const router = useRouter();
  const [isLoading, setIsLoading]     = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback]       = useState<{ text: string; type: FeedbackType } | null>(null);
  const [todayData, setTodayData]     = useState<any>(null);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  const {
    sessionId, dayId, currentWord, chain, isComplete, isWon,
    chainLength, totalPoints, lastWrongGuess, topAssociations,
    isSubmitted, leaderboardRank, percentile,
    puzzleNumber, username, isArchiveMode,
    gameMode, seedWord, startWord, targetWord, solutionPath,
    hasSeenIntro,
    initEndless, initBridge, setGameMode,
    playAgain, quitGame, addToChain, endGame, winGame,
    setSubmitted, setUsername, setSolutionPath, getElapsedTime,
  } = useGameStore();

  useEffect(() => {
    if (!hasSeenIntro) router.replace("/intro");
  }, [hasSeenIntro, router]);

  useEffect(() => {
    const fetchToday = async () => {
      try {
        const res  = await fetch("/api/today");
        const data = await res.json();
        setTodayData(data);
        if (gameMode === "bridge") initBridge(data.dayId, data.startWord, data.targetWord, data.puzzleNumber);
        else initEndless(data.dayId, data.startWord, data.puzzleNumber);
      } catch {
        setFeedback({ text: "Failed to load today's puzzle. Please refresh.", type: "error" });
      } finally {
        setInitLoading(false);
      }
    };
    fetchToday();
  }, []); // eslint-disable-line

  const handleModeChange = useCallback((mode: GameMode) => {
    if (!todayData || mode === gameMode) return;
    setGameMode(mode);
    if (mode === "bridge") initBridge(todayData.dayId, todayData.startWord, todayData.targetWord, todayData.puzzleNumber);
    else initEndless(todayData.dayId, todayData.startWord, todayData.puzzleNumber);
  }, [todayData, gameMode, setGameMode, initBridge, initEndless]);

  // Fetch solution when bridge game ends
  useEffect(() => {
    if (isComplete && gameMode === "bridge" && !solutionPath && startWord && targetWord) {
      fetch(`/api/solution?start=${encodeURIComponent(startWord)}&target=${encodeURIComponent(targetWord)}&dayId=${dayId}`)
        .then(r => r.json())
        .then(d => { if (d.path) setSolutionPath(d.path); })
        .catch(() => {});
    }
  }, [isComplete, gameMode, solutionPath, startWord, targetWord, dayId, setSolutionPath]);

  const showFeedback = useCallback((text: string, type: FeedbackType) => {
    setFeedback({ text, type });
    // Auto-clear success/info; keep error/warning slightly longer
    setTimeout(() => setFeedback(null), type === "error" || type === "warning" ? 4500 : 2200);
  }, []);

  const handleGuess = useCallback(async (guess: string) => {
    if (isLoading || isComplete) return;
    setIsLoading(true);
    // Clear any previous feedback immediately on new guess
    setFeedback(null);
    try {
      const res = await fetch("/api/guess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: currentWord, guess, sessionId, dayId, chain, seedWord: startWord || seedWord, gameMode, targetWord }),
      });
      if (res.status === 429) { showFeedback("Too many guesses — slow down!", "error"); return; }
      const data = await res.json();

      if (data.duplicate) { showFeedback(`"${guess.toUpperCase()}" is already in your chain!`, "warning"); return; }
      if (data.noData)    { showFeedback(`No association data for "${guess}". Try another word.`, "warning"); return; }

      if (data.valid) {
        const node: ChainNode = { word: data.word, rank: data.rank, rankLabel: data.rankLabel, rankTier: data.rankTier, points: data.points, timestamp: Date.now() };
        addToChain(node, data.totalPoints);
        if (data.isWon) {
          winGame(data.totalPoints);
          showFeedback(`🎉 You reached ${data.word.toUpperCase()}!`, "success");
        } else {
          showFeedback(`✓ ${data.word.toUpperCase()} — ${data.rankLabel} · +${data.points}pts`, "success");
        }
      } else {
        if (gameMode === "endless") endGame(data.word, data.topAssociations, data.totalPoints);
        // In bridge mode, invalid just shows the message but doesn't end the game
        showFeedback(data.reason || `"${guess}" is not in the top 25!`, "error");
      }
    } catch {
      showFeedback("Connection error. Try again.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isComplete, currentWord, sessionId, dayId, chain, seedWord, startWord, gameMode, targetWord, addToChain, endGame, winGame, showFeedback]);

  const handleSubmitScore = async (name: string) => {
    if (isSubmitted || isSubmitting || isArchiveMode) return;
    setIsSubmitting(true);
    try {
      const res  = await fetch("/api/submit-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, dayId, chain, username: name, duration: getElapsedTime(), gameMode, won: isWon }),
      });
      const data = await res.json();
      if (data.success) { setSubmitted(data.rank, data.percentile); setUsername(name); showFeedback(`Saved! Ranked #${data.rank}`, "success"); }
    } catch { showFeedback("Failed to save score", "error"); }
    finally   { setIsSubmitting(false); }
  };

  if (initLoading || !hasSeenIntro) return (
    <div className="page-loading"><div className="loading-brain">⬡</div><p className="loading-text">Loading…</p></div>
  );

  const displayStart = startWord || seedWord || "";

  return (
    <main className="game-page">
      {/* Mode bar */}
      <div className="mode-bar">
        <button className={`mode-btn ${gameMode === "bridge"  ? "mode-btn-active" : ""}`} onClick={() => handleModeChange("bridge")}>🌉 Bridge</button>
        <button className={`mode-btn ${gameMode === "endless" ? "mode-btn-active" : ""}`} onClick={() => handleModeChange("endless")}>∞ Endless</button>
        <div className="mode-bar-spacer" />
        {chainLength > 0 && (
          <div className="puzzle-scores">
            <span className="puzzle-chain">{chainLength} {gameMode === "bridge" ? "steps" : "links"}</span>
            {totalPoints > 0 && <span className="puzzle-points">{totalPoints}pts</span>}
          </div>
        )}
        {!isComplete && chainLength > 0 && !showQuitConfirm && (
          <button className="quit-btn" onClick={() => setShowQuitConfirm(true)}>✕ Quit</button>
        )}
        {!isComplete && showQuitConfirm && (
          <div className="quit-confirm">
            <span>Give up?</span>
            <button className="quit-confirm-yes" onClick={() => { quitGame(); setShowQuitConfirm(false); }}>Yes</button>
            <button className="quit-confirm-no"  onClick={() => setShowQuitConfirm(false)}>No</button>
          </div>
        )}
      </div>

      {/* Chain area */}
      <div className="chain-scroll-area">
        {displayStart && (
          <ChainDisplay
            seedWord={displayStart}
            targetWord={gameMode === "bridge" ? targetWord : undefined}
            chain={chain}
            currentWord={currentWord}
            isComplete={isComplete}
            isWon={isWon}
            lastWrongGuess={gameMode === "endless" ? lastWrongGuess : null}
          />
        )}
      </div>

      {/* Input area with inline feedback strip just above it */}
      {!isComplete ? (
        <div className="input-area">
          {/* Inline feedback — sits directly above the input box */}
          {feedback && (
            <div className={`inline-feedback inline-feedback-${feedback.type}`}>
              {feedback.text}
            </div>
          )}
          {isLoading && <div className="loading-bar"><div className="loading-bar-fill" /></div>}
          <GuessInput
            currentWord={currentWord}
            targetWord={gameMode === "bridge" ? targetWord : undefined}
            onGuess={handleGuess}
            disabled={isComplete || isLoading}
            isLoading={isLoading}
          />
        </div>
      ) : (
        <div className="results-area">
          <GameOverPanel
            gameMode={gameMode} chainLength={chainLength} totalPoints={totalPoints}
            isWon={isWon} startWord={displayStart} targetWord={targetWord}
            currentWord={currentWord} lastWrongGuess={lastWrongGuess}
            topAssociations={topAssociations} solutionPath={solutionPath}
            playerChain={chain}
            onSubmit={handleSubmitScore} onPlayAgain={playAgain}
            isSubmitting={isSubmitting} isSubmitted={isSubmitted}
            isArchiveMode={isArchiveMode} rank={leaderboardRank}
            percentile={percentile} savedUsername={username}
          />
          <ShareCard
            chain={chain} seedWord={displayStart}
            targetWord={gameMode === "bridge" ? targetWord : undefined}
            chainLength={chainLength} totalPoints={totalPoints}
            puzzleNumber={puzzleNumber} gameMode={gameMode} isWon={isWon}
            rank={leaderboardRank} percentile={percentile}
          />
        </div>
      )}
    </main>
  );
}
