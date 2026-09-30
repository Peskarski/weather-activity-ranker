import type { MarineStatus, WeekWeather } from "../openMeteo/index.ts";
import { indoorSightseeing, outdoorSightseeing, skiing, surfing } from "./activities/index.ts";
import { scoreDay } from "./engine.ts";
import { toLabel } from "./labels.ts";
import type { Activity, ActivityRanking, DayScore, ReasonCode } from "./types.ts";

const TOP_DAYS = 3;
const ACTIVITY_ORDER: Activity[] = [
  "OUTDOOR_SIGHTSEEING",
  "INDOOR_SIGHTSEEING",
  "SURFING",
  "SKIING",
];

const mostCommon = <T>(values: T[]) => {
  const counts = new Map<T, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
};

const mostCommonBlocker = (days: DayScore[]) =>
  mostCommon(days.flatMap(({ reasons }) => (reasons[0] ? [reasons[0].code] : [])));

export const summarize = (
  activity: Activity,
  days: DayScore[],
  waveForecastDistanceKm: number | null = null,
): ActivityRanking => {
  const possibleDays = days.filter(({ label }) => label !== "NOT_POSSIBLE");

  if (possibleDays.length === 0) {
    return {
      activity,
      available: false,
      unavailableReason: mostCommonBlocker(days),
      waveForecastDistanceKm,
      weekScore: null,
      weekLabel: "NOT_POSSIBLE",
      bestDay: null,
      days,
    };
  }

  const topDays = [...days].sort((a, b) => b.score - a.score).slice(0, TOP_DAYS);
  const weekScore = Math.round(topDays.reduce((sum, { score }) => sum + score, 0) / topDays.length);

  return {
    activity,
    available: true,
    unavailableReason: null,
    waveForecastDistanceKm,
    weekScore,
    weekLabel: toLabel(weekScore),
    bestDay: topDays[0].date,
    days,
  };
};

const MARINE_BLOCKERS: Record<Exclude<MarineStatus["status"], "AVAILABLE">, ReasonCode> = {
  NO_COAST: "NO_COAST",
  UNAVAILABLE: "MARINE_UNAVAILABLE",
};

const rankSurfing = ({ days, marine }: WeekWeather): ActivityRanking => {
  if (marine.status !== "AVAILABLE") {
    const code = MARINE_BLOCKERS[marine.status];
    const blockedDays = days.map(({ date }): DayScore => ({
      date,
      score: 0,
      label: "NOT_POSSIBLE",
      reasons: [{ code, impact: "NEGATIVE", value: null }],
    }));
    return summarize("SURFING", blockedDays);
  }

  return summarize(
    "SURFING",
    days.map((day) => scoreDay(surfing, day)),
    marine.distanceKm,
  );
};

const byRank = (a: ActivityRanking, b: ActivityRanking) =>
  Number(b.available) - Number(a.available) ||
  (b.weekScore ?? 0) - (a.weekScore ?? 0) ||
  ACTIVITY_ORDER.indexOf(a.activity) - ACTIVITY_ORDER.indexOf(b.activity);

export const rankActivities = (week: WeekWeather): ActivityRanking[] => {
  const outdoorDays = week.days.map((day) => scoreDay(outdoorSightseeing, day));
  const indoorDays = week.days.map((day, index) => indoorSightseeing(day, outdoorDays[index]));

  return [
    summarize(
      "SKIING",
      week.days.map((day) => scoreDay(skiing, day)),
    ),
    rankSurfing(week),
    summarize("OUTDOOR_SIGHTSEEING", outdoorDays),
    summarize("INDOOR_SIGHTSEEING", indoorDays),
  ].sort(byRank);
};
