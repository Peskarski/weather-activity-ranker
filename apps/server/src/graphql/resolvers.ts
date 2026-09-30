import { fetchWeekWeather, getPlace, searchPlaces, UpstreamError } from "../openMeteo/index.ts";
import { rankActivities } from "../scoring/index.ts";
import { apiError } from "./errors.ts";
import type { Resolvers } from "./generated.ts";

const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 100;
const PLACE_ID_PATTERN = /^\d{1,10}$/;

const withUpstreamErrors = async <T>(request: () => Promise<T>) => {
  try {
    return await request();
  } catch (error) {
    if (error instanceof UpstreamError) {
      throw apiError("UPSTREAM_UNAVAILABLE", "The weather service is not responding. Try again.");
    }
    throw error;
  }
};

export const resolvers: Resolvers = {
  Query: {
    searchPlaces: async (_, { query }) => {
      const trimmed = query.trim();
      if (trimmed.length > MAX_QUERY_LENGTH) {
        throw apiError("BAD_USER_INPUT", `Search is limited to ${MAX_QUERY_LENGTH} characters.`);
      }
      if (trimmed.length < MIN_QUERY_LENGTH) {
        return [];
      }
      return withUpstreamErrors(() => searchPlaces(trimmed));
    },

    activityForecast: async (_, { placeId }) => {
      if (!PLACE_ID_PATTERN.test(placeId)) {
        throw apiError("BAD_USER_INPUT", "Place id must be a number.");
      }

      return withUpstreamErrors(async () => {
        const place = await getPlace(Number(placeId));
        if (!place) {
          throw apiError("PLACE_NOT_FOUND", `No place with id ${placeId}.`);
        }
        const week = await fetchWeekWeather(place);
        return { place, activities: rankActivities(week) };
      });
    },
  },

  Place: {
    id: ({ id }) => String(id),
    region: ({ admin1 }) => admin1,
  },
};
