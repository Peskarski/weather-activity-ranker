import { describe, expect, it } from "vitest";
import { makeWeek } from "./fixtures.ts";
import { rankActivities, summarize } from "./rankActivities.ts";
import type { DayScore, ReasonCode } from "./types.ts";

const dayScore = (date: string, score: number, blocker: ReasonCode = "FLAT"): DayScore => ({
  date,
  score,
  label: score > 0 ? "FAIR" : "NOT_POSSIBLE",
  reasons: score > 0 ? [] : [{ code: blocker, impact: "NEGATIVE", value: null }],
});

const SUMMER_CITY = makeWeek(Array(7).fill({}));

const SURF_DAY = { waveHeightMax: 1.8, swellPeriodMax: 12, windSpeedMax: 8 };

const find = (week: ReturnType<typeof makeWeek>, activity: string) =>
  rankActivities(week).find((ranking) => ranking.activity === activity);

describe("summarize", () => {
  it("scores the week as the mean of its best three days and picks the best day", () => {
    const days = [10, 90, 20, 70, 0, 80, 30].map((score, index) => dayScore(`d${index}`, score));

    expect(summarize("SURFING", days)).toMatchObject({
      available: true,
      unavailableReason: null,
      weekScore: 80,
      weekLabel: "GREAT",
      bestDay: "d1",
    });
  });

  it("marks the activity unavailable with the most common blocker of the week", () => {
    const blockers: ReasonCode[] = [
      "FLAT",
      "TOO_BIG",
      "FLAT",
      "THUNDERSTORM",
      "FLAT",
      "FLAT",
      "TOO_BIG",
    ];
    const days = blockers.map((code, index) => dayScore(`d${index}`, 0, code));

    expect(summarize("SURFING", days)).toMatchObject({
      available: false,
      unavailableReason: "FLAT",
      weekScore: null,
      weekLabel: "NOT_POSSIBLE",
      bestDay: null,
    });
  });
});

describe("rankActivities", () => {
  it("ranks available activities by weekly score and puts unavailable ones last", () => {
    expect(
      rankActivities(SUMMER_CITY).map(({ activity, available }) => [activity, available]),
    ).toEqual([
      ["OUTDOOR_SIGHTSEEING", true],
      ["INDOOR_SIGHTSEEING", true],
      ["SURFING", false],
      ["SKIING", false],
    ]);
  });

  it("explains why skiing is unavailable in summer", () => {
    expect(find(SUMMER_CITY, "SKIING")?.unavailableReason).toBe("NO_SNOW");
  });

  it("explains why surfing is unavailable inland, keeping all seven days", () => {
    const surfing = find(SUMMER_CITY, "SURFING");

    expect(surfing).toMatchObject({ available: false, unavailableReason: "NO_COAST" });
    expect(surfing?.days).toHaveLength(7);
  });

  it("distinguishes a marine service outage from having no coast", () => {
    const week = makeWeek(Array(7).fill(SURF_DAY), { status: "UNAVAILABLE" });

    expect(find(week, "SURFING")?.unavailableReason).toBe("MARINE_UNAVAILABLE");
  });

  it("reports how far from the city the waves are forecast", () => {
    const week = makeWeek(Array(7).fill(SURF_DAY), {
      status: "AVAILABLE",
      latitude: 41.7,
      longitude: 12.5,
      distanceKm: 20.6,
    });

    expect(find(week, "SURFING")).toMatchObject({
      available: true,
      weekLabel: "GREAT",
      waveForecastDistanceKm: 20.6,
    });
  });
});
