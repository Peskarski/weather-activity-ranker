/* eslint-disable */
import * as types from "./graphql";

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
  "\n  query ActivityForecast($placeId: ID!) {\n    activityForecast(placeId: $placeId) {\n      place {\n        id\n        name\n        region\n        country\n        countryCode\n      }\n      activities {\n        activity\n        available\n        unavailableReason\n        waveForecastDistanceKm\n        weekScore\n        weekLabel\n        bestDay\n        days {\n          date\n          score\n          label\n          reasons {\n            code\n            impact\n            value\n          }\n        }\n      }\n    }\n  }\n": typeof types.ActivityForecastDocument;
  "\n  query SearchPlaces($query: String!) {\n    searchPlaces(query: $query) {\n      id\n      name\n      region\n      country\n      countryCode\n      latitude\n      longitude\n    }\n  }\n": typeof types.SearchPlacesDocument;
};
const documents: Documents = {
  "\n  query ActivityForecast($placeId: ID!) {\n    activityForecast(placeId: $placeId) {\n      place {\n        id\n        name\n        region\n        country\n        countryCode\n      }\n      activities {\n        activity\n        available\n        unavailableReason\n        waveForecastDistanceKm\n        weekScore\n        weekLabel\n        bestDay\n        days {\n          date\n          score\n          label\n          reasons {\n            code\n            impact\n            value\n          }\n        }\n      }\n    }\n  }\n":
    types.ActivityForecastDocument,
  "\n  query SearchPlaces($query: String!) {\n    searchPlaces(query: $query) {\n      id\n      name\n      region\n      country\n      countryCode\n      latitude\n      longitude\n    }\n  }\n":
    types.SearchPlacesDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query ActivityForecast($placeId: ID!) {\n    activityForecast(placeId: $placeId) {\n      place {\n        id\n        name\n        region\n        country\n        countryCode\n      }\n      activities {\n        activity\n        available\n        unavailableReason\n        waveForecastDistanceKm\n        weekScore\n        weekLabel\n        bestDay\n        days {\n          date\n          score\n          label\n          reasons {\n            code\n            impact\n            value\n          }\n        }\n      }\n    }\n  }\n",
): typeof import("./graphql").ActivityForecastDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query SearchPlaces($query: String!) {\n    searchPlaces(query: $query) {\n      id\n      name\n      region\n      country\n      countryCode\n      latitude\n      longitude\n    }\n  }\n",
): typeof import("./graphql").SearchPlacesDocument;

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
