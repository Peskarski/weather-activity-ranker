import { describe, expect, it } from "vitest";
import { makeWeek } from "./fixtures.ts";
import { rankActivities, summarize } from "./rankActivities.ts";
import type { DayScore } from "./types.ts";

const dayScore = (date: string, score: number): DayScore => ({
  date,
  score,
  label: score > 0 ? "FAIR" : "NOT_POSSIBLE",
  reasons: [],
  gateId: score > 0 ? null : "FLAT",
});

const SUMMER_CITY = makeWeek(Array(7).fill({}));

const surfWeek = { waveHeightMax: 1.8, swellPeriodMax: 12, windSpeedMax: 8 };

describe("summarize", () => {
  it("scores the week as the mean of its best three days and picks the best day", () => {
    const days = [10, 90, 20, 70, 0, 80, 30].map((score, index) => dayScore(`d${index}`, score));

    expect(summarize("SURFING", days, () => "")).toMatchObject({
      available: true,
      weekScore: 80,
      weekLabel: "GREAT",
      bestDay: "d1",
    });
  });

  it("marks the activity unavailable when no day is possible", () => {
    const days = Array.from({ length: 7 }, (_, index) => dayScore(`d${index}`, 0));

    expect(summarize("SURFING", days, () => "Flat sea all week")).toMatchObject({
      available: false,
      unavailableReason: "Flat sea all week",
      weekScore: null,
      weekLabel: "NOT_POSSIBLE",
      bestDay: null,
    });
  });
});

describe("rankActivities", () => {
  it("ranks available activities by weekly score and puts unavailable ones last", () => {
    const ranking = rankActivities(SUMMER_CITY);

    expect(ranking.map(({ activity, available }) => [activity, available])).toEqual([
      ["OUTDOOR_SIGHTSEEING", true],
      ["INDOOR_SIGHTSEEING", true],
      ["SURFING", false],
      ["SKIING", false],
    ]);
  });

  it("explains why skiing is unavailable with the most common reason of the week", () => {
    const skiing = rankActivities(SUMMER_CITY).find(({ activity }) => activity === "SKIING");

    expect(skiing?.unavailableReason).toBe("Not enough snow on the ground this week");
  });

  it("explains why surfing is unavailable inland", () => {
    const surfing = rankActivities(SUMMER_CITY).find(({ activity }) => activity === "SURFING");

    expect(surfing).toMatchObject({
      available: false,
      unavailableReason: "No coast within about 25 km",
    });
    expect(surfing?.days).toHaveLength(7);
  });

  it("distinguishes a marine service outage from having no coast", () => {
    const week = makeWeek(Array(7).fill(surfWeek), { status: "UNAVAILABLE" });

    const surfing = rankActivities(week).find(({ activity }) => activity === "SURFING");

    expect(surfing?.unavailableReason).toBe("Wave forecast is temporarily unavailable");
  });

  it("notes when waves are forecast away from the city centre", () => {
    const week = makeWeek(Array(7).fill(surfWeek), {
      status: "AVAILABLE",
      latitude: 41.7,
      longitude: 12.5,
      distanceKm: 20.6,
    });

    const surfing = rankActivities(week).find(({ activity }) => activity === "SURFING");

    expect(surfing).toMatchObject({
      available: true,
      weekLabel: "GREAT",
      note: "Waves forecast about 21 km from the city centre",
    });
  });
});
