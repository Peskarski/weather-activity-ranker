import type { DayWeather } from "../../openMeteo/index.ts";
import { toLabel } from "../labels.ts";
import { whole } from "../format.ts";
import type { DayScore, Reason } from "../types.ts";

const BASE_SCORE = 40;
const OUTDOOR_INFLUENCE = 0.65;
const HAZARD_PENALTY = 20;
const HEAVY_SNOW_CM = 10;
const STRONG_GUSTS_KMH = 70;
const BAD_OUTDOOR_BELOW = 50;
const GOOD_OUTDOOR_FROM = 70;
const MAX_REASONS = 3;

const travelHazards = ({ snowfallSum, windGustsMax }: DayWeather): Reason[] => [
  ...((snowfallSum ?? 0) >= HEAVY_SNOW_CM
    ? [{ text: `${whole(snowfallSum ?? 0)} cm of snow, getting around may be hard`, impact: "NEGATIVE" as const }]
    : []),
  ...((windGustsMax ?? 0) >= STRONG_GUSTS_KMH
    ? [{ text: `Gusts up to ${whole(windGustsMax ?? 0)} km/h, getting around may be hard`, impact: "NEGATIVE" as const }]
    : []),
];

const outdoorContext = (outdoor: DayScore): Reason[] => {
  if (outdoor.score >= GOOD_OUTDOOR_FROM) {
    return [{ text: "Great weather outside, better spent outdoors", impact: "NEGATIVE" }];
  }

  const badWeather = outdoor.reasons
    .filter(({ impact }) => impact === "NEGATIVE")
    .map(({ text }) => ({ text, impact: "POSITIVE" as const }));

  return outdoor.score < BAD_OUTDOOR_BELOW
    ? [{ text: "Poor weather outside, a good day to be indoors", impact: "POSITIVE" }, ...badWeather]
    : badWeather;
};

export const indoorSightseeing = (day: DayWeather, outdoor: DayScore): DayScore => {
  const hazards = travelHazards(day);
  const hazardPenalty = hazards.length > 0 ? HAZARD_PENALTY : 0;
  const baseScore = Math.min(100, BASE_SCORE + OUTDOOR_INFLUENCE * (100 - outdoor.score));
  const score = Math.max(0, Math.round(baseScore) - hazardPenalty);

  return {
    date: day.date,
    score,
    label: toLabel(score),
    reasons: [...hazards, ...outdoorContext(outdoor)].slice(0, MAX_REASONS),
    gateId: null,
  };
};
