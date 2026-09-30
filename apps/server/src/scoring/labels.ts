import type { ScoreLabel } from "./types.ts";

const LABEL_THRESHOLDS: readonly [minScore: number, label: ScoreLabel][] = [
  [80, "GREAT"],
  [60, "GOOD"],
  [40, "FAIR"],
];

export const toLabel = (score: number): ScoreLabel =>
  LABEL_THRESHOLDS.find(([minScore]) => score >= minScore)?.[1] ?? "POOR";
