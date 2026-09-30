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

describe("skiing", () => {
  it("rates a cold powder day with a deep base as great", () => {
    expect(scoreDay(skiing, makeDay(WINTER)).label).toBe("GREAT");
  });

  it("is not possible without enough snow on the ground", () => {
    const result = scoreDay(skiing, makeDay({ ...WINTER, snowDepthMax: 0.12 }));

    expect(result).toMatchObject({ label: "NOT_POSSIBLE", gateId: "NO_SNOW" });
    expect(result.reasons[0].text).toBe("Only 12 cm of snow on the ground");
  });

  it("is not possible when gusts close the lifts", () => {
    expect(scoreDay(skiing, makeDay({ ...WINTER, windGustsMax: 85 })).gateId).toBe("LIFTS_CLOSED");
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
    expect(result.reasons[0].text).toBe("High of 7°C, wet and slushy snow");
  });
});

describe("surfing", () => {
  it("rates clean, head-high, long-period swell with light wind as great", () => {
    expect(scoreDay(surfing, makeDay(SURF)).label).toBe("GREAT");
  });

  it("is not possible when the sea is flat", () => {
    expect(scoreDay(surfing, makeDay({ ...SURF, waveHeightMax: 0.2 })).gateId).toBe("FLAT");
  });

  it("is not possible when waves are too big for most surfers", () => {
    expect(scoreDay(surfing, makeDay({ ...SURF, waveHeightMax: 6 })).gateId).toBe("TOO_BIG");
  });

  it("rates short-period, windy chop as poor", () => {
    const chop = makeDay({ ...SURF, waveHeightMax: 0.8, swellPeriodMax: 5, windSpeedMax: 35 });

    expect(scoreDay(surfing, chop).label).toBe("POOR");
  });

  it("is not possible during thunderstorms", () => {
    expect(scoreDay(surfing, makeDay({ ...SURF, weatherCode: 95 })).gateId).toBe("THUNDERSTORM");
  });
});

describe("outdoor sightseeing", () => {
  it("rates a dry, mild, sunny day as great", () => {
    expect(scoreDay(outdoorSightseeing, makeDay()).label).toBe("GREAT");
  });

  it("rates a cold, wet, windy day as poor and says why", () => {
    const result = scoreDay(
      outdoorSightseeing,
      makeDay({
        apparentTemperatureMax: 4,
        precipitationSum: 14,
        precipitationProbabilityMax: 95,
        windSpeedMax: 40,
        sunshineFraction: 0,
      }),
    );

    expect(result.label).toBe("POOR");
    expect(result.reasons[0].text).toBe("Heavy rain, 14 mm");
  });

  it("caps an otherwise good day with thunderstorms", () => {
    const result = scoreDay(outdoorSightseeing, makeDay({ weatherCode: 95 }));

    expect(result.score).toBe(30);
    expect(result.reasons[0].text).toBe("Thunderstorms expected");
  });
});

describe("indoor sightseeing", () => {
  it("rates a wash-out day as great and gives the outdoor problems as reasons", () => {
    const day = makeDay({
      precipitationSum: 20,
      precipitationProbabilityMax: 100,
      apparentTemperatureMax: 6,
      sunshineFraction: 0,
    });

    const result = indoorSightseeing(day, scoreDay(outdoorSightseeing, day));

    expect(result.label).toBe("GREAT");
    expect(result.reasons[0]).toEqual({
      text: "Poor weather outside, a good day to be indoors",
      impact: "POSITIVE",
    });
  });

  it("rates a perfect outdoor day as fair", () => {
    const day = makeDay();

    const result = indoorSightseeing(day, scoreDay(outdoorSightseeing, day));

    expect(result.label).toBe("FAIR");
    expect(result.reasons).toEqual([
      { text: "Great weather outside, better spent outdoors", impact: "NEGATIVE" },
    ]);
  });

  it("is penalised when heavy snow makes getting around hard", () => {
    const calm = makeDay({ precipitationSum: 10, apparentTemperatureMax: -2 });
    const snowy = makeDay({ precipitationSum: 10, apparentTemperatureMax: -2, snowfallSum: 15 });

    const calmScore = indoorSightseeing(calm, scoreDay(outdoorSightseeing, calm)).score;
    const snowyScore = indoorSightseeing(snowy, scoreDay(outdoorSightseeing, snowy)).score;

    expect(calmScore - snowyScore).toBe(20);
  });
});
