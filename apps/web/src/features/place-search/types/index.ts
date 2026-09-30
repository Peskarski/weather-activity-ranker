import { type SearchPlacesQuery } from "@shared/api/generated/graphql";

export type PlaceSuggestion = SearchPlacesQuery["searchPlaces"][number];
