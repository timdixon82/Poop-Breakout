import { describe, expect, it } from "vitest";
import {
  allBricksCleared,
  checkBrickCollision,
  checkPaddleCollision,
  computeBrickHitScore,
  isFinalLevel,
  loseLife,
  resolveWallBounce,
} from "../src/physics";

// ─── resolveWallBounce ────────────────────────────────────────────────────────

describe("resolveWallBounce", () => {
  const CANVAS_WIDTH = 800;
  const TOP_BOUND = 48;

  it("leaves position and velocity unchanged when not touching a wall", () => {
    const ball = { x: 400, y: 300, dx: 3, dy: -4, radius: 9 };
    const result = resolveWallBounce(ball, CANVAS_WIDTH, TOP_BOUND);
    expect(result).toEqual({ x: 400, y: 300, dx: 3, dy: -4 });
  });

  it("bounces off the left wall: clamps x to the radius and reverses dx to positive", () => {
    const ball = { x: 2, y: 300, dx: -5, dy: 1, radius: 9 };
    const result = resolveWallBounce(ball, CANVAS_WIDTH, TOP_BOUND);
    expect(result.x).toBe(9);
    expect(result.dx).toBe(5);
    expect(result.dy).toBe(1);
  });

  it("bounces off the right wall: clamps x to width minus radius and reverses dx to negative", () => {
    const ball = { x: 795, y: 300, dx: 5, dy: 1, radius: 9 };
    const result = resolveWallBounce(ball, CANVAS_WIDTH, TOP_BOUND);
    expect(result.x).toBe(CANVAS_WIDTH - 9);
    expect(result.dx).toBe(-5);
  });

  it("bounces off the top wall: clamps y to the bound plus radius and reverses dy to positive", () => {
    const ball = { x: 400, y: 40, dx: 1, dy: -6, radius: 9 };
    const result = resolveWallBounce(ball, CANVAS_WIDTH, TOP_BOUND);
    expect(result.y).toBe(TOP_BOUND + 9);
    expect(result.dy).toBe(6);
  });
});

// ─── checkPaddleCollision ─────────────────────────────────────────────────────

describe("checkPaddleCollision", () => {
  const paddle = { x: 350, y: 600, width: 110, height: 14 };

  it("returns null when the ball is moving upward (dy <= 0)", () => {
    const ball = { x: 405, y: 600, dx: 0, dy: -3, radius: 9 };
    expect(checkPaddleCollision(ball, paddle)).toBeNull();
  });

  it("returns null when the ball is nowhere near the paddle", () => {
    const ball = { x: 405, y: 100, dx: 0, dy: 5, radius: 9 };
    expect(checkPaddleCollision(ball, paddle)).toBeNull();
  });

  it("bounces straight up when the ball hits dead centre", () => {
    // paddle centre x = 350 + 55 = 405
    const ball = { x: 405, y: 605, dx: 0, dy: 5, radius: 9 };
    const result = checkPaddleCollision(ball, paddle);
    expect(result).not.toBeNull();
    expect(result!.y).toBe(paddle.y - ball.radius);
    expect(result!.dx).toBeCloseTo(0, 10);
    expect(result!.dy).toBeCloseTo(-5, 10);
  });

  it("bounces left when the ball hits the left edge of the paddle", () => {
    // hitRatio = -1 at ball.x === paddle.x
    const ball = { x: paddle.x, y: 605, dx: 0, dy: 5, radius: 9 };
    const result = checkPaddleCollision(ball, paddle);
    expect(result).not.toBeNull();
    expect(result!.dx).toBeLessThan(0);
    expect(result!.dy).toBeLessThan(0);
  });

  it("bounces right when the ball hits the right edge of the paddle", () => {
    // hitRatio = 1 at ball.x === paddle.x + paddle.width
    const ball = { x: paddle.x + paddle.width, y: 605, dx: 0, dy: 5, radius: 9 };
    const result = checkPaddleCollision(ball, paddle);
    expect(result).not.toBeNull();
    expect(result!.dx).toBeGreaterThan(0);
    expect(result!.dy).toBeLessThan(0);
  });

  it("preserves ball speed through the bounce", () => {
    const ball = { x: paddle.x + 20, y: 605, dx: 2, dy: 6, radius: 9 };
    const speedBefore = Math.hypot(ball.dx, ball.dy);
    const result = checkPaddleCollision(ball, paddle)!;
    const speedAfter = Math.hypot(result.dx, result.dy);
    expect(speedAfter).toBeCloseTo(speedBefore, 10);
  });
});

// ─── checkBrickCollision ──────────────────────────────────────────────────────

describe("checkBrickCollision", () => {
  const brick = { x: 100, y: 100, width: 60, height: 40 };

  it("returns null when the ball is far from the brick", () => {
    const ball = { x: 0, y: 0, dx: 1, dy: 1, radius: 9 };
    expect(checkBrickCollision(ball, brick)).toBeNull();
  });

  it("registers a collision from directly above and bounces the ball upward", () => {
    // Ball centre sits just inside the brick's top edge.
    const ball = { x: 130, y: 105, dx: 2, dy: 5, radius: 9 };
    const result = checkBrickCollision(ball, brick);
    expect(result).not.toBeNull();
    expect(result!.side).toBe("top");
    expect(result!.dy).toBeLessThan(0);
    expect(result!.y).toBe(brick.y - ball.radius);
  });

  it("registers a collision from directly below and bounces the ball downward", () => {
    const ball = { x: 130, y: 135, dx: 2, dy: -5, radius: 9 };
    const result = checkBrickCollision(ball, brick);
    expect(result).not.toBeNull();
    expect(result!.side).toBe("bottom");
    expect(result!.dy).toBeGreaterThan(0);
    expect(result!.y).toBe(brick.y + brick.height + ball.radius);
  });

  it("registers a collision from the left and bounces the ball leftward", () => {
    const ball = { x: 105, y: 120, dx: 5, dy: 1, radius: 9 };
    const result = checkBrickCollision(ball, brick);
    expect(result).not.toBeNull();
    expect(result!.side).toBe("left");
    expect(result!.dx).toBeLessThan(0);
    expect(result!.x).toBe(brick.x - ball.radius);
  });

  it("registers a collision from the right and bounces the ball rightward", () => {
    const ball = { x: 155, y: 120, dx: -5, dy: 1, radius: 9 };
    const result = checkBrickCollision(ball, brick);
    expect(result).not.toBeNull();
    expect(result!.side).toBe("right");
    expect(result!.dx).toBeGreaterThan(0);
    expect(result!.x).toBe(brick.x + brick.width + ball.radius);
  });

  it("does not register a collision when the ball's circle only just misses the brick", () => {
    // One unit further away than the radius allows.
    const ball = { x: 100 - 9 - 1, y: 120, dx: 5, dy: 0, radius: 9 };
    expect(checkBrickCollision(ball, brick)).toBeNull();
  });
});

// ─── computeBrickHitScore ─────────────────────────────────────────────────────

describe("computeBrickHitScore", () => {
  it("awards no combo bonus when there is no combo yet", () => {
    const result = computeBrickHitScore(10, 0);
    expect(result).toEqual({ comboBonus: 0, total: 10 });
  });

  it("adds a combo bonus proportional to the current combo count", () => {
    // 10 * (10 * 0.15) = 15
    const result = computeBrickHitScore(10, 10);
    expect(result.comboBonus).toBe(15);
    expect(result.total).toBe(25);
  });

  it("uses toilet-brick point values the same way as poop-brick values", () => {
    // 20 * (5 * 0.15) = 15
    const result = computeBrickHitScore(20, 5);
    expect(result.comboBonus).toBe(15);
    expect(result.total).toBe(35);
  });
});

// ─── allBricksCleared ─────────────────────────────────────────────────────────

describe("allBricksCleared", () => {
  it("is true when every brick is dead", () => {
    const bricks = [
      [{ alive: false }, { alive: false }],
      [{ alive: false }, { alive: false }],
    ];
    expect(allBricksCleared(bricks)).toBe(true);
  });

  it("is false when at least one brick is still alive", () => {
    const bricks = [
      [{ alive: false }, { alive: true }],
      [{ alive: false }, { alive: false }],
    ];
    expect(allBricksCleared(bricks)).toBe(false);
  });

  it("is true for an empty grid", () => {
    expect(allBricksCleared([])).toBe(true);
  });
});

// ─── isFinalLevel ─────────────────────────────────────────────────────────────

describe("isFinalLevel", () => {
  it("is false before the last level", () => {
    expect(isFinalLevel(99, 100)).toBe(false);
  });

  it("is true on the last level", () => {
    expect(isFinalLevel(100, 100)).toBe(true);
  });

  it("is true beyond the last level (defensive)", () => {
    expect(isFinalLevel(101, 100)).toBe(true);
  });
});

// ─── loseLife ─────────────────────────────────────────────────────────────────

describe("loseLife", () => {
  it("decrements lives and does not end the game while lives remain", () => {
    expect(loseLife(3)).toEqual({ lives: 2, gameOver: false });
  });

  it("ends the game when the last life is lost", () => {
    expect(loseLife(1)).toEqual({ lives: 0, gameOver: true });
  });

  it("never goes below zero lives (defensive)", () => {
    expect(loseLife(0)).toEqual({ lives: 0, gameOver: true });
  });
});
