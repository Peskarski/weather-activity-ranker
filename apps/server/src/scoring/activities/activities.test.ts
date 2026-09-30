import { describe, expect, it } from "vitest";
import { scoreDay } from "../engine.ts";
import { makeDay } from "../fixtures.ts";
import { indoorSightseeing, outdoorSightseeing, skiing, surfing } from "./index.ts";

const WINTER = {
  temperatureMax: -6,
  apparentTemperatureMax: -12,
  snowDepthMax: 1.2,
  snowfallSum: 10,
  snowfallPreviousDay: 15,
  windGustsMax: 20,
  daytimeVisibilityKm: 25,
  sunshineFraction: 0.8,
};

const SURF = {
  waveHeightMax: 1.8,
  swellPeriodMax: 12,
  windSpeedMax: 8,
  apparentTemperatureMax: 22,
};

const WASH_OUT = {
  precipitationSum: 20,
  precipitationProbabilityMax: 100,
  apparentTemperatureMax: 6,
  sunshineFraction: 0,
};

const blocker = (result: ReturnType<typeof scoreDay>) => result.reasons[0];

describe("skiing", () => {
  it("rates a cold powder day with a deep base as great", () => {
    expect(scoreDay(skiing, makeDay(WINTER)).label).toBe("GREAT");
  });

  it("is not possible without enough snow on the ground", () => {
    const result = scoreDay(skiing, makeDay({ ...WINTER, snowDepthMax: 0.12 }));

    expect(result.label).toBe("NOT_POSSIBLE");
    expect(blocker(result)).toEqual({ code: "NO_SNOW", impact: "NEGATIVE", value: 0.12 });
  });

  it("is not possible when gusts close the lifts", () => {
    const result = scoreDay(skiing, makeDay({ ...WINTER, windGustsMax: 85 }));

    expect(blocker(result).code).toBe("LIFTS_CLOSED");
  });

  it("rates a warm slushy day on a thin base as poor", () => {
    const slush = makeDay({
      ...WINTER,
      snowDepthMax: 0.4,
      snowfallSum: 0,
      snowfallPreviousDay: 0,
      temperatureMax: 7,
      sunshineFraction: 0.2,
      daytimeVisibilityKm: 8,
    });

    const result = scoreDay(skiing, slush);

    expect(result.label).toBe("POOR");
    expect(blocker(result)).toEqual({ code: "SLUSH", impact: "NEGATIVE", value: 7 });
  });
});

describe("surfing", () => {
  it("rates clean, head-high, long-period swell with light wind as great", () => {
    expect(scoreDay(surfing, makeDay(SURF)).label).toBe("GREAT");
  });

  it.each([
    ["the sea is flat", { waveHeightMax: 0.2 }, "FLAT"],
    ["waves are too big for most surfers", { waveHeightMax: 6 }, "TOO_BIG"],
    ["there are thunderstorms", { weatherCode: 95 }, "THUNDERSTORM"],
  ])("is not possible when %s", (_, overrides, code) => {
    const result = scoreDay(surfing, makeDay({ ...SURF, ...overrides }));

    expect(result.label).toBe("NOT_POSSIBLE");
    expect(blocker(result).code).toBe(code);
  });

  it("rates short-period, windy chop as poor", () => {
    const chop = makeDay({ ...SURF, waveHeightMax: 0.8, swellPeriodMax: 5, windSpeedMax: 35 });

    expect(scoreDay(surfing, chop).label).toBe("POOR");
  });
});

describe("outdoor sightseeing", () => {
  it("rates a dry, mild, sunny day as great", () => {
    expect(scoreDay(outdoorSightseeing, makeDay()).label).toBe("GREAT");
  });

  it("rates a cold, wet, windy day as poor with heavy rain as the main reason", () => {
    const result = scoreDay(
      outdoorSightseeing,
      makeDay({ ...WASH_OUT, precipitationSum: 14, apparentTemperatureMax: 4, windSpeedMax: 40 }),
    );

    expect(result.label).toBe("POOR");
    expect(blocker(result)).toEqual({ code: "HEAVY_RAIN", impact: "NEGATIVE", value: 14 });
  });

  it("caps an otherwise good day with thunderstorms", () => {
    const result = scoreDay(outdoorSightseeing, makeDay({ weatherCode: 95 }));

    expect(result.score).toBe(30);
    expect(blocker(result).code).toBe("THUNDERSTORM");
  });
});

describe("indoor sightseeing", () => {
  it("rates a wash-out day as great and turns the outdoor problems into reasons to stay in", () => {
    const day = makeDay(WASH_OUT);

    const result = indoorSightseeing(day, scoreDay(outdoorSightseeing, day));

    expect(result.label).toBe("GREAT");
    expect(result.reasons.map(({ code, impact }) => [code, impact])).toEqual([
      ["BAD_WEATHER_OUTSIDE", "POSITIVE"],
      ["HEAVY_RAIN", "POSITIVE"],
      ["FEELS_LIKE", "POSITIVE"],
    ]);
  });

  it("rates a perfect outdoor day as fair", () => {
    const day = makeDay();

    const result = indoorSightseeing(day, scoreDay(outdoorSightseeing, day));

    expect(result.label).toBe("FAIR");
    expect(result.reasons.map(({ code }) => code)).toEqual(["GOOD_WEATHER_OUTSIDE"]);
  });

  it("is penalised when heavy snow makes getting around hard", () => {
    const calm = makeDay({ precipitationSum: 10, apparentTemperatureMax: -2 });
    const snowy = makeDay({ precipitationSum: 10, apparentTemperatureMax: -2, snowfallSum: 15 });

    const calmResult = indoorSightseeing(calm, scoreDay(outdoorSightseeing, calm));
    const snowyResult = indoorSightseeing(snowy, scoreDay(outdoorSightseeing, snowy));

    expect(calmResult.score - snowyResult.score).toBe(20);
    expect(snowyResult.reasons[0]).toEqual({ code: "HEAVY_SNOW", impact: "NEGATIVE", value: 15 });
  });
});
