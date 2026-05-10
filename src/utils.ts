
import { Particle } from "./entities";

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function randomInt(min: number, max: number): number {
  return Math.floor(randomRange(min, max + 1));
}

export function vec2Length(x: number, y: number): number {
  return Math.sqrt(x * x + y * y);
}

export function normalizeVec2(x: number, y: number): [number, number] {
  const len = vec2Length(x, y);
  if (len === 0) return [0, -1];
  return [x / len, y / len];
}

export function spawnParticles(
  particles: Particle[],
  cx: number,
  cy: number,
  emoji: string,
  count: number,
  speedScale = 1
): void {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = randomRange(1.5, 5) * speedScale;
    particles.push({
      x: cx + randomRange(-10, 10),
      y: cy + randomRange(-10, 10),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - randomRange(1, 3),
      life: 1,
      maxLife: randomRange(0.6, 1.2),
      emoji,
      size: randomRange(14, 28),
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: randomRange(-0.15, 0.15),
    });
  }
}

export function drawTextShadow(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  shadowColor: string,
  font: string
): void {
  ctx.font = font;
  ctx.fillStyle = shadowColor;
  ctx.fillText(text, x + 2, y + 2);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

// ─── Score Card Canvas ────────────────────────────────────────────────────────
// Waits for the Press Start 2P font to be ready before drawing text,
// then renders a shareable score card and returns a PNG blob.
export async function renderScoreCard(
  score: number,
  highScore: number,
  level: number,
  isWin: boolean
): Promise<Blob> {
  // Ensure the web font is loaded so it renders correctly in the offscreen canvas
  try {
    await document.fonts.load('bold 30px "Press Start 2P"');
    await document.fonts.load('16px "Press Start 2P"');
    await document.fonts.load('13px "Press Start 2P"');
  } catch {
    // Non-fatal – fall back to whatever is cached
  }

  const W = 600;
  const H = 420;
  const card = document.createElement("canvas");
  card.width = W;
  card.height = H;
  const ctx = card.getContext("2d")!;

  // ── Background gradient ──────────────────────────────────────────────────
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0,   "#0d0020");
  bg.addColorStop(0.5, "#1a0042");
  bg.addColorStop(1,   "#0d0020");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // ── Starfield ────────────────────────────────────────────────────────────
  // Use a seeded-ish pattern so the card looks the same every time
  for (let i = 0; i < 130; i++) {
    // deterministic "random" via simple hash
    const sx = ((i * 137.508) % W + W) % W;
    const sy = ((i * 97.123 + i * i * 0.31) % H + H) % H;
    const sr = (i % 3) * 0.5 + 0.3;
    ctx.globalAlpha = ((i % 7) / 7) * 0.75 + 0.1;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // ── Outer glow border ────────────────────────────────────────────────────
  ctx.shadowColor = "#cc44ff";
  ctx.shadowBlur  = 32;
  ctx.strokeStyle = "rgba(200,100,255,0.75)";
  ctx.lineWidth   = 3;
  ctx.beginPath();
  ctx.roundRect(12, 12, W - 24, H - 24, 20);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Subtle inner fill so the border has a glassy feel
  const innerGrad = ctx.createLinearGradient(12, 12, 12, H - 24);
  innerGrad.addColorStop(0,   "rgba(120,0,200,0.08)");
  innerGrad.addColorStop(0.5, "rgba(60,0,120,0.04)");
  innerGrad.addColorStop(1,   "rgba(0,0,0,0)");
  ctx.fillStyle = innerGrad;
  ctx.beginPath();
  ctx.roundRect(12, 12, W - 24, H - 24, 20);
  ctx.fill();

  // ── Big emoji ────────────────────────────────────────────────────────────
  ctx.font = "76px serif";
  ctx.textAlign = "center";
  ctx.fillText(isWin ? "🏆" : "💩", W / 2, 100);

  // ── Title ────────────────────────────────────────────────────────────────
  ctx.font        = 'bold 24px "Press Start 2P", monospace';
  ctx.fillStyle   = "#ffffff";
  ctx.shadowColor = "rgba(200,100,255,0.95)";
  ctx.shadowBlur  = 18;
  ctx.textAlign   = "center";
  ctx.fillText(isWin ? "ALL 100 FLUSHED!" : "POOP BREAKOUT", W / 2, 152);
  ctx.shadowBlur = 0;

  // ── Divider ──────────────────────────────────────────────────────────────
  const divGrad = ctx.createLinearGradient(60, 0, W - 60, 0);
  divGrad.addColorStop(0,   "rgba(150,50,255,0)");
  divGrad.addColorStop(0.3, "rgba(150,50,255,0.6)");
  divGrad.addColorStop(0.7, "rgba(150,50,255,0.6)");
  divGrad.addColorStop(1,   "rgba(150,50,255,0)");
  ctx.strokeStyle = divGrad;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(60, 168);
  ctx.lineTo(W - 60, 168);
  ctx.stroke();

  // ── Score row ────────────────────────────────────────────────────────────
  // Label
  ctx.font      = '10px "Press Start 2P", monospace';
  ctx.fillStyle = "#a080dd";
  ctx.textAlign = "center";
  ctx.fillText("SCORE", W / 2, 202);

  // Value
  ctx.font        = 'bold 28px "Press Start 2P", monospace';
  ctx.fillStyle   = "#ffd700";
  ctx.shadowColor = "rgba(255,215,0,0.6)";
  ctx.shadowBlur  = 14;
  ctx.fillText(score.toLocaleString(), W / 2, 242);
  ctx.shadowBlur = 0;

  // ── Level pill ───────────────────────────────────────────────────────────
  const pillW = 200;
  const pillH = 36;
  const pillX = W / 2 - pillW / 2;
  const pillY = 258;
  const pillGrad = ctx.createLinearGradient(pillX, pillY, pillX + pillW, pillY);
  pillGrad.addColorStop(0,   "rgba(124,0,255,0.5)");
  pillGrad.addColorStop(0.5, "rgba(201,64,255,0.5)");
  pillGrad.addColorStop(1,   "rgba(124,0,255,0.5)");
  ctx.fillStyle = pillGrad;
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, pillH / 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(200,100,255,0.5)";
  ctx.lineWidth   = 1;
  ctx.stroke();

  ctx.font      = '11px "Press Start 2P", monospace';
  ctx.fillStyle = "#e0c0ff";
  ctx.textAlign = "center";
  ctx.fillText(`LEVEL  ${level} / 100`, W / 2, pillY + 23);

  // ── Best score ───────────────────────────────────────────────────────────
  ctx.font      = '9px "Press Start 2P", monospace';
  ctx.fillStyle = "#7755aa";
  ctx.textAlign = "center";
  ctx.fillText(`BEST: ${highScore.toLocaleString()}`, W / 2, 322);

  // ── Bottom divider ───────────────────────────────────────────────────────
  ctx.strokeStyle = divGrad;
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(60, 340);
  ctx.lineTo(W - 60, 340);
  ctx.stroke();

  // ── Tagline ──────────────────────────────────────────────────────────────
  ctx.font      = 'bold 13px "Nunito", "Press Start 2P", sans-serif';
  ctx.fillStyle = "#664488";
  ctx.textAlign = "center";
  ctx.fillText("💩 Play Poop Breakout – the stinkiest game ever", W / 2, 374);

  // Return as blob
  return new Promise<Blob>((resolve, reject) => {
    card.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to create blob"));
    }, "image/png");
  });
}

export async function shareScore(
  score: number,
  highScore: number,
  level: number,
  isWin: boolean
): Promise<void> {
  const text = isWin
    ? `🏆 I just cleared ALL 100 levels of Poop Breakout with ${score.toLocaleString()} points! 💩🚽`
    : `💩 I scored ${score.toLocaleString()} points on level ${level}/100 in Poop Breakout! Can you beat me? 🚽`;

  try {
    const blob = await renderScoreCard(score, highScore, level, isWin);
    const file = new File([blob], "poop-breakout-score.png", { type: "image/png" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: "Poop Breakout 💩",
        text,
        files: [file],
      });
    } else if (navigator.share) {
      await navigator.share({ title: "Poop Breakout 💩", text });
    } else {
      // Fallback: download the image
      const url = URL.createObjectURL(blob);
      const a   = document.createElement("a");
      a.href     = url;
      a.download = "poop-breakout-score.png";
      a.click();
      URL.revokeObjectURL(url);
      alert("Score card downloaded! (Share API not available in this browser)");
    }
  } catch (err: any) {
    if (err?.name !== "AbortError") {
      console.error("Share failed:", err);
    }
  }
}
