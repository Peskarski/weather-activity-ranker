import { request } from "@shared/api";
import { graphql } from "@shared/api/generated";

const SEARCH_PLACES = graphql(`
  query SearchPlaces($query: String!) {
    searchPlaces(query: $query) {
      id
      name
      region
      country
      countryCode
      latitude
      longitude
    }
  }
`);

export const searchPlaces = async (query: string, signal?: AbortSignal) => {
  const { searchPlaces: places } = await request(SEARCH_PLACES, { query }, signal);
  return places;
};
