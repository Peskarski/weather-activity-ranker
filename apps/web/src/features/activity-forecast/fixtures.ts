import { type ActivityForecast, type ActivityRanking, type DayScore } from "./types";

const DATES = ["2026-10-01", "2026-10-02", "2026-10-03"];

export const makeDay = (overrides: Partial<DayScore> = {}): DayScore => ({
  date: DATES[0],
  score: 70,
  label: "GOOD",
  reasons: [],
  ...overrides,
});

export const SURFING: ActivityRanking = {
  activity: "SURFING",
  available: true,
  unavailableReason: null,
  waveForecastDistanceKm: 20.6,
  weekScore: 88,
  weekLabel: "GREAT",
  bestDay: DATES[1],
  days: [
    makeDay({
      date: DATES[0],
      score: 40,
      label: "FAIR",
      reasons: [{ code: "WIND", impact: "NEGATIVE", value: 32 }],
    }),
    makeDay({
      date: DATES[1],
      score: 95,
      label: "GREAT",
      reasons: [{ code: "WAVE_HEIGHT", impact: "POSITIVE", value: 1.8 }],
    }),
    makeDay({
      date: DATES[2],
      score: 0,
      label: "NOT_POSSIBLE",
      reasons: [{ code: "FLAT", impact: "NEGATIVE", value: 0.2 }],
    }),
  ],
};

export const SKIING: ActivityRanking = {
  activity: "SKIING",
  available: false,
  unavailableReason: "NO_SNOW",
  waveForecastDistanceKm: null,
  weekScore: null,
  weekLabel: "NOT_POSSIBLE",
  bestDay: null,
  days: DATES.map((date) =>
    makeDay({
      date,
      score: 0,
      label: "NOT_POSSIBLE",
      reasons: [{ code: "NO_SNOW", impact: "NEGATIVE", value: 0 }],
    }),
  ),
};

export const FORECAST: ActivityForecast = {
  place: {
    id: "1",
    name: "Biarritz",
    region: "New Aquitaine",
    country: "France",
    countryCode: "FR",
  },
  activities: [SURFING, SKIING],
};
