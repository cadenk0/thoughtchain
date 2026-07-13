"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useThemeStore } from "@/store/themeStore";

function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle-btn"
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {theme === "light" ? (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
          <path d="M14 9.3A6 6 0 116.7 2 4.7 4.7 0 0014 9.3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M8 1v1.5M8 13.5V15M15 8h-1.5M2.5 8H1M12.8 3.2l-1 1M4.2 11.8l-1 1M12.8 12.8l-1-1M4.2 4.2l-1-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )}
    </button>
  );
}

export { ThemeToggle };

export function Header() {
  const pathname = usePathname();
  if (pathname === "/intro") return null;

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/intro" className="header-logo">
          <span className="logo-text">ThoughtChain</span>
        </Link>
        <nav className="header-nav">
          <Link href="/"            className={`nav-link ${pathname === "/"            ? "nav-link-active" : ""}`}>Play</Link>
          <Link href="/leaderboard" className={`nav-link ${pathname === "/leaderboard" ? "nav-link-active" : ""}`}>Ranks</Link>
          <Link href="/archive"     className={`nav-link ${pathname === "/archive"     ? "nav-link-active" : ""}`}>Archive</Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
