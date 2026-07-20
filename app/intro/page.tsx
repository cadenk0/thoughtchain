"use client";

import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/Header";

export default function IntroPage() {
  const router = useRouter();

  return (
    <main className="intro-page">
      <div className="intro-theme-toggle">
        <ThemeToggle />
      </div>

      <div className="intro-inner">
        <div className="intro-wordmark">ThoughtChain</div>
        <p className="intro-tagline">Connect words through association</p>

        <div className="intro-modes">
          <div className="intro-mode-card intro-mode-primary">
            <div className="intro-mode-header">
              <span className="intro-mode-icon">🌉</span>
              <h2 className="intro-mode-name">Bridge</h2>
              <span className="intro-mode-badge">Daily</span>
            </div>
            <p className="intro-mode-desc">
              Navigate from one word to another through associations in as few steps as possible.
            </p>
            <div className="intro-example">
              <span className="intro-ex-word intro-ex-start">OCEAN</span>
              <span className="intro-ex-arrow">→</span>
              <span className="intro-ex-word intro-ex-mid">WAVE</span>
              <span className="intro-ex-arrow">→</span>
              <span className="intro-ex-word intro-ex-mid">SURF</span>
              <span className="intro-ex-arrow">→</span>
              <span className="intro-ex-word intro-ex-target">SKY</span>
            </div>
            <p className="intro-mode-rule">Each step must be in the top 25 associations. Fewer steps wins.</p>
          </div>

          <div className="intro-mode-card">
            <div className="intro-mode-header">
              <span className="intro-mode-icon">∞</span>
              <h2 className="intro-mode-name">Endless</h2>
            </div>
            <p className="intro-mode-desc">
              Chain as many associations as you can. One wrong guess ends your run.
            </p>
            <p className="intro-mode-rule">Score = points per link (rank 1 = 25pts, rank 25 = 1pt)</p>
          </div>
        </div>

        <button className="intro-play-btn" onClick={() => router.push("/")}>
          Play today's puzzle →
        </button>

        <p className="intro-daily-note">Free · No account · New puzzles daily at midnight UTC</p>
      </div>
    </main>
  );
}
