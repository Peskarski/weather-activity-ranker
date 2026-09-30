import { isThunderstorm } from "../weather.ts";
import type { ActivityModel } from "../types.ts";

const STORM_CAP = 30;
const STRONG_GUSTS_KMH = 70;
const HEAVY_RAIN_CAP = 35;
const HEAVY_RAIN_MM = 10;

export const outdoorSightseeing: ActivityModel = {
  activity: "OUTDOOR_SIGHTSEEING",
  gates: [],
  factors: [
    {
      code: "PRECIPITATION",
      weight: 0.25,
      value: ({ precipitationSum }) => precipitationSum,
      curve: [
        [0, 1],
        [1, 0.8],
        [5, 0.4],
        [15, 0.05],
      ],
    },
    {
      code: "PRECIPITATION_PROBABILITY",
      weight: 0.1,
      value: ({ precipitationProbabilityMax }) => precipitationProbabilityMax,
      curve: [
        [20, 1],
        [50, 0.6],
        [80, 0.2],
      ],
    },
    {
      code: "FEELS_LIKE",
      weight: 0.3,
      value: ({ apparentTemperatureMax }) => apparentTemperatureMax,
      curve: [
        [-5, 0.1],
        [5, 0.4],
        [15, 1],
        [25, 1],
        [30, 0.6],
        [35, 0.15],
      ],
    },
    {
      code: "WIND",
      weight: 0.2,
      value: ({ windSpeedMax }) => windSpeedMax,
      curve: [
        [20, 1],
        [35, 0.6],
        [50, 0.2],
      ],
    },
    {
      code: "SUNSHINE",
      weight: 0.15,
      value: ({ sunshineFraction }) => sunshineFraction,
      curve: [
        [0, 0.3],
        [0.5, 0.8],
        [0.7, 1],
      ],
    },
  ],
  caps: [
    {
      code: "HEAVY_RAIN",
      when: ({ precipitationSum }) => (precipitationSum ?? 0) >= HEAVY_RAIN_MM,
      maxScore: HEAVY_RAIN_CAP,
      value: ({ precipitationSum }) => precipitationSum,
      replacesFactor: "PRECIPITATION",
    },
    {
      code: "THUNDERSTORM",
      when: ({ weatherCode }) => isThunderstorm(weatherCode),
      maxScore: STORM_CAP,
    },
    {
      code: "STRONG_GUSTS",
      when: ({ windGustsMax }) => (windGustsMax ?? 0) >= STRONG_GUSTS_KMH,
      maxScore: STORM_CAP,
      value: ({ windGustsMax }) => windGustsMax,
    },
  ],
};
