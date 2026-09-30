import { describe, expect, it } from "vitest";
import { interpolate } from "./curve.ts";

const CURVE = [
  [0, 0],
  [10, 1],
  [20, 0.5],
] as const;

describe("interpolate", () => {
  it.each([
    [-5, 0],
    [0, 0],
    [5, 0.5],
    [10, 1],
    [15, 0.75],
    [20, 0.5],
    [100, 0.5],
  ])("maps %d to %d", (value, expected) => {
    expect(interpolate(CURVE, value)).toBeCloseTo(expected);
  });
});
