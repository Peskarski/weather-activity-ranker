/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  T | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };
import type { DocumentTypeDecoration } from "@graphql-typed-document-node/core";
export type Activity = "INDOOR_SIGHTSEEING" | "OUTDOOR_SIGHTSEEING" | "SKIING" | "SURFING";

export type Impact = "NEGATIVE" | "POSITIVE";

export type ReasonCode =
  /** Outdoor sightseeing score, 0-100 */
  | "BAD_WEATHER_OUTSIDE"
  /** Max apparent temperature, °C */
  | "FEELS_LIKE"
  /** Wave height, m */
  | "FLAT"
  /** Snowfall over today and yesterday, cm */
  | "FRESH_SNOW"
  /** Outdoor sightseeing score, 0-100 */
  | "GOOD_WEATHER_OUTSIDE"
  /** Wind gusts, km/h */
  | "GUSTS"
  /** Precipitation, mm */
  | "HEAVY_RAIN"
  /** Snowfall, cm */
  | "HEAVY_SNOW"
  /** Wind gusts, km/h */
  | "LIFTS_CLOSED"
  | "MARINE_UNAVAILABLE"
  | "NO_COAST"
  /** Snow depth, m */
  | "NO_SNOW"
  | "NO_WAVE_DATA"
  /** Precipitation, mm */
  | "PRECIPITATION"
  /** Max precipitation probability, % */
  | "PRECIPITATION_PROBABILITY"
  /** Max temperature, °C */
  | "SLUSH"
  /** Snow depth, m */
  | "SNOW_DEPTH"
  /** Wind gusts, km/h */
  | "STRONG_GUSTS"
  /** Share of daylight with sunshine, 0-1 */
  | "SUNSHINE"
  /** Max swell period, s */
  | "SWELL_PERIOD"
  /** Max temperature, °C */
  | "TEMPERATURE"
  | "THUNDERSTORM"
  /** Wave height, m */
  | "TOO_BIG"
  /** Mean daytime visibility, km */
  | "VISIBILITY"
  /** Max wave height, m */
  | "WAVE_HEIGHT"
  /** Max wind speed, km/h */
  | "WIND";

export type ScoreLabel = "FAIR" | "GOOD" | "GREAT" | "NOT_POSSIBLE" | "POOR";

export type ActivityForecastQueryVariables = Exact<{
  placeId: string | number;
}>;

export type ActivityForecastQuery = {
  activityForecast: {
    place: {
      id: string;
      name: string;
      region: string | null;
      country: string | null;
      countryCode: string | null;
    };
    activities: Array<{
      activity: Activity;
      available: boolean;
      unavailableReason: ReasonCode | null;
      waveForecastDistanceKm: number | null;
      weekScore: number | null;
      weekLabel: ScoreLabel;
      bestDay: string | null;
      days: Array<{
        date: string;
        score: number;
        label: ScoreLabel;
        reasons: Array<{ code: ReasonCode; impact: Impact; value: number | null }>;
      }>;
    }>;
  };
};

export type SearchPlacesQueryVariables = Exact<{
  query: string;
}>;

export type SearchPlacesQuery = {
  searchPlaces: Array<{
    id: string;
    name: string;
    region: string | null;
    country: string | null;
    countryCode: string | null;
    latitude: number;
    longitude: number;
  }>;
};

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>["__apiType"]>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const ActivityForecastDocument = new TypedDocumentString(`
    query ActivityForecast($placeId: ID!) {
  activityForecast(placeId: $placeId) {
    place {
      id
      name
      region
      country
      countryCode
    }
    activities {
      activity
      available
      unavailableReason
      waveForecastDistanceKm
      weekScore
      weekLabel
      bestDay
      days {
        date
        score
        label
        reasons {
          code
          impact
          value
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<ActivityForecastQuery, ActivityForecastQueryVariables>;
export const SearchPlacesDocument = new TypedDocumentString(`
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
    `) as unknown as TypedDocumentString<SearchPlacesQuery, SearchPlacesQueryVariables>;
