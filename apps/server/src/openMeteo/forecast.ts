import { fetchJson } from "./http.ts";
import type { ForecastResponse, MarineResponse } from "./types.ts";

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const MARINE_URL = "https://marine-api.open-meteo.com/v1/marine";

export const FORECAST_DAYS = 7;
export const PRIMARY_MODEL = "best_match";
export const SNOW_MODEL = "ecmwf_ifs025";

export const DAILY_VARIABLES = [
  "weather_code",
  "temperature_2m_max",
  "apparent_temperature_max",
  "precipitation_sum",
  "precipitation_probability_max",
  "snowfall_sum",
  "wind_speed_10m_max",
  "wind_gusts_10m_max",
  "sunshine_duration",
  "daylight_duration",
] as const;

export const HOURLY_VARIABLES = ["visibility", "snow_depth"] as const;

export const MARINE_DAILY_VARIABLES = ["wave_height_max", "swell_wave_period_max"] as const;

type Coordinates = { latitude: number; longitude: number };

export const fetchForecast = ({ latitude, longitude }: Coordinates) => {
  const url = new URL(FORECAST_URL);
  url.search = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    daily: DAILY_VARIABLES.join(","),
    hourly: HOURLY_VARIABLES.join(","),
    models: `${PRIMARY_MODEL},${SNOW_MODEL}`,
    timezone: "auto",
    past_days: "1",
    forecast_days: String(FORECAST_DAYS),
  }).toString();

  return fetchJson<ForecastResponse>("Open-Meteo forecast", url);
};

export const fetchMarine = ({ latitude, longitude }: Coordinates) => {
  const url = new URL(MARINE_URL);
  url.search = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    daily: MARINE_DAILY_VARIABLES.join(","),
    timezone: "auto",
    forecast_days: String(FORECAST_DAYS),
  }).toString();

  return fetchJson<MarineResponse>("Open-Meteo marine", url);
};
