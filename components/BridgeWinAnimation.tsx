"use client";

import { useEffect, useRef } from "react";
import { ChainNode } from "@/types";

interface Props {
  startWord: string;
  targetWord: string;
  chain: ChainNode[];
  solutionPath: string[] | null;
}

interface NodeD { x: number; y: number; word: string; type: "player" | "solution" | "shared" }
interface EdgeD  { from: number; to: number; type: "player" | "solution" }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; color: string }

export function BridgeWinAnimation({ startWord, targetWord, chain, solutionPath }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const W = (canvas.width  = canvas.offsetWidth  || 380);
    const H = (canvas.height = canvas.offsetHeight || 220);
    const cx = W / 2, cy = H / 2;

    const playerWords  = [startWord, ...chain.map(n => n.word), targetWord];
    const solutionWords = solutionPath ?? [];
    const allWords = Array.from(new Set([...playerWords, ...solutionWords]));

    const nodeMap = new Map<string, NodeD>();
    allWords.forEach((word, i) => {
      let x: number, y: number;
      if (word === startWord)   { x = cx * 0.28; y = cy; }
      else if (word === targetWord) { x = cx * 1.72; y = cy; }
      else {
        const angle = (i / Math.max(allWords.length - 1, 1)) * Math.PI * 1.6 - Math.PI * 0.8;
        const r = Math.min(W, H) * 0.30;
        x = cx + Math.cos(angle) * r * (0.8 + Math.random() * 0.4);
        y = cy + Math.sin(angle) * r * (0.7 + Math.random() * 0.4);
      }
      const inP = playerWords.includes(word), inS = solutionWords.includes(word);
      nodeMap.set(word, {
        x: Math.max(44, Math.min(W - 44, x)),
        y: Math.max(30, Math.min(H - 30, y)),
        word,
        type: inP && inS ? "shared" : inP ? "player" : "solution",
      });
    });

    const nodes = allWords.map(w => nodeMap.get(w)!);

    const edges: EdgeD[] = [];
    for (let i = 0; i < playerWords.length - 1; i++) {
      edges.push({ from: allWords.indexOf(playerWords[i]), to: allWords.indexOf(playerWords[i + 1]), type: "player" });
    }
    if (solutionWords.length > 1) {
      for (let i = 0; i < solutionWords.length - 1; i++) {
        const ai = allWords.indexOf(solutionWords[i]), bi = allWords.indexOf(solutionWords[i + 1]);
        if (!edges.some(e => (e.from === ai && e.to === bi) || (e.from === bi && e.to === ai))) {
          edges.push({ from: ai, to: bi, type: "solution" });
        }
      }
    }

    const isDark  = document.documentElement.getAttribute("data-theme") === "dark";
    const BG      = isDark ? "#0d0d11" : "#f7f7f5";
    const CYAN    = isDark ? "#00aaff" : "#007aff";
    const AMBER   = isDark ? "#ffaa33" : "#d4800a";
    const TXT     = isDark ? "#eeeef5" : "#111118";
    const GREEN   = isDark ? "#00e87a" : "#00a651";

    const particles: Particle[] = [];
    function burst(x: number, y: number, color: string, n = 8) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, s = 1 + Math.random() * 2.5;
        particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, color });
      }
    }

    let progress = 0;
    let lastEdgeDone = -1;
    const playerEdges = edges.filter(e => e.type === "player");
    const solEdges    = edges.filter(e => e.type === "solution");

    function draw() {
      progress = Math.min(1, progress + 0.009);
      const edgeProg = progress * (playerEdges.length + 0.6);

      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);

      // Solution edges (faded dashed, fade in after midpoint)
      if (progress > 0.55) {
        const alpha = Math.min(1, (progress - 0.55) * 2.2) * 0.22;
        ctx.globalAlpha = alpha;
        solEdges.forEach(e => {
          const a = nodes[e.from], b = nodes[e.to];
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = AMBER; ctx.lineWidth = 1.5;
          ctx.setLineDash([5, 6]); ctx.stroke(); ctx.setLineDash([]);
        });
        ctx.globalAlpha = 1;
      }

      // Player edges (animate in sequence)
      playerEdges.forEach((e, i) => {
        const ep = Math.min(1, Math.max(0, edgeProg - i));
        if (ep <= 0) return;
        const a = nodes[e.from], b = nodes[e.to];
        const tx = a.x + (b.x - a.x) * ep, ty = a.y + (b.y - a.y) * ep;

        if (ep < 1 && Math.random() < 0.35) burst(tx, ty, CYAN, 3);
        if (ep >= 1 && i > lastEdgeDone) {
          lastEdgeDone = i;
          burst(b.x, b.y, i === playerEdges.length - 1 ? GREEN : CYAN, 10);
        }

        const g = ctx.createLinearGradient(a.x, a.y, tx, ty);
        g.addColorStop(0, CYAN + "55"); g.addColorStop(1, CYAN);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(tx, ty);
        ctx.strokeStyle = g; ctx.lineWidth = 2.5;
        ctx.shadowColor = CYAN; ctx.shadowBlur = 10;
        ctx.stroke(); ctx.shadowBlur = 0;
      });

      // Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.93; p.vy *= 0.93;
        p.life -= 0.038;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.globalAlpha = p.life;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Nodes
      nodes.forEach((node, idx) => {
        const playerIdx = playerWords.indexOf(node.word);
        const nodeAlpha = node.type === "solution"
          ? Math.min(1, Math.max(0, (progress - 0.55) * 2.2) * 0.55)
          : Math.min(1, Math.max(0, edgeProg - (playerIdx <= 0 ? -0.4 : playerIdx - 0.5)));
        if (nodeAlpha <= 0) return;

        const isEnd   = node.word === targetWord;
        const isStart = node.word === startWord;
        const inP     = playerWords.includes(node.word);
        const r       = isStart || isEnd ? 26 : 18;
        const color   = isEnd && inP ? GREEN : isStart ? CYAN : inP ? CYAN : AMBER;

        ctx.globalAlpha = nodeAlpha;

        // Glow halo
        const halo = ctx.createRadialGradient(node.x, node.y, r - 2, node.x, node.y, r + 14);
        halo.addColorStop(0, color + "50"); halo.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(node.x, node.y, r + 14, 0, Math.PI * 2);
        ctx.fillStyle = halo; ctx.fill();

        // Circle
        ctx.beginPath(); ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? "#18181f" : "#ffffff"; ctx.fill();
        ctx.strokeStyle = color; ctx.lineWidth = isStart || isEnd ? 2.5 : 1.8;
        ctx.shadowColor = color; ctx.shadowBlur = 6;
        ctx.stroke(); ctx.shadowBlur = 0;

        // Label
        ctx.fillStyle = TXT;
        ctx.font = `700 ${isStart || isEnd ? 10 : 8}px "SF Mono",monospace`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        const label = node.word.length > 7 ? node.word.slice(0, 6) + "…" : node.word;
        ctx.fillText(label.toUpperCase(), node.x, node.y);

        ctx.globalAlpha = 1;
      });

      if (progress < 1 || particles.length > 0) {
        animRef.current = requestAnimationFrame(draw);
      }
    }

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [startWord, targetWord, chain, solutionPath]);

  return (
    <canvas
      ref={canvasRef}
      className="bridge-win-canvas"
      style={{ width: "100%", height: "220px", display: "block" }}
    />
  );
}
