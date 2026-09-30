import { describe, expect, it } from "vitest";
import { scoreDay } from "./engine.ts";
import { makeDay } from "./fixtures.ts";
import { toLabel } from "./labels.ts";
import type { ActivityModel } from "./types.ts";

const model: ActivityModel = {
  activity: "OUTDOOR_SIGHTSEEING",
  gates: [
    {
      code: "NO_SNOW",
      when: ({ temperatureMax }) => (temperatureMax ?? 0) < -30,
      value: ({ temperatureMax }) => temperatureMax,
    },
  ],
  factors: [
    {
      code: "TEMPERATURE",
      weight: 0.75,
      value: ({ temperatureMax }) => temperatureMax,
      curve: [
        [0, 0],
        [20, 1],
      ],
    },
    {
      code: "WIND",
      weight: 0.25,
      value: ({ windSpeedMax }) => windSpeedMax,
      curve: [
        [0, 1],
        [40, 0],
      ],
    },
  ],
  caps: [
    {
      code: "THUNDERSTORM",
      when: ({ weatherCode }) => weatherCode === 95,
      maxScore: 30,
    },
  ],
};

describe("scoreDay", () => {
  it("combines factor qualities by weight", () => {
    const day = makeDay({ temperatureMax: 20, windSpeedMax: 20 });

    expect(scoreDay(model, day)).toMatchObject({ score: 88, label: "GREAT" });
  });

  it("returns not possible with the gate as the reason when a gate matches", () => {
    const day = makeDay({ temperatureMax: -40 });

    expect(scoreDay(model, day)).toEqual({
      date: day.date,
      score: 0,
      label: "NOT_POSSIBLE",
      reasons: [{ code: "NO_SNOW", impact: "NEGATIVE", value: -40 }],
    });
  });

  it("re-weights the remaining factors when a measurement is missing", () => {
    const day = makeDay({ temperatureMax: 10, windSpeedMax: null });

    expect(scoreDay(model, day).score).toBe(50);
  });

  it("limits the score and explains why when a cap applies", () => {
    const day = makeDay({ temperatureMax: 20, windSpeedMax: 0, weatherCode: 95 });

    const result = scoreDay(model, day);

    expect(result.score).toBe(30);
    expect(result.reasons[0]).toEqual({ code: "THUNDERSTORM", impact: "NEGATIVE", value: null });
  });

  it("does not repeat a factor that a cap already explains", () => {
    const replacing: ActivityModel = {
      ...model,
      caps: [{ ...model.caps[0], replacesFactor: "TEMPERATURE" }],
    };
    const day = makeDay({ temperatureMax: 2, windSpeedMax: 0, weatherCode: 95 });

    expect(scoreDay(replacing, day).reasons.map(({ code }) => code)).toEqual([
      "THUNDERSTORM",
      "WIND",
    ]);
  });

  it("lists the most damaging negatives before positives, with their values", () => {
    const day = makeDay({ temperatureMax: 2, windSpeedMax: 0 });

    expect(scoreDay(model, day).reasons).toEqual([
      { code: "TEMPERATURE", impact: "NEGATIVE", value: 2 },
      { code: "WIND", impact: "POSITIVE", value: 0 },
    ]);
  });
});

describe("toLabel", () => {
  it.each([
    [100, "GREAT"],
    [80, "GREAT"],
    [79, "GOOD"],
    [60, "GOOD"],
    [59, "FAIR"],
    [40, "FAIR"],
    [39, "POOR"],
    [0, "POOR"],
  ])("labels %d as %s", (score, label) => {
    expect(toLabel(score)).toBe(label);
  });
});
