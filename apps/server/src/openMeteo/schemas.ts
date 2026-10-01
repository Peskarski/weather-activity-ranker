import { z } from "zod";
import type { TimeSeriesBlock } from "./types.ts";

const timeSeriesBlock: z.ZodType<TimeSeriesBlock> = z
  .object({ time: z.array(z.string()) })
  .catchall(z.array(z.number().nullable()));

export const geocodingResultSchema = z.object({
  id: z.number(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  elevation: z.number().optional(),
  timezone: z.string(),
  country: z.string().optional(),
  country_code: z.string().optional(),
  admin1: z.string().optional(),
});

export const geocodingSearchSchema = z.object({
  results: z.array(geocodingResultSchema).optional(),
});

export const forecastSchema = z.object({
  daily: timeSeriesBlock,
  hourly: timeSeriesBlock,
});

export const marineSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  daily: timeSeriesBlock,
});

export type GeocodingResult = z.infer<typeof geocodingResultSchema>;
export type ForecastResponse = z.infer<typeof forecastSchema>;
export type MarineResponse = z.infer<typeof marineSchema>;
