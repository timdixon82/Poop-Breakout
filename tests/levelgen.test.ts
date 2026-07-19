import { describe, expect, it } from "vitest";
import { BrickType } from "../src/definitions";
import { BRICK_COLS, BRICK_ROWS, TOTAL_LEVELS } from "../src/definitions";
import { generateLayout, getHitValues, getLevelSpeedMult } from "../src/levelgen";

// ─── getHitValues ─────────────────────────────────────────────────────────────

describe("getHitValues", () => {
  it("starts at 1 poop hit and 2 toilet hits on level 1", () => {
    expect(getHitValues(1)).toEqual({ poopHits: 1, toiletHits: 2 });
  });

  it("reaches 5 poop hits and 10 toilet hits on the final level", () => {
    expect(getHitValues(TOTAL_LEVELS)).toEqual({ poopHits: 5, toiletHits: 10 });
  });

  it("never decreases hit counts as the level increases", () => {
    let prev = getHitValues(1);
    for (let level = 2; level <= TOTAL_LEVELS; level++) {
      const current = getHitValues(level);
      expect(current.poopHits).toBeGreaterThanOrEqual(prev.poopHits);
      expect(current.toiletHits).toBeGreaterThanOrEqual(prev.toiletHits);
      prev = current;
    }
  });
});

// ─── getLevelSpeedMult ────────────────────────────────────────────────────────

describe("getLevelSpeedMult", () => {
  it("is 1.0 (no speed increase) on level 1", () => {
    expect(getLevelSpeedMult(1)).toBe(1);
  });

  it("doubles the base speed on the final level", () => {
    expect(getLevelSpeedMult(TOTAL_LEVELS)).toBe(2);
  });

  it("increases monotonically with level", () => {
    let prev = getLevelSpeedMult(1);
    for (let level = 2; level <= TOTAL_LEVELS; level++) {
      const current = getLevelSpeedMult(level);
      expect(current).toBeGreaterThanOrEqual(prev);
      prev = current;
    }
  });
});

// ─── generateLayout ───────────────────────────────────────────────────────────

describe("generateLayout", () => {
  it("produces a grid with the standard brick row and column count", () => {
    const layout = generateLayout(1);
    expect(layout.length).toBe(BRICK_ROWS);
    for (const row of layout) {
      expect(row.length).toBe(BRICK_COLS);
    }
  });

  it("only ever produces known brick types", () => {
    const validTypes = new Set(Object.values(BrickType));
    for (const level of [1, 20, 50, 80, 100]) {
      const layout = generateLayout(level);
      for (const row of layout) {
        for (const cell of row) {
          expect(validTypes.has(cell)).toBe(true);
        }
      }
    }
  });

  it("meets the minimum brick density the level design specifies for each phase", () => {
    // The game design guarantees a minimum fraction of filled cells that
    // rises from 40% on level 1 to 90% on the final level. This is checked
    // independently of the generator's internal implementation.
    const total = BRICK_ROWS * BRICK_COLS;
    for (const level of [1, 25, 50, 75, 100]) {
      const t = (level - 1) / (TOTAL_LEVELS - 1);
      const minDensity = 0.4 + t * 0.5;
      const layout = generateLayout(level);
      const filled = layout.flat().filter(cell => cell !== BrickType.EMPTY).length;
      expect(filled / total).toBeGreaterThanOrEqual(minDensity - 0.02);
    }
  });

  it("increases the proportion of toilet bricks relative to poop bricks on later levels", () => {
    // Run several samples per level since the shape fill uses randomness.
    const proportionToilet = (level: number): number => {
      const samples = 10;
      let toilet = 0;
      let total = 0;
      for (let i = 0; i < samples; i++) {
        const layout = generateLayout(level);
        for (const row of layout) {
          for (const cell of row) {
            if (cell === BrickType.EMPTY) continue;
            total++;
            if (cell === BrickType.TOILET) toilet++;
          }
        }
      }
      return total === 0 ? 0 : toilet / total;
    };

    const early = proportionToilet(1);
    const late = proportionToilet(100);
    expect(early).toBeLessThan(late);
  });
});
