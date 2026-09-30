import { PRIMARY_MODEL, SNOW_MODEL } from "./forecast.ts";
import { distanceKm } from "./geo.ts";
import type {
  DayWeather,
  ForecastResponse,
  MarineResponse,
  MarineStatus,
  Place,
  Series,
  TimeSeriesBlock,
} from "./types.ts";

const DAYTIME_START_HOUR = 9;
const DAYTIME_END_HOUR = 17;

const series = (block: TimeSeriesBlock, variable: string, model = PRIMARY_MODEL) =>
  (block[`${variable}_${model}`] ?? block[variable] ?? []) as Series;

const valueAt = (values: Series, index: number) => values[index] ?? null;

const round = (value: number, digits = 2) => Number(value.toFixed(digits));

const hourOf = (isoLocalTime: string) => Number(isoLocalTime.slice(11, 13));

const groupHourlyByDate = (time: string[], values: Series) => {
  const byDate = new Map<string, number[]>();
  time.forEach((timestamp, index) => {
    const value = values[index];
    if (value === null || value === undefined) {
      return;
    }
    const date = timestamp.slice(0, 10);
    byDate.set(date, [...(byDate.get(date) ?? []), value]);
  });
  return byDate;
};

const daytimeMean = (time: string[], values: Series, date: string) => {
  const daytime = time.flatMap((timestamp, index) => {
    const hour = hourOf(timestamp);
    const value = values[index];
    const isDaytime = hour >= DAYTIME_START_HOUR && hour < DAYTIME_END_HOUR;
    return timestamp.startsWith(date) && isDaytime && value != null ? [value] : [];
  });
  if (daytime.length === 0) {
    return null;
  }
  return daytime.reduce((sum, value) => sum + value, 0) / daytime.length;
};

const fraction = (part: number | null, whole: number | null) =>
  part === null || whole === null || whole === 0 ? null : round(Math.min(part / whole, 1));

export const toMarineStatus = (marine: MarineResponse, place: Place): MarineStatus => {
  const hasWaves = series(marine.daily, "wave_height_max").some((value) => value !== null);
  if (!hasWaves) {
    return { status: "NO_COAST" };
  }
  return {
    status: "AVAILABLE",
    latitude: marine.latitude,
    longitude: marine.longitude,
    distanceKm: round(distanceKm(place, marine), 1),
  };
};

export const toDays = (forecast: ForecastResponse, marine: MarineResponse | null): DayWeather[] => {
  const { daily, hourly } = forecast;
  const snowDepthByDate = groupHourlyByDate(hourly.time, series(hourly, "snow_depth", SNOW_MODEL));
  const visibility = series(hourly, "visibility");
  const snowfall = series(daily, "snowfall_sum");
  const marineIndex = new Map(marine?.daily.time.map((date, index) => [date, index]) ?? []);

  return daily.time.flatMap((date, index) => {
    if (index === 0) {
      return [];
    }

    const snowDepths = snowDepthByDate.get(date);
    const visibilityMeters = daytimeMean(hourly.time, visibility, date);
    const marineDay = marineIndex.get(date);
    const marineValue = (variable: string) =>
      marine && marineDay !== undefined ? valueAt(series(marine.daily, variable), marineDay) : null;

    return [
      {
        date,
        weatherCode: valueAt(series(daily, "weather_code"), index),
        temperatureMax: valueAt(series(daily, "temperature_2m_max"), index),
        apparentTemperatureMax: valueAt(series(daily, "apparent_temperature_max"), index),
        precipitationSum: valueAt(series(daily, "precipitation_sum"), index),
        precipitationProbabilityMax: valueAt(series(daily, "precipitation_probability_max"), index),
        snowfallSum: valueAt(snowfall, index),
        snowfallPreviousDay: valueAt(snowfall, index - 1),
        windSpeedMax: valueAt(series(daily, "wind_speed_10m_max"), index),
        windGustsMax: valueAt(series(daily, "wind_gusts_10m_max"), index),
        sunshineFraction: fraction(
          valueAt(series(daily, "sunshine_duration"), index),
          valueAt(series(daily, "daylight_duration"), index),
        ),
        snowDepthMax: snowDepths ? Math.max(...snowDepths) : null,
        daytimeVisibilityKm: visibilityMeters === null ? null : round(visibilityMeters / 1000, 1),
        waveHeightMax: marineValue("wave_height_max"),
        swellPeriodMax: marineValue("swell_wave_period_max"),
      },
    ];
  });
};
