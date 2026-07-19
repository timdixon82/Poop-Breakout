import { afterEach, describe, expect, it, vi } from "vitest";
import { clamp, lerp, normalizeVec2, randomInt, randomRange, vec2Length } from "../src/utils";

describe("clamp", () => {
  it("returns the value unchanged when it is within bounds", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("clamps to the minimum when the value is below it", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it("clamps to the maximum when the value is above it", () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it("treats an exact boundary value as within bounds", () => {
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });
});

describe("lerp", () => {
  it("returns the start value at t=0", () => {
    expect(lerp(10, 20, 0)).toBe(10);
  });

  it("returns the end value at t=1", () => {
    expect(lerp(10, 20, 1)).toBe(20);
  });

  it("returns the midpoint at t=0.5", () => {
    expect(lerp(10, 20, 0.5)).toBe(15);
  });
});

describe("vec2Length", () => {
  it("computes the length of a 3-4-5 triangle vector", () => {
    expect(vec2Length(3, 4)).toBe(5);
  });

  it("is zero for a zero vector", () => {
    expect(vec2Length(0, 0)).toBe(0);
  });
});

describe("normalizeVec2", () => {
  it("returns a straight-up unit vector for a zero-length input", () => {
    expect(normalizeVec2(0, 0)).toEqual([0, -1]);
  });

  it("scales a vector to unit length while preserving direction", () => {
    const [nx, ny] = normalizeVec2(3, 4);
    expect(vec2Length(nx, ny)).toBeCloseTo(1, 10);
    // Direction preserved: original x:y ratio should match normalized x:y ratio.
    expect(nx / ny).toBeCloseTo(3 / 4, 10);
  });
});

describe("randomRange / randomInt", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("randomRange maps Math.random's [0,1) output linearly onto [min, max)", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(randomRange(10, 20)).toBe(10);

    vi.spyOn(Math, "random").mockReturnValue(0.5);
    expect(randomRange(10, 20)).toBe(15);
  });

  it("randomInt is inclusive of both min and max", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(randomInt(1, 6)).toBe(1);

    // Math.random() just under 1 should floor down to the max, never above it.
    vi.spyOn(Math, "random").mockReturnValue(0.999999);
    expect(randomInt(1, 6)).toBe(6);
  });

  it("randomInt never exceeds the requested bounds across many samples", () => {
    for (let i = 0; i < 200; i++) {
      const n = randomInt(1, 6);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(6);
      expect(Number.isInteger(n)).toBe(true);
    }
  });
});
