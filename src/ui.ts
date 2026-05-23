
import { GameData } from "./entities";
import { CANVAS_WIDTH, TOTAL_LEVELS } from "./definitions";

// ─── HUD drawing ─────────────────────────────────────────────────────────────

export function drawHUD(ctx: CanvasRenderingContext2D, data: GameData): void {
  const { score, highScore, lives, level, combo } = data;

  // Background bar
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(0, 0, CANVAS_WIDTH, 48);

  // Score
  ctx.font = "bold 13px 'Press Start 2P', monospace";
  ctx.fillStyle = "#ffd700";
  ctx.textAlign = "left";
  ctx.fillText(`${score.toLocaleString()}`, 12, 30);

  ctx.font = "9px 'Press Start 2P', monospace";
  ctx.fillStyle = "#a090cc";
  ctx.fillText("SCORE", 12, 12);

  // High score
  ctx.fillStyle = "#a090cc";
  ctx.textAlign = "center";
  ctx.font = "8px 'Press Start 2P', monospace";
  ctx.fillText("BEST", CANVAS_WIDTH / 2, 11);
  ctx.font = "11px 'Press Start 2P', monospace";
  ctx.fillStyle = "#c0a0ff";
  ctx.fillText(`${highScore.toLocaleString()}`, CANVAS_WIDTH / 2, 28);

  // Level progress bar
  const barW = 120;
  const barH = 6;
  const barX = CANVAS_WIDTH / 2 - barW / 2;
  const barY = 34;
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW, barH, 3);
  ctx.fill();
  const prog = (level - 1) / (TOTAL_LEVELS - 1);
  const lgGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
  lgGrad.addColorStop(0, "#7c00ff");
  lgGrad.addColorStop(1, "#ff44cc");
  ctx.fillStyle = lgGrad;
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW * prog, barH, 3);
  ctx.fill();

  // Level number
  ctx.textAlign = "right";
  ctx.font = "8px 'Press Start 2P', monospace";
  ctx.fillStyle = "#a090cc";
  ctx.fillText(`LVL ${level}/${TOTAL_LEVELS}`, CANVAS_WIDTH - 12, 11);

  // Lives
  const lifeEmoji = "💩";
  ctx.font = "16px serif";
  ctx.textAlign = "right";
  for (let i = 0; i < lives; i++) {
    ctx.fillText(lifeEmoji, CANVAS_WIDTH - 12 - i * 22, 32);
  }

  // Combo indicator
  if (combo > 1) {
    const comboAlpha = Math.min(1, data.comboTimer / 80);
    ctx.globalAlpha = comboAlpha;
    ctx.font = "bold 12px 'Press Start 2P', monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = `hsl(${combo * 30}, 100%, 65%)`;
    ctx.shadowColor = `hsl(${combo * 30}, 100%, 65%)`;
    ctx.shadowBlur = 12;
    ctx.fillText(`x${combo} COMBO!`, CANVAS_WIDTH / 2, 80);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
}

// ─── Screen helpers ───────────────────────────────────────────────────────────

export function showScreen(id: string): void {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
}

export function hideAllScreens(): void {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
}
