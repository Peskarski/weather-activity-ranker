import { fetchJson, UpstreamError } from "./http.ts";
import { geocodingResultSchema, geocodingSearchSchema, type GeocodingResult } from "./schemas.ts";
import type { Place } from "./types.ts";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1";
const SERVICE = "Open-Meteo geocoding";

const toPlace = (result: GeocodingResult): Place => ({
  id: result.id,
  name: result.name,
  admin1: result.admin1 ?? null,
  country: result.country ?? null,
  countryCode: result.country_code ?? null,
  latitude: result.latitude,
  longitude: result.longitude,
  elevation: result.elevation ?? null,
  timezone: result.timezone,
});

export const searchPlaces = async (query: string, limit = 8): Promise<Place[]> => {
  const url = new URL(`${GEOCODING_URL}/search`);
  url.search = new URLSearchParams({
    name: query,
    count: String(limit),
    language: "en",
    format: "json",
  }).toString();

  const data = await fetchJson(SERVICE, url, geocodingSearchSchema);
  return (data.results ?? []).map(toPlace);
};

export const getPlace = async (id: number): Promise<Place | null> => {
  const url = new URL(`${GEOCODING_URL}/get`);
  url.search = new URLSearchParams({ id: String(id), language: "en" }).toString();

  try {
    return toPlace(await fetchJson(SERVICE, url, geocodingResultSchema));
  } catch (error) {
    if (error instanceof UpstreamError && error.status === 400) {
      return null;
    }
    throw error;
  }
};
