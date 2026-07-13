"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";

interface GuessInputProps {
  currentWord: string;
  targetWord?: string;
  onGuess: (guess: string) => Promise<void>;
  disabled?: boolean;
  isLoading?: boolean;
}

export function GuessInput({ currentWord, targetWord, onGuess, disabled = false, isLoading = false }: GuessInputProps) {
  const [value, setValue] = useState("");
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled, currentWord]);

  const handleSubmit = async () => {
    const trimmed = value.trim();
    if (!trimmed || disabled || isLoading) return;
    if (trimmed.length < 2) { setShake(true); setTimeout(() => setShake(false), 500); return; }
    setValue("");
    await onGuess(trimmed);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  const placeholder = targetWord
    ? `Word between "${currentWord.toUpperCase()}" and "${targetWord.toUpperCase()}"…`
    : `What comes to mind from "${currentWord.toUpperCase()}"?`;

  return (
    <div className="input-wrapper">
      <div className={`input-container ${shake ? "input-shake" : ""}`}>
        <div className="input-prompt">
          <span className="input-from-word">{currentWord.toUpperCase()}</span>
          <span className="input-arrow">→</span>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value.toLowerCase().replace(/[^a-z\s-]/g, ""))}
          onKeyDown={handleKeyDown}
          disabled={disabled || isLoading}
          placeholder={placeholder}
          className="guess-input"
          maxLength={30}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
        />
        <button onClick={handleSubmit} disabled={disabled || isLoading || !value.trim()} className="submit-btn" aria-label="Submit guess">
          {isLoading ? <span className="btn-spinner" /> : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>
      <p className="input-hint">Press Enter to guess</p>
    </div>
  );
}
