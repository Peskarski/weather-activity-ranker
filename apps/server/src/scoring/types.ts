import type { DayWeather } from "../openMeteo/index.ts";

export type Activity = "SKIING" | "SURFING" | "OUTDOOR_SIGHTSEEING" | "INDOOR_SIGHTSEEING";

export type ScoreLabel = "GREAT" | "GOOD" | "FAIR" | "POOR" | "NOT_POSSIBLE";

export type Impact = "POSITIVE" | "NEGATIVE";

export type ReasonCode =
  | "NO_SNOW"
  | "LIFTS_CLOSED"
  | "THUNDERSTORM"
  | "NO_COAST"
  | "MARINE_UNAVAILABLE"
  | "NO_WAVE_DATA"
  | "FLAT"
  | "TOO_BIG"
  | "SLUSH"
  | "HEAVY_RAIN"
  | "STRONG_GUSTS"
  | "HEAVY_SNOW"
  | "BAD_WEATHER_OUTSIDE"
  | "GOOD_WEATHER_OUTSIDE"
  | "SNOW_DEPTH"
  | "FRESH_SNOW"
  | "TEMPERATURE"
  | "FEELS_LIKE"
  | "GUSTS"
  | "WIND"
  | "VISIBILITY"
  | "SUNSHINE"
  | "PRECIPITATION"
  | "PRECIPITATION_PROBABILITY"
  | "WAVE_HEIGHT"
  | "SWELL_PERIOD";

export type Reason = { code: ReasonCode; impact: Impact; value: number | null };

export type CurvePoint = readonly [value: number, quality: number];

type Measure = (day: DayWeather) => number | null;

export type Factor = {
  code: ReasonCode;
  weight: number;
  value: Measure;
  curve: readonly CurvePoint[];
};

export type Gate = {
  code: ReasonCode;
  when: (day: DayWeather) => boolean;
  value?: Measure;
};

export type Cap = {
  code: ReasonCode;
  when: (day: DayWeather) => boolean;
  maxScore: number;
  value?: Measure;
  replacesFactor?: ReasonCode;
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
};

export type ActivityRanking = {
  activity: Activity;
  available: boolean;
  unavailableReason: ReasonCode | null;
  waveForecastDistanceKm: number | null;
  weekScore: number | null;
  weekLabel: ScoreLabel;
  bestDay: string | null;
  days: DayScore[];
};
