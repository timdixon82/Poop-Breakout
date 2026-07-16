
// ─── Pure game-logic functions ────────────────────────────────────────────────
//
// Extracted from game.ts so collision detection, scoring, and level/state
// transitions can be unit tested independently of canvas rendering and DOM
// event wiring. Each function here takes plain numbers/objects and returns a
// plain result — no side effects, no canvas, no document access.

import { clamp } from "./utils";

// ─── Shared shapes ────────────────────────────────────────────────────────────

export interface BallLike {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
}

export interface RectLike {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ─── Wall bounce ──────────────────────────────────────────────────────────────

export interface WallBounceResult {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

/**
 * Resolves ball collisions against the left, right, and top walls of the
 * play field. Returns the corrected position and velocity; does not mutate
 * the input.
 */
export function resolveWallBounce(
  ball: BallLike,
  canvasWidth: number,
  topBound: number
): WallBounceResult {
  let { x, y, dx, dy } = ball;

  if (x - ball.radius < 0) {
    x = ball.radius;
    dx = Math.abs(dx);
  }
  if (x + ball.radius > canvasWidth) {
    x = canvasWidth - ball.radius;
    dx = -Math.abs(dx);
  }
  if (y - ball.radius < topBound) {
    y = topBound + ball.radius;
    dy = Math.abs(dy);
  }

  return { x, y, dx, dy };
}

// ─── Paddle bounce ────────────────────────────────────────────────────────────

export interface PaddleBounceResult {
  y: number;
  dx: number;
  dy: number;
}

/**
 * Checks whether the ball is colliding with the paddle and, if so, returns
 * the bounce result (position and velocity). Returns null when there is no
 * collision. The bounce angle varies with where on the paddle the ball hit:
 * dead centre bounces straight up, the edges bounce at a shallower angle.
 */
export function checkPaddleCollision(
  ball: BallLike,
  paddle: RectLike
): PaddleBounceResult | null {
  const colliding =
    ball.dy > 0 &&
    ball.y + ball.radius >= paddle.y &&
    ball.y - ball.radius <= paddle.y + paddle.height &&
    ball.x >= paddle.x - ball.radius &&
    ball.x <= paddle.x + paddle.width + ball.radius;

  if (!colliding) return null;

  const y = paddle.y - ball.radius;
  const hitRatio = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
  const bounceAngle = hitRatio * (Math.PI / 3);
  const currentSpeed = Math.hypot(ball.dx, ball.dy);
  const dx = Math.sin(bounceAngle) * currentSpeed;
  const dy = -Math.abs(Math.cos(bounceAngle) * currentSpeed);

  return { y, dx, dy };
}

// ─── Brick collision ──────────────────────────────────────────────────────────

export type BrickHitSide = "left" | "right" | "top" | "bottom";

export interface BrickCollisionResult {
  side: BrickHitSide;
  x: number;
  y: number;
  dx: number;
  dy: number;
}

/**
 * Circle-vs-axis-aligned-rectangle collision between the ball and a single
 * brick. Returns null when the ball is not touching the brick. When it is,
 * returns which side was hit and the corrected ball position/velocity that
 * bounces the ball away from that side.
 */
export function checkBrickCollision(
  ball: BallLike,
  brick: RectLike
): BrickCollisionResult | null {
  const bLeft = brick.x;
  const bRight = brick.x + brick.width;
  const bTop = brick.y;
  const bBottom = brick.y + brick.height;

  const closestX = clamp(ball.x, bLeft, bRight);
  const closestY = clamp(ball.y, bTop, bBottom);
  const distX = ball.x - closestX;
  const distY = ball.y - closestY;
  const distSq = distX * distX + distY * distY;

  if (distSq > ball.radius * ball.radius) return null;

  const overlapLeft = ball.x + ball.radius - bLeft;
  const overlapRight = bRight - (ball.x - ball.radius);
  const overlapTop = ball.y + ball.radius - bTop;
  const overlapBottom = bBottom - (ball.y - ball.radius);
  const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

  let x = ball.x;
  let y = ball.y;
  let dx = ball.dx;
  let dy = ball.dy;
  let side: BrickHitSide;

  if (minOverlap === overlapLeft) {
    side = "left";
    dx = -Math.abs(ball.dx);
    x = bLeft - ball.radius;
  } else if (minOverlap === overlapRight) {
    side = "right";
    dx = Math.abs(ball.dx);
    x = bRight + ball.radius;
  } else if (minOverlap === overlapTop) {
    side = "top";
    dy = -Math.abs(ball.dy);
    y = bTop - ball.radius;
  } else {
    side = "bottom";
    dy = Math.abs(ball.dy);
    y = bBottom + ball.radius;
  }

  return { side, x, y, dx, dy };
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

export interface BrickHitScore {
  comboBonus: number;
  total: number;
}

/**
 * Computes the score awarded for destroying a brick, including the combo
 * bonus. The combo bonus grows with the current combo count.
 */
export function computeBrickHitScore(ptsPerHit: number, combo: number): BrickHitScore {
  const comboBonus = Math.floor(ptsPerHit * (combo * 0.15));
  const total = ptsPerHit + comboBonus;
  return { comboBonus, total };
}

// ─── Level / state transitions ───────────────────────────────────────────────

/**
 * True when every brick in the grid has been destroyed (alive === false),
 * meaning the level is clear.
 */
export function allBricksCleared(bricks: { alive: boolean }[][]): boolean {
  return !bricks.flat().some((b) => b.alive);
}

/**
 * True when the given level is the last level in the run.
 */
export function isFinalLevel(level: number, totalLevels: number): boolean {
  return level >= totalLevels;
}

export interface LoseLifeResult {
  lives: number;
  gameOver: boolean;
}

/**
 * Decrements the lives count after the ball falls off the bottom of the
 * play field. Lives never go below zero, and gameOver is true once they
 * reach zero.
 */
export function loseLife(lives: number): LoseLifeResult {
  const newLives = Math.max(0, lives - 1);
  return { lives: newLives, gameOver: newLives <= 0 };
}
