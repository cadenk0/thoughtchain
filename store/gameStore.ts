"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ChainNode, GameMode } from "@/types";

interface GameStore {
  sessionId: string;
  dayId: string;
  currentWord: string;
  chain: ChainNode[];
  isComplete: boolean;
  isWon: boolean;
  startTime: number | null;
  endTime: number | null;
  chainLength: number;
  totalPoints: number;
  lastWrongGuess: string | null;
  topAssociations: string[] | null;
  isSubmitted: boolean;
  leaderboardRank: number | null;
  percentile: number | null;
  username: string;
  puzzleNumber: number;
  isArchiveMode: boolean;
  hasSeenIntro: boolean;
  gameMode: GameMode;
  seedWord: string;
  streak: number;
  lastPlayedDayId: string | null;
  startWord: string;
  targetWord: string;
  solutionPath: string[] | null; // server-computed answer key

  setGameMode: (mode: GameMode) => void;
  setHasSeenIntro: () => void;
  initEndless: (dayId: string, seedWord: string, puzzleNumber: number) => void;
  initBridge: (dayId: string, startWord: string, targetWord: string, puzzleNumber: number) => void;
  startArchiveEndless: (dayId: string, seedWord: string, puzzleNumber: number) => void;
  startArchiveBridge: (dayId: string, startWord: string, targetWord: string, puzzleNumber: number) => void;
  playAgain: () => void;
  quitGame: () => void;
  addToChain: (node: ChainNode, newTotalPoints: number) => void;
  endGame: (wrongGuess?: string, topAssociations?: string[], finalTotalPoints?: number) => void;
  winGame: (finalTotalPoints: number) => void;
  setSolutionPath: (path: string[]) => void;
  setSubmitted: (rank: number, percentile: number) => void;
  setUsername: (name: string) => void;
  getElapsedTime: () => number;
}

function genId() { return `tc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`; }

function freshEndless(dayId: string, seedWord: string, puzzleNumber: number) {
  const w = seedWord.toLowerCase();
  return { sessionId: genId(), dayId, seedWord: w, startWord: w, targetWord: "", currentWord: w, chain: [] as ChainNode[], isComplete: false, isWon: false, startTime: Date.now(), endTime: null as null | number, chainLength: 0, totalPoints: 0, lastWrongGuess: null as null | string, topAssociations: null as null | string[], isSubmitted: false, leaderboardRank: null as null | number, percentile: null as null | number, puzzleNumber, gameMode: "endless" as GameMode, solutionPath: null as null | string[] };
}

function freshBridge(dayId: string, startWord: string, targetWord: string, puzzleNumber: number) {
  const s = startWord.toLowerCase(), t = targetWord.toLowerCase();
  return { sessionId: genId(), dayId, seedWord: s, startWord: s, targetWord: t, currentWord: s, chain: [] as ChainNode[], isComplete: false, isWon: false, startTime: Date.now(), endTime: null as null | number, chainLength: 0, totalPoints: 0, lastWrongGuess: null as null | string, topAssociations: null as null | string[], isSubmitted: false, leaderboardRank: null as null | number, percentile: null as null | number, puzzleNumber, gameMode: "bridge" as GameMode, solutionPath: null as null | string[] };
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      sessionId: genId(), dayId: "", seedWord: "", startWord: "", targetWord: "", currentWord: "",
      chain: [], isComplete: false, isWon: false, startTime: null, endTime: null,
      chainLength: 0, totalPoints: 0, lastWrongGuess: null, topAssociations: null,
      isSubmitted: false, leaderboardRank: null, percentile: null,
      username: "", streak: 0, lastPlayedDayId: null, puzzleNumber: 0,
      gameMode: "bridge" as GameMode, isArchiveMode: false, hasSeenIntro: false,
      solutionPath: null,

      setHasSeenIntro: () => set({ hasSeenIntro: true }),

      // FIX: always allow mode switch — don't block based on chain length
      setGameMode: (mode) => set({ gameMode: mode }),

      initEndless: (dayId, seedWord, puzzleNumber) => {
        const s = get();
        // If already playing today's game (not archive), keep existing state
        if (!s.isArchiveMode && s.gameMode === "endless" && s.dayId === dayId && (s.chain.length > 0 || s.isComplete)) return;
        set({ ...freshEndless(dayId, seedWord, puzzleNumber), isArchiveMode: false });
      },

      initBridge: (dayId, startWord, targetWord, puzzleNumber) => {
        const s = get();
        // If already playing today's game (not archive), keep existing state
        if (!s.isArchiveMode && s.gameMode === "bridge" && s.dayId === dayId && (s.chain.length > 0 || s.isComplete)) return;
        set({ ...freshBridge(dayId, startWord, targetWord, puzzleNumber), isArchiveMode: false });
      },

      startArchiveEndless: (dayId, seedWord, puzzleNumber) =>
        set({ ...freshEndless(dayId, seedWord, puzzleNumber), isArchiveMode: true }),

      startArchiveBridge: (dayId, startWord, targetWord, puzzleNumber) =>
        set({ ...freshBridge(dayId, startWord, targetWord, puzzleNumber), isArchiveMode: true }),

      playAgain: () => {
        const s = get();
        if (s.gameMode === "bridge")
          set({ ...freshBridge(s.dayId, s.startWord, s.targetWord, s.puzzleNumber), isArchiveMode: s.isArchiveMode });
        else
          set({ ...freshEndless(s.dayId, s.seedWord, s.puzzleNumber), isArchiveMode: s.isArchiveMode });
      },

      // Quit ends the game voluntarily — show results without a wrong guess
      quitGame: () => {
        const s = get();
        set({ isComplete: true, isWon: false, endTime: Date.now(), lastPlayedDayId: s.dayId });
      },

      addToChain: (node, newTotalPoints) => {
        const s = get();
        if (s.isComplete) return;
        const newChain = [...s.chain, node];
        set({ chain: newChain, currentWord: node.word, chainLength: newChain.length, totalPoints: newTotalPoints, startTime: s.startTime || Date.now() });
      },

      endGame: (wrongGuess, topAssociations, finalTotalPoints) => {
        const s = get();
        set({ isComplete: true, isWon: false, endTime: Date.now(), lastWrongGuess: wrongGuess || null, topAssociations: topAssociations || null, totalPoints: finalTotalPoints ?? s.totalPoints, lastPlayedDayId: s.dayId, streak: s.chainLength > 0 ? s.streak + 1 : 0 });
      },

      winGame: (finalTotalPoints) => {
        const s = get();
        set({ isComplete: true, isWon: true, endTime: Date.now(), totalPoints: finalTotalPoints, lastPlayedDayId: s.dayId, streak: s.streak + 1 });
      },

      setSolutionPath: (path) => set({ solutionPath: path }),
      setSubmitted: (rank, percentile) => set({ isSubmitted: true, leaderboardRank: rank, percentile }),
      setUsername: (name) => set({ username: name }),

      getElapsedTime: () => {
        const s = get();
        if (!s.startTime) return 0;
        return Math.floor(((s.endTime || Date.now()) - s.startTime) / 1000);
      },
    }),
    {
      name: "thoughtchain-game-v3",
      partialize: (s) => ({
        sessionId: s.sessionId, dayId: s.dayId, seedWord: s.seedWord,
        startWord: s.startWord, targetWord: s.targetWord, currentWord: s.currentWord,
        chain: s.chain, isComplete: s.isComplete, isWon: s.isWon,
        startTime: s.startTime, endTime: s.endTime, chainLength: s.chainLength,
        totalPoints: s.totalPoints, lastWrongGuess: s.lastWrongGuess, topAssociations: s.topAssociations,
        isSubmitted: s.isSubmitted, leaderboardRank: s.leaderboardRank, percentile: s.percentile,
        username: s.username, streak: s.streak, lastPlayedDayId: s.lastPlayedDayId,
        puzzleNumber: s.puzzleNumber, gameMode: s.gameMode, isArchiveMode: s.isArchiveMode,
        hasSeenIntro: s.hasSeenIntro, solutionPath: s.solutionPath,
      }),
    }
  )
);
