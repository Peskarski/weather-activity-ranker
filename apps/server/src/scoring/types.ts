import type { DayWeather } from "../openMeteo/index.ts";

export type Activity = "SKIING" | "SURFING" | "OUTDOOR_SIGHTSEEING" | "INDOOR_SIGHTSEEING";

export type ScoreLabel = "GREAT" | "GOOD" | "FAIR" | "POOR" | "NOT_POSSIBLE";

export type Impact = "POSITIVE" | "NEGATIVE";

export type Reason = { text: string; impact: Impact };

export type CurvePoint = readonly [value: number, quality: number];

export type Factor = {
  id: string;
  weight: number;
  value: (day: DayWeather) => number | null;
  curve: readonly CurvePoint[];
  describe: (value: number) => string;
};

export type Gate = {
  id: string;
  when: (day: DayWeather) => boolean;
  reason: (day: DayWeather) => string;
  weekReason: string;
};

export type Cap = {
  replacesFactor?: string;
  when: (day: DayWeather) => boolean;
  maxScore: number;
  reason: (day: DayWeather) => string;
};

export type ActivityModel = {
  activity: Activity;
  gates: readonly Gate[];
  factors: readonly Factor[];
  caps: readonly Cap[];
};

export type DayScore = {
  date: string;
  score: number;
  label: ScoreLabel;
  reasons: Reason[];
  gateId: string | null;
};

export type ActivityRanking = {
  activity: Activity;
  available: boolean;
  unavailableReason: string | null;
  note: string | null;
  weekScore: number | null;
  weekLabel: ScoreLabel;
  bestDay: string | null;
  days: DayScore[];
};
