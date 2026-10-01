import { describe, expect, it } from "vitest";
import { toDays, toMarineStatus } from "./normalize.ts";
import type { ForecastResponse, MarineResponse } from "./schemas.ts";
import type { Place } from "./types.ts";

const hoursOf = (date: string) =>
  Array.from({ length: 24 }, (_, hour) => `${date}T${String(hour).padStart(2, "0")}:00`);

const daily = (values: Record<string, (number | null)[]>) =>
  Object.fromEntries(Object.entries(values).map(([key, series]) => [`${key}_best_match`, series]));

const buildForecast = (): ForecastResponse => ({
  daily: {
    time: ["2026-01-09", "2026-01-10", "2026-01-11"],
    ...daily({
      weather_code: [3, 71, 0],
      temperature_2m_max: [-2, -5, -8],
      apparent_temperature_max: [-6, -10, -12],
      precipitation_sum: [0, 4, 0],
      precipitation_probability_max: [10, 90, 5],
      snowfall_sum: [12, 3, 0],
      wind_speed_10m_max: [10, 25, 8],
      wind_gusts_10m_max: [20, 55, 15],
      sunshine_duration: [3600, 0, 36000],
      daylight_duration: [30000, 30000, 30000],
    }),
  },
  hourly: {
    time: [...hoursOf("2026-01-09"), ...hoursOf("2026-01-10"), ...hoursOf("2026-01-11")],
    visibility_best_match: [
      ...Array(24).fill(20000),
      ...Array.from({ length: 24 }, (_, hour) => (hour >= 9 && hour < 17 ? 1000 : 50000)),
      ...Array(24).fill(null),
    ],
    snow_depth_ecmwf_ifs025: [
      ...Array(24).fill(0.5),
      ...Array.from({ length: 24 }, (_, hour) => (hour % 3 === 0 ? 0.5 + hour / 100 : null)),
      ...Array(24).fill(0.8),
    ],
    snow_depth_best_match: Array(72).fill(9),
  },
});

const buildMarine = (overrides: Partial<MarineResponse> = {}): MarineResponse => ({
  latitude: 43.54,
  longitude: -1.54,
  daily: {
    time: ["2026-01-10", "2026-01-11"],
    wave_height_max: [1.8, 2.4],
    swell_wave_period_max: [11, 13],
  },
  ...overrides,
});

const biarritz: Place = {
  id: 1,
  name: "Biarritz",
  admin1: null,
  country: "France",
  countryCode: "FR",
  latitude: 43.48,
  longitude: -1.56,
  elevation: 20,
  timezone: "Europe/Paris",
};

describe("toDays", () => {
  it("drops the past day but keeps its snowfall as the next day's previous-day snowfall", () => {
    const days = toDays(buildForecast(), null);

    expect(days.map((day) => day.date)).toEqual(["2026-01-10", "2026-01-11"]);
    expect(days[0]).toMatchObject({ snowfallSum: 3, snowfallPreviousDay: 12 });
    expect(days[1]).toMatchObject({ snowfallSum: 0, snowfallPreviousDay: 3 });
  });

  it("maps daily values of the primary model", () => {
    const [day] = toDays(buildForecast(), null);

    expect(day).toMatchObject({
      weatherCode: 71,
      temperatureMax: -5,
      apparentTemperatureMax: -10,
      precipitationSum: 4,
      precipitationProbabilityMax: 90,
      windSpeedMax: 25,
      windGustsMax: 55,
    });
  });

  it("takes snow depth from the ECMWF model as the daily max, ignoring gaps", () => {
    const [day, nextDay] = toDays(buildForecast(), null);

    expect(day.snowDepthMax).toBe(0.71);
    expect(nextDay.snowDepthMax).toBe(0.8);
  });

  it("averages visibility over daytime hours only, in km", () => {
    const [day, nextDay] = toDays(buildForecast(), null);

    expect(day.daytimeVisibilityKm).toBe(1);
    expect(nextDay.daytimeVisibilityKm).toBeNull();
  });

  it("computes sunshine as a fraction of daylight", () => {
    const [day, nextDay] = toDays(buildForecast(), null);

    expect(day.sunshineFraction).toBe(0);
    expect(nextDay.sunshineFraction).toBe(1);
  });

  it("joins marine data by date", () => {
    const [day, nextDay] = toDays(buildForecast(), buildMarine());

    expect(day).toMatchObject({ waveHeightMax: 1.8, swellPeriodMax: 11 });
    expect(nextDay).toMatchObject({ waveHeightMax: 2.4, swellPeriodMax: 13 });
  });

  it("leaves wave data empty without marine data", () => {
    const [day] = toDays(buildForecast(), null);

    expect(day).toMatchObject({ waveHeightMax: null, swellPeriodMax: null });
  });
});

describe("toMarineStatus", () => {
  it("reports the grid cell used and its distance from the place", () => {
    expect(toMarineStatus(buildMarine(), biarritz)).toEqual({
      status: "AVAILABLE",
      latitude: 43.54,
      longitude: -1.54,
      distanceKm: 6.9,
    });
  });

  it("reports no coast when the nearest cell has no wave data", () => {
    const inland = buildMarine({
      daily: { time: ["2026-01-10"], wave_height_max: [null], swell_wave_period_max: [null] },
    });

    expect(toMarineStatus(inland, biarritz)).toEqual({ status: "NO_COAST" });
  });
});
