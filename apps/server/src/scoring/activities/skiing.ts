import { isThunderstorm } from "../weather.ts";
import type { ActivityModel } from "../types.ts";

const MIN_SNOW_DEPTH_M = 0.3;
const LIFTS_CLOSED_GUSTS_KMH = 80;
const SLUSH_FROM_CELSIUS = 6;
const SLUSH_CAP = 35;

const freshSnowCm = (snowfallSum: number | null, snowfallPreviousDay: number | null) =>
  snowfallSum === null && snowfallPreviousDay === null
    ? null
    : (snowfallSum ?? 0) + (snowfallPreviousDay ?? 0);

export const skiing: ActivityModel = {
  activity: "SKIING",
  gates: [
    {
      code: "NO_SNOW",
      when: ({ snowDepthMax }) => snowDepthMax === null || snowDepthMax < MIN_SNOW_DEPTH_M,
      value: ({ snowDepthMax }) => snowDepthMax,
    },
    {
      code: "LIFTS_CLOSED",
      when: ({ windGustsMax }) => (windGustsMax ?? 0) >= LIFTS_CLOSED_GUSTS_KMH,
      value: ({ windGustsMax }) => windGustsMax,
    },
    {
      code: "THUNDERSTORM",
      when: ({ weatherCode }) => isThunderstorm(weatherCode),
    },
  ],
  factors: [
    {
      code: "SNOW_DEPTH",
      weight: 0.3,
      value: ({ snowDepthMax }) => snowDepthMax,
      curve: [
        [0.3, 0.3],
        [0.6, 0.7],
        [1, 1],
      ],
    },
    {
      code: "FRESH_SNOW",
      weight: 0.2,
      value: ({ snowfallSum, snowfallPreviousDay }) =>
        freshSnowCm(snowfallSum, snowfallPreviousDay),
      curve: [
        [0, 0.4],
        [5, 0.7],
        [15, 1],
      ],
    },
    {
      code: "TEMPERATURE",
      weight: 0.2,
      value: ({ temperatureMax }) => temperatureMax,
      curve: [
        [-20, 0.2],
        [-15, 0.6],
        [-8, 1],
        [-2, 1],
        [2, 0.6],
        [6, 0.1],
      ],
    },
    {
      code: "GUSTS",
      weight: 0.15,
      value: ({ windGustsMax }) => windGustsMax,
      curve: [
        [30, 1],
        [50, 0.6],
        [70, 0.2],
        [80, 0],
      ],
    },
    {
      code: "VISIBILITY",
      weight: 0.1,
      value: ({ daytimeVisibilityKm }) => daytimeVisibilityKm,
      curve: [
        [1, 0.1],
        [5, 0.6],
        [20, 1],
      ],
    },
    {
      code: "SUNSHINE",
      weight: 0.05,
      value: ({ sunshineFraction }) => sunshineFraction,
      curve: [
        [0, 0.5],
        [0.7, 1],
      ],
    },
  ],
  caps: [
    {
      code: "SLUSH",
      when: ({ temperatureMax }) => (temperatureMax ?? 0) >= SLUSH_FROM_CELSIUS,
      maxScore: SLUSH_CAP,
      value: ({ temperatureMax }) => temperatureMax,
      replacesFactor: "TEMPERATURE",
    },
  ],
};
