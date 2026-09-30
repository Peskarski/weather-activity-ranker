import type { MarineStatus, WeekWeather } from "../openMeteo/index.ts";
import { indoorSightseeing, outdoorSightseeing, skiing, surfing } from "./activities/index.ts";
import { scoreDay } from "./engine.ts";
import { whole } from "./format.ts";
import { toLabel } from "./labels.ts";
import type { Activity, ActivityModel, ActivityRanking, DayScore } from "./types.ts";

const TOP_DAYS = 3;
const MARINE_NOTE_FROM_KM = 5;
const ACTIVITY_ORDER: Activity[] = [
  "OUTDOOR_SIGHTSEEING",
  "INDOOR_SIGHTSEEING",
  "SURFING",
  "SKIING",
];

const mostCommon = (values: string[]) => {
  const counts = new Map<string, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
};

const weekReasonFor = (model: ActivityModel, days: DayScore[]) => {
  const gateId = mostCommon(days.flatMap(({ gateId }) => (gateId ? [gateId] : [])));
  return model.gates.find(({ id }) => id === gateId)?.weekReason ?? "Not possible this week";
};

export const summarize = (
  activity: Activity,
  days: DayScore[],
  unavailableReason: () => string,
  note: string | null = null,
): ActivityRanking => {
  const possibleDays = days.filter(({ label }) => label !== "NOT_POSSIBLE");

  if (possibleDays.length === 0) {
    return {
      activity,
      available: false,
      unavailableReason: unavailableReason(),
      note,
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
    note,
    weekScore,
    weekLabel: toLabel(weekScore),
    bestDay: topDays[0].date,
    days,
  };
};

const marineProblem = (marine: MarineStatus) => {
  switch (marine.status) {
    case "NO_COAST":
      return "No coast within about 25 km";
    case "UNAVAILABLE":
      return "Wave forecast is temporarily unavailable";
    case "AVAILABLE":
      return null;
  }
};

const rankSurfing = ({ days, marine }: WeekWeather): ActivityRanking => {
  const problem = marineProblem(marine);
  if (problem) {
    const gatedDays: DayScore[] = days.map(({ date }) => ({
      date,
      score: 0,
      label: "NOT_POSSIBLE",
      reasons: [{ text: problem, impact: "NEGATIVE" }],
      gateId: "NO_WAVE_DATA",
    }));
    return summarize("SURFING", gatedDays, () => problem);
  }

  const scored = days.map((day) => scoreDay(surfing, day));
  const note =
    marine.status === "AVAILABLE" && marine.distanceKm >= MARINE_NOTE_FROM_KM
      ? `Waves forecast about ${whole(marine.distanceKm)} km from the city centre`
      : null;
  return summarize("SURFING", scored, () => weekReasonFor(surfing, scored), note);
};

const byRank = (a: ActivityRanking, b: ActivityRanking) =>
  Number(b.available) - Number(a.available) ||
  (b.weekScore ?? 0) - (a.weekScore ?? 0) ||
  ACTIVITY_ORDER.indexOf(a.activity) - ACTIVITY_ORDER.indexOf(b.activity);

export const rankActivities = (week: WeekWeather): ActivityRanking[] => {
  const skiingDays = week.days.map((day) => scoreDay(skiing, day));
  const outdoorDays = week.days.map((day) => scoreDay(outdoorSightseeing, day));
  const indoorDays = week.days.map((day, index) => indoorSightseeing(day, outdoorDays[index]));

  return [
    summarize("SKIING", skiingDays, () => weekReasonFor(skiing, skiingDays)),
    rankSurfing(week),
    summarize("OUTDOOR_SIGHTSEEING", outdoorDays, () => "Not possible this week"),
    summarize("INDOOR_SIGHTSEEING", indoorDays, () => "Not possible this week"),
  ].sort(byRank);
};
