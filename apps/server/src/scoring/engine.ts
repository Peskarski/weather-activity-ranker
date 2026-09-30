import type { DayWeather } from "../openMeteo/index.ts";
import { interpolate } from "./curve.ts";
import { toLabel } from "./labels.ts";
import type { ActivityModel, DayScore, Factor, Impact, Reason } from "./types.ts";

const MAX_REASONS = 3;
const NEGATIVE_BELOW = 0.5;
const POSITIVE_FROM = 0.8;

type EvaluatedFactor = { factor: Factor; value: number; quality: number };

const evaluate = (factors: readonly Factor[], day: DayWeather): EvaluatedFactor[] =>
  factors.flatMap((factor) => {
    const value = factor.value(day);
    return value === null ? [] : [{ factor, value, quality: interpolate(factor.curve, value) }];
  });

const weightedScore = (evaluated: EvaluatedFactor[]) => {
  const totalWeight = evaluated.reduce((sum, { factor }) => sum + factor.weight, 0);
  if (totalWeight === 0) {
    return 0;
  }
  const weighted = evaluated.reduce((sum, { factor, quality }) => sum + factor.weight * quality, 0);
  return Math.round((100 * weighted) / totalWeight);
};

const factorReasons = (evaluated: EvaluatedFactor[]): Reason[] => {
  const toReason =
    (impact: Impact) =>
    ({ factor, value }: EvaluatedFactor): Reason => ({ code: factor.code, impact, value });

  const negatives = evaluated
    .filter(({ quality }) => quality < NEGATIVE_BELOW)
    .sort((a, b) => b.factor.weight * (1 - b.quality) - a.factor.weight * (1 - a.quality))
    .map(toReason("NEGATIVE"));

  const positives = evaluated
    .filter(({ quality }) => quality >= POSITIVE_FROM)
    .sort((a, b) => b.factor.weight * b.quality - a.factor.weight * a.quality)
    .map(toReason("POSITIVE"));

  return [...negatives, ...positives];
};

export const scoreDay = (model: ActivityModel, day: DayWeather): DayScore => {
  const gate = model.gates.find(({ when }) => when(day));
  if (gate) {
    return {
      date: day.date,
      score: 0,
      label: "NOT_POSSIBLE",
      reasons: [{ code: gate.code, impact: "NEGATIVE", value: gate.value?.(day) ?? null }],
    };
  }

  const evaluated = evaluate(model.factors, day);
  const activeCaps = model.caps.filter(({ when }) => when(day));
  const score = Math.min(weightedScore(evaluated), ...activeCaps.map(({ maxScore }) => maxScore));
  const capReasons = activeCaps.map((cap): Reason => ({
    code: cap.code,
    impact: "NEGATIVE",
    value: cap.value?.(day) ?? null,
  }));
  const replacedFactors = new Set(activeCaps.map(({ replacesFactor }) => replacesFactor));
  const explainedFactors = evaluated.filter(({ factor }) => !replacedFactors.has(factor.code));

  return {
    date: day.date,
    score,
    label: toLabel(score),
    reasons: [...capReasons, ...factorReasons(explainedFactors)].slice(0, MAX_REASONS),
  };
};
