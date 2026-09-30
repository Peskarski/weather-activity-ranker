import {
  type Activity,
  type ActivityForecastQuery,
  type Impact,
  type ReasonCode,
  type ScoreLabel,
} from "@shared/api/generated/graphql";

export type { Activity, Impact, ReasonCode, ScoreLabel };

export type ActivityForecast = ActivityForecastQuery["activityForecast"];
export type ForecastPlace = ActivityForecast["place"];
export type ActivityRanking = ActivityForecast["activities"][number];
export type DayScore = ActivityRanking["days"][number];
export type Reason = DayScore["reasons"][number];
