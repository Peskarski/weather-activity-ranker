import type { DayWeather, WeekWeather } from "../openMeteo/index.ts";

export const makeDay = (overrides: Partial<DayWeather> = {}): DayWeather => ({
  date: "2026-01-10",
  weatherCode: 1,
  temperatureMax: 20,
  apparentTemperatureMax: 20,
  precipitationSum: 0,
  precipitationProbabilityMax: 5,
  snowfallSum: 0,
  snowfallPreviousDay: 0,
  windSpeedMax: 10,
  windGustsMax: 20,
  sunshineFraction: 0.8,
  snowDepthMax: 0,
  daytimeVisibilityKm: 30,
  waveHeightMax: null,
  swellPeriodMax: null,
  ...overrides,
});

export const makeWeek = (
  days: Partial<DayWeather>[],
  marine: WeekWeather["marine"] = { status: "NO_COAST" },
): WeekWeather => ({
  days: days.map((overrides, index) =>
    makeDay({ date: `2026-01-${String(10 + index).padStart(2, "0")}`, ...overrides }),
  ),
  marine,
});
