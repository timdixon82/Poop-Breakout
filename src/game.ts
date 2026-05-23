
import {
  CANVAS_WIDTH, CANVAS_HEIGHT,
  PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_Y_OFFSET,
  BALL_RADIUS, BALL_BASE_SPEED, BALL_MAX_SPEED,
  BRICK_COLS, BRICK_ROWS, BRICK_WIDTH, BRICK_HEIGHT,
  BRICK_PAD_X, BRICK_PAD_Y, BRICK_OFFSET_X, BRICK_OFFSET_Y,
  LIVES_START, TOTAL_LEVELS,
  BrickType, GameState,
  SCORE_POOP_PER_HIT, SCORE_TOILET_PER_HIT,
} from "./definitions";

import { Ball, Brick, GameData, Paddle } from "./entities";
import { clamp, lerp, normalizeVec2, randomRange, spawnParticles } from "./utils";
import { drawHUD } from "./ui";
import { generateLayout, getHitValues, getLevelSpeedMult } from "./levelgen";

// ─── Emoji rendering via offscreen canvas ─────────────────────────────────────

const emojiCache: Map<string, HTMLCanvasElement> = new Map();

function getEmojiCanvas(emoji: string, size: number): HTMLCanvasElement {
  const key = `${emoji}_${size}`;
  if (emojiCache.has(key)) return emojiCache.get(key)!;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const cx = c.getContext("2d")!;
  cx.font = `${Math.floor(size * 0.78)}px serif`;
  cx.textAlign = "center";
  cx.textBaseline = "middle";
  cx.fillText(emoji, size / 2, size / 2 + 2);
  emojiCache.set(key, c);
  return c;
}

// ─── Build brick grid ─────────────────────────────────────────────────────────

function buildBricks(level: number): Brick[][] {
  const layout = generateLayout(level);
  const { poopHits, toiletHits } = getHitValues(level);
  const grid: Brick[][] = [];

  for (let row = 0; row < BRICK_ROWS; row++) {
    grid[row] = [];
    for (let col = 0; col < BRICK_COLS; col++) {
      const type = layout[row]?.[col] ?? BrickType.EMPTY;
      const maxHits = type === BrickType.TOILET ? toiletHits
                    : type === BrickType.POOP   ? poopHits
                    : 0;
      const x = BRICK_OFFSET_X + col * (BRICK_WIDTH + BRICK_PAD_X);
      const y = BRICK_OFFSET_Y + row * (BRICK_HEIGHT + BRICK_PAD_Y);
      grid[row].push({
        x, y, width: BRICK_WIDTH, height: BRICK_HEIGHT,
        type, hits: maxHits, maxHits, alive: type !== BrickType.EMPTY,
        shakeTimer: 0, scaleAnim: 1, opacity: 1,
      });
    }
  }
  return grid;
}

// ─── Ball helpers ─────────────────────────────────────────────────────────────

function resetBall(ball: Ball, paddle: Paddle): void {
  ball.x = paddle.x + paddle.width / 2;
  ball.y = paddle.y - BALL_RADIUS - 4;
  ball.dx = 0;
  ball.dy = 0;
  ball.trail = [];
}

function launchBallDir(ball: Ball, level: number): void {
  const speedMult = getLevelSpeedMult(level);
  const speed = Math.min(BALL_BASE_SPEED * speedMult, BALL_MAX_SPEED);
  const angle = randomRange(-Math.PI / 4, Math.PI / 4) - Math.PI / 2;
  ball.dx = Math.cos(angle) * speed;
  ball.dy = Math.sin(angle) * speed;
}

// ─── Helpers to check whether any UI screen is currently visible ──────────────

function isAnyScreenActive(): boolean {
  return document.querySelector(".screen.active") !== null;
}

// ─── Game class ───────────────────────────────────────────────────────────────

export class PoopBreakout {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  public data: GameData;
  private state: GameState = GameState.START;
  private rafId = 0;
  private lastTime = 0;
  private bgStars: { x: number; y: number; r: number; a: number; da: number }[] = [];

  onGameOver?: (score: number, high: number, level: number) => void;
  onLevelClear?: (score: number, level: number) => void;
  onWin?: (score: number) => void;
  onSaveNeeded?: () => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    canvas.width  = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    this.ctx = canvas.getContext("2d")!;

    for (let i = 0; i < 80; i++) {
      this.bgStars.push({
        x:  Math.random() * CANVAS_WIDTH,
        y:  Math.random() * CANVAS_HEIGHT,
        r:  Math.random() * 1.5 + 0.3,
        a:  Math.random(),
        da: randomRange(0.003, 0.012) * (Math.random() < 0.5 ? 1 : -1),
      });
    }

    const paddle: Paddle = {
      x:       CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
      y:       CANVAS_HEIGHT - PADDLE_Y_OFFSET,
      width:   PADDLE_WIDTH,
      height:  PADDLE_HEIGHT,
      targetX: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
    };
    const ball: Ball = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - PADDLE_Y_OFFSET - BALL_RADIUS - 4,
      dx: 0, dy: 0,
      radius: BALL_RADIUS,
      trail: [],
    };

    this.data = {
      score: 0, highScore: 0, lives: LIVES_START, level: 1,
      combo: 0, comboTimer: 0,
      bricks: buildBricks(1),
      ball, paddle,
      particles: [], flashes: [],
      shakeX: 0, shakeY: 0, shakeTimer: 0,
    };

    this.bindEvents();
  }

  // ─── Input ──────────────────────────────────────────────────────────────────

  private keys: Set<string> = new Set();

  private bindEvents(): void {
    // ── Mouse: only update paddle when actively playing / launching ──────────
    this.canvas.addEventListener("mousemove", (e) => {
      // Ignore if any overlay screen (score card, menus, etc.) is showing
      if (isAnyScreenActive()) return;
      if (this.state !== GameState.PLAYING && this.state !== GameState.BALL_LAUNCH) return;

      const rect   = this.canvas.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const mx     = (e.clientX - rect.left) * scaleX;
      this.data.paddle.targetX = clamp(mx - this.data.paddle.width / 2, 0, CANVAS_WIDTH - this.data.paddle.width);
    });

    // ── Touch move ───────────────────────────────────────────────────────────
    this.canvas.addEventListener("touchmove", (e) => {
      if (isAnyScreenActive()) return;
      if (this.state !== GameState.PLAYING && this.state !== GameState.BALL_LAUNCH) return;

      e.preventDefault();
      const rect   = this.canvas.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const mx     = (e.touches[0].clientX - rect.left) * scaleX;
      this.data.paddle.targetX = clamp(mx - this.data.paddle.width / 2, 0, CANVAS_WIDTH - this.data.paddle.width);
    }, { passive: false });

    // ── Keyboard ─────────────────────────────────────────────────────────────
    window.addEventListener("keydown", (e) => {
      this.keys.add(e.key);
      if (e.key === " " && this.state === GameState.BALL_LAUNCH && !isAnyScreenActive()) {
        this.doLaunchBall();
      }
    });
    window.addEventListener("keyup", (e) => this.keys.delete(e.key));

    // ── Canvas click / touch – launch ball ───────────────────────────────────
    this.canvas.addEventListener("click", () => {
      if (isAnyScreenActive()) return;
      if (this.state === GameState.BALL_LAUNCH) this.doLaunchBall();
    });
    this.canvas.addEventListener("touchstart", () => {
      if (isAnyScreenActive()) return;
      if (this.state === GameState.BALL_LAUNCH) this.doLaunchBall();
    });
  }

  private handleKeyboardPaddle(dt: number): void {
    // Don't move paddle via keyboard when a screen overlay is showing
    if (isAnyScreenActive()) return;

    const speed = 560 * dt;
    const p = this.data.paddle;
    if (this.keys.has("ArrowLeft")  || this.keys.has("Left"))  {
      p.targetX = clamp(p.targetX - speed, 0, CANVAS_WIDTH - p.width);
    }
    if (this.keys.has("ArrowRight") || this.keys.has("Right")) {
      p.targetX = clamp(p.targetX + speed, 0, CANVAS_WIDTH - p.width);
    }
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  public startGame(level = 1): void {
    const d = this.data;
    d.score      = 0;
    d.lives      = LIVES_START;
    d.level      = level;
    d.combo      = 0;
    d.comboTimer = 0;
    d.particles  = [];
    d.flashes    = [];
    d.bricks     = buildBricks(level);
    d.paddle.x   = CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2;
    d.paddle.targetX = d.paddle.x;
    resetBall(d.ball, d.paddle);
    this.state = GameState.BALL_LAUNCH;
    this.startLoop();
    this.onSaveNeeded?.();
  }

  public startLevel(level: number): void {
    const d = this.data;
    d.level      = level;
    d.combo      = 0;
    d.particles  = [];
    d.flashes    = [];
    d.bricks     = buildBricks(level);
    d.paddle.x   = CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2;
    d.paddle.targetX = d.paddle.x;
    resetBall(d.ball, d.paddle);
    this.state = GameState.BALL_LAUNCH;
    this.onSaveNeeded?.();
  }

  public setHighScore(hs: number): void {
    this.data.highScore = hs;
  }

  public getState(): GameState {
    return this.state;
  }

  private doLaunchBall(): void {
    launchBallDir(this.data.ball, this.data.level);
    this.state = GameState.PLAYING;
  }

  public startLoop(): void {
    cancelAnimationFrame(this.rafId);
    this.lastTime = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - this.lastTime) / 1000, 0.05);
      this.lastTime = now;
      this.update(dt);
      this.draw();
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  public stop(): void {
    cancelAnimationFrame(this.rafId);
  }

  // ─── Update ─────────────────────────────────────────────────────────────────

  private update(dt: number): void {
    const d = this.data;

    this.bgStars.forEach(s => {
      s.a += s.da;
      if (s.a > 1 || s.a < 0) s.da *= -1;
    });

    if (this.state === GameState.PLAYING || this.state === GameState.BALL_LAUNCH) {
      this.handleKeyboardPaddle(dt);
    }

    d.paddle.x = lerp(d.paddle.x, d.paddle.targetX, clamp(dt * 22, 0, 1));

    if (this.state === GameState.BALL_LAUNCH) {
      d.ball.x = d.paddle.x + d.paddle.width / 2;
      d.ball.y = d.paddle.y - BALL_RADIUS - 4;
    }

    if (this.state === GameState.PLAYING) {
      this.updateBall(dt);
    }

    // Particles
    d.particles = d.particles.filter(p => p.life > 0);
    d.particles.forEach(p => {
      const elapsed = 0.016 / p.maxLife;
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += 0.15;
      p.vx *= 0.98;
      p.life     -= elapsed * 0.9;
      p.rotation += p.rotSpeed;
    });

    // Flash messages
    d.flashes = d.flashes.filter(f => f.life > 0);
    d.flashes.forEach(f => {
      f.y    -= 0.7;
      f.life -= 0.018;
    });

    if (d.comboTimer > 0) d.comboTimer--;
    else if (d.combo > 0) d.combo = 0;

    if (d.shakeTimer > 0) {
      d.shakeTimer--;
      const mag = d.shakeTimer * 0.5;
      d.shakeX = randomRange(-mag, mag);
      d.shakeY = randomRange(-mag, mag);
    } else {
      d.shakeX = 0;
      d.shakeY = 0;
    }

    for (const row of d.bricks) {
      for (const b of row) {
        if (b.shakeTimer > 0) b.shakeTimer--;
        if (!b.alive && b.opacity > 0) {
          b.opacity   = Math.max(0, b.opacity - 0.07);
          b.scaleAnim = Math.min(b.scaleAnim + 0.06, 1.4);
        }
      }
    }
  }

  private updateBall(_dt: number): void {
    const d      = this.data;
    const ball   = d.ball;
    const paddle = d.paddle;

    // Trail
    ball.trail.push({ x: ball.x, y: ball.y, alpha: 0.5 });
    if (ball.trail.length > 14) ball.trail.shift();
    ball.trail.forEach((t, i) => { t.alpha = (i / ball.trail.length) * 0.4; });

    // Speed
    const speedMult = getLevelSpeedMult(d.level);
    const maxSpd    = Math.min(BALL_BASE_SPEED * speedMult + d.combo * 0.08, BALL_MAX_SPEED);
    const spd       = Math.hypot(ball.dx, ball.dy);
    if (spd > 0 && (spd > maxSpd || spd < BALL_BASE_SPEED * speedMult * 0.8)) {
      const target = spd > maxSpd ? maxSpd : BALL_BASE_SPEED * speedMult;
      const [nx, ny] = normalizeVec2(ball.dx, ball.dy);
      ball.dx = nx * target;
      ball.dy = ny * target;
    }

    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collisions
    if (ball.x - ball.radius < 0)            { ball.x = ball.radius;                 ball.dx =  Math.abs(ball.dx); }
    if (ball.x + ball.radius > CANVAS_WIDTH)  { ball.x = CANVAS_WIDTH - ball.radius; ball.dx = -Math.abs(ball.dx); }
    if (ball.y - ball.radius < 48)            { ball.y = 48 + ball.radius;            ball.dy =  Math.abs(ball.dy); }

    // Paddle collision
    if (
      ball.dy > 0 &&
      ball.y + ball.radius >= paddle.y &&
      ball.y - ball.radius <= paddle.y + paddle.height &&
      ball.x >= paddle.x - ball.radius &&
      ball.x <= paddle.x + paddle.width + ball.radius
    ) {
      ball.y = paddle.y - ball.radius;
      const hitRatio    = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
      const bounceAngle = hitRatio * (Math.PI / 3);
      const currentSpeed = Math.hypot(ball.dx, ball.dy);
      ball.dx = Math.sin(bounceAngle) * currentSpeed;
      ball.dy = -Math.abs(Math.cos(bounceAngle) * currentSpeed);
    }

    // Fell off bottom
    if (ball.y - ball.radius > CANVAS_HEIGHT) {
      d.lives--;
      d.combo      = 0;
      d.comboTimer = 0;
      if (d.lives <= 0) {
        d.lives = 0;
        this.state = GameState.GAME_OVER;
        if (d.score > d.highScore) d.highScore = d.score;
        setTimeout(() => this.onGameOver?.(d.score, d.highScore, d.level), 400);
      } else {
        d.shakeTimer = 18;
        this.state   = GameState.BALL_LAUNCH;
        resetBall(ball, paddle);
        spawnParticles(d.particles, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 60, "💦", 8, 1.5);
      }
      return;
    }

    this.checkBrickCollisions();

    // Check level clear
    const alive = d.bricks.flat().some(b => b.alive);
    if (!alive) {
      this.state = GameState.LEVEL_CLEAR;
      if (d.level >= TOTAL_LEVELS) {
        if (d.score > d.highScore) d.highScore = d.score;
        this.onSaveNeeded?.();
        setTimeout(() => this.onWin?.(d.score), 600);
      } else {
        this.onSaveNeeded?.();
        setTimeout(() => this.onLevelClear?.(d.score, d.level), 600);
      }
    }
  }

  private checkBrickCollisions(): void {
    const d    = this.data;
    const ball = d.ball;
    let hit    = false;

    for (const row of d.bricks) {
      if (hit) break;
      for (const brick of row) {
        if (!brick.alive) continue;

        const bLeft   = brick.x;
        const bRight  = brick.x + brick.width;
        const bTop    = brick.y;
        const bBottom = brick.y + brick.height;

        const closestX = clamp(ball.x, bLeft, bRight);
        const closestY = clamp(ball.y, bTop, bBottom);
        const distX    = ball.x - closestX;
        const distY    = ball.y - closestY;
        const distSq   = distX * distX + distY * distY;

        if (distSq > ball.radius * ball.radius) continue;

        const overlapLeft   = ball.x + ball.radius - bLeft;
        const overlapRight  = bRight  - (ball.x - ball.radius);
        const overlapTop    = ball.y + ball.radius - bTop;
        const overlapBottom = bBottom - (ball.y - ball.radius);
        const minOverlap    = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

        if      (minOverlap === overlapLeft)  { ball.dx = -Math.abs(ball.dx); ball.x = bLeft  - ball.radius; }
        else if (minOverlap === overlapRight) { ball.dx =  Math.abs(ball.dx); ball.x = bRight + ball.radius; }
        else if (minOverlap === overlapTop)   { ball.dy = -Math.abs(ball.dy); ball.y = bTop   - ball.radius; }
        else                                  { ball.dy =  Math.abs(ball.dy); ball.y = bBottom + ball.radius; }

        brick.hits--;
        brick.shakeTimer = 8;

        const cx        = brick.x + brick.width / 2;
        const cy        = brick.y + brick.height / 2;
        const ptsPerHit = brick.type === BrickType.TOILET ? SCORE_TOILET_PER_HIT : SCORE_POOP_PER_HIT;

        if (brick.hits <= 0) {
          brick.alive     = false;
          brick.scaleAnim = 1;

          const comboBonus = Math.floor(ptsPerHit * (d.combo * 0.15));
          const total      = ptsPerHit + comboBonus;
          d.score += total;
          if (d.score > d.highScore) d.highScore = d.score;

          d.combo++;
          d.comboTimer = 130;

          const particleEmoji = brick.type === BrickType.TOILET ? "🚽" : "💩";
          spawnParticles(d.particles, cx, cy, particleEmoji, 7, 1.3);
          spawnParticles(d.particles, cx, cy, "✨", 5, 1.6);

          const label = comboBonus > 0 ? `+${total} ×${d.combo}` : `+${total}`;
          d.flashes.push({ text: label, x: cx, y: cy, life: 1, color: d.combo >= 3 ? "#ff9900" : "#ffee44" });

          if (brick.type === BrickType.TOILET) d.shakeTimer = Math.max(d.shakeTimer, 10);
          if (d.combo >= 5)                    d.shakeTimer = Math.max(d.shakeTimer, 6);
        } else {
          d.score += ptsPerHit;
          if (d.score > d.highScore) d.highScore = d.score;
          spawnParticles(d.particles, cx, cy, "💦", 3, 0.8);
          d.flashes.push({ text: `+${ptsPerHit}`, x: cx, y: cy - 6, life: 0.7, color: "#88ccff" });
        }

        hit = true;
        break;
      }
    }
  }

  // ─── Draw ───────────────────────────────────────────────────────────────────

  private draw(): void {
    const ctx = this.ctx;
    const d   = this.data;

    ctx.save();
    ctx.translate(d.shakeX, d.shakeY);

    // Background
    const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    grad.addColorStop(0, "#12002a");
    grad.addColorStop(1, "#0d0020");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Stars
    this.bgStars.forEach(s => {
      ctx.globalAlpha = s.a * 0.8;
      ctx.fillStyle   = "#ffffff";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    this.drawBricks(ctx, d);
    this.drawParticles(ctx, d);

    // Ball trail
    const ball = d.ball;
    ball.trail.forEach((t, i) => {
      ctx.globalAlpha = t.alpha;
      const trailR = ball.radius * (i / ball.trail.length);
      ctx.beginPath();
      ctx.arc(t.x, t.y, trailR, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${280 + i * 5}, 100%, 70%)`;
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    this.drawBall(ctx, ball);
    this.drawPaddle(ctx, d.paddle);

    // Flash messages
    d.flashes.forEach(f => {
      ctx.globalAlpha   = f.life;
      ctx.font          = "bold 14px 'Press Start 2P', monospace";
      ctx.fillStyle     = f.color;
      ctx.textAlign     = "center";
      ctx.shadowColor   = f.color;
      ctx.shadowBlur    = 10;
      ctx.fillText(f.text, f.x, f.y);
      ctx.shadowBlur = 0;
    });
    ctx.globalAlpha = 1;
    ctx.textAlign   = "left";

    drawHUD(ctx, d);

    // Hit value info
    const { poopHits, toiletHits } = getHitValues(d.level);
    ctx.font      = "7px 'Press Start 2P', monospace";
    ctx.fillStyle = "rgba(160,130,255,0.6)";
    ctx.textAlign = "left";
    ctx.fillText(`💩×${poopHits} 🚽×${toiletHits}`, 12, 44);

    // Launch hint
    if (this.state === GameState.BALL_LAUNCH) {
      ctx.globalAlpha = 0.8 + Math.sin(Date.now() / 300) * 0.2;
      ctx.font        = "9px 'Press Start 2P', monospace";
      ctx.fillStyle   = "#cbb8ff";
      ctx.textAlign   = "center";
      ctx.fillText("CLICK OR PRESS SPACE TO LAUNCH!", CANVAS_WIDTH / 2, CANVAS_HEIGHT - 14);
      ctx.globalAlpha = 1;
      ctx.textAlign   = "left";
    }

    ctx.restore();
  }

  private drawBricks(ctx: CanvasRenderingContext2D, d: GameData): void {
    for (const row of d.bricks) {
      for (const b of row) {
        if (b.opacity <= 0 && !b.alive) continue;

        const cx    = b.x + b.width / 2;
        const cy    = b.y + b.height / 2;
        const shake = b.shakeTimer > 0 ? randomRange(-2, 2) : 0;
        const scale = b.alive ? 1 : b.scaleAnim;

        ctx.save();
        ctx.translate(cx + shake, cy);
        ctx.scale(scale, scale);
        ctx.globalAlpha = b.alive ? 1 : b.opacity;

        if (b.alive) {
          const hpRatio   = b.hits / b.maxHits;
          const isDamaged = b.hits < b.maxHits;

          const hue = b.type === BrickType.TOILET
            ? lerp(0, 210, hpRatio)
            : lerp(0, 30,  hpRatio);

          const glowColor = b.type === BrickType.TOILET
            ? `hsla(${hue}, 80%, 60%, 0.35)`
            : `hsla(${hue}, 70%, 50%, 0.35)`;

          ctx.shadowColor = glowColor;
          ctx.shadowBlur  = isDamaged ? 18 : 8;

          const bw = b.width;
          const bh = b.height;
          const panelGrad = ctx.createLinearGradient(-bw/2, -bh/2, -bw/2, bh/2);

          if (b.type === BrickType.TOILET) {
            const alpha = 0.4 + hpRatio * 0.4;
            panelGrad.addColorStop(0, `hsla(${hue}, 70%, 65%, ${alpha})`);
            panelGrad.addColorStop(1, `hsla(${hue}, 80%, 35%, ${alpha})`);
          } else {
            const alpha = 0.4 + hpRatio * 0.4;
            panelGrad.addColorStop(0, `hsla(${hue}, 60%, 55%, ${alpha})`);
            panelGrad.addColorStop(1, `hsla(${hue}, 70%, 30%, ${alpha})`);
          }

          ctx.fillStyle = panelGrad;
          ctx.beginPath();
          ctx.roundRect(-bw/2, -bh/2, bw, bh, 6);
          ctx.fill();

          ctx.strokeStyle = `hsla(${hue}, 70%, 70%, ${isDamaged ? 0.9 : 0.5})`;
          ctx.lineWidth   = isDamaged ? 2 : 1.5;
          ctx.stroke();

          if (isDamaged) {
            const crackCount = Math.ceil((1 - hpRatio) * 3);
            ctx.strokeStyle = "rgba(255, 80, 80, 0.5)";
            ctx.lineWidth   = 1;
            for (let i = 0; i < crackCount; i++) {
              const ox = (i - crackCount / 2) * (bw * 0.25);
              ctx.beginPath();
              ctx.moveTo(ox - 3, -bh/2 + 4);
              ctx.lineTo(ox + 2, 0);
              ctx.lineTo(ox - 1,  bh/2 - 4);
              ctx.stroke();
            }
          }

          ctx.shadowBlur = 0;
        }

        const emojiSize = Math.floor(b.height * 0.80);
        const emoji     = b.type === BrickType.TOILET ? "🚽" : "💩";
        const ec        = getEmojiCanvas(emoji, emojiSize);
        ctx.drawImage(ec, -emojiSize/2, -emojiSize/2, emojiSize, emojiSize);

        if (b.alive && b.maxHits > 1) {
          const hpRatio    = b.hits / b.maxHits;
          const badgeColor = hpRatio > 0.6 ? "#aaffcc"
                           : hpRatio > 0.3 ? "#ffdd66"
                           : "#ff6666";
          ctx.font      = `bold 8px 'Press Start 2P', monospace`;
          ctx.fillStyle = badgeColor;
          ctx.textAlign = "right";
          ctx.fillText(`${b.hits}`, b.width/2 - 2, b.height/2 - 2);
          ctx.textAlign = "left";
        }

        ctx.restore();
      }
    }
  }

  private drawBall(ctx: CanvasRenderingContext2D, ball: Ball): void {
    ctx.save();
    ctx.shadowColor = "#cc88ff";
    ctx.shadowBlur  = 20;

    const outerGrad = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, ball.radius * 2);
    outerGrad.addColorStop(0, "rgba(200,120,255,0.3)");
    outerGrad.addColorStop(1, "rgba(200,120,255,0)");
    ctx.fillStyle = outerGrad;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius * 2, 0, Math.PI * 2);
    ctx.fill();

    const grad = ctx.createRadialGradient(
      ball.x - ball.radius * 0.3, ball.y - ball.radius * 0.3, 1,
      ball.x, ball.y, ball.radius
    );
    grad.addColorStop(0,   "#ffffff");
    grad.addColorStop(0.4, "#dd88ff");
    grad.addColorStop(1,   "#8800dd");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  private drawPaddle(ctx: CanvasRenderingContext2D, paddle: Paddle): void {
    ctx.save();
    const { x, y, width, height } = paddle;

    ctx.shadowColor = "#aa66ff";
    ctx.shadowBlur  = 22;

    const grad = ctx.createLinearGradient(x, y, x, y + height);
    grad.addColorStop(0,   "#cc88ff");
    grad.addColorStop(0.5, "#9944dd");
    grad.addColorStop(1,   "#6600bb");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, height / 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.beginPath();
    ctx.roundRect(x + 8, y + 3, width - 16, height * 0.38, 4);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  private drawParticles(ctx: CanvasRenderingContext2D, d: GameData): void {
    d.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha    = Math.max(0, p.life);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.font          = `${p.size}px serif`;
      ctx.textAlign     = "center";
      ctx.textBaseline  = "middle";
      ctx.fillText(p.emoji, 0, 0);
      ctx.restore();
    });
    ctx.textAlign    = "left";
    ctx.textBaseline = "alphabetic";
  }
}
