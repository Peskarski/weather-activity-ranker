import { request } from "@shared/api";
import { graphql } from "@shared/api/generated";

const ACTIVITY_FORECAST = graphql(`
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
`);

export const fetchActivityForecast = async (placeId: string, signal?: AbortSignal) => {
  const { activityForecast } = await request(ACTIVITY_FORECAST, { placeId }, signal);
  return activityForecast;
};
