import { isThunderstorm, oneDecimal, percent, whole } from "../format.ts";
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
      id: "NO_SNOW",
      when: ({ snowDepthMax }) => snowDepthMax === null || snowDepthMax < MIN_SNOW_DEPTH_M,
      reason: ({ snowDepthMax }) =>
        snowDepthMax === null || snowDepthMax < 0.01
          ? "No snow on the ground"
          : `Only ${whole(snowDepthMax * 100)} cm of snow on the ground`,
      weekReason: "Not enough snow on the ground this week",
    },
    {
      id: "LIFTS_CLOSED",
      when: ({ windGustsMax }) => (windGustsMax ?? 0) >= LIFTS_CLOSED_GUSTS_KMH,
      reason: ({ windGustsMax }) => `Gusts up to ${whole(windGustsMax ?? 0)} km/h, lifts likely closed`,
      weekReason: "Wind strong enough to close lifts all week",
    },
    {
      id: "THUNDERSTORM",
      when: ({ weatherCode }) => isThunderstorm(weatherCode),
      reason: () => "Thunderstorms, lifts close",
      weekReason: "Thunderstorms all week",
    },
  ],
  factors: [
    {
      id: "snowDepth",
      weight: 0.3,
      value: ({ snowDepthMax }) => snowDepthMax,
      curve: [
        [0.3, 0.3],
        [0.6, 0.7],
        [1, 1],
      ],
      describe: (depth) => `${whole(depth * 100)} cm snow base`,
    },
    {
      id: "freshSnow",
      weight: 0.2,
      value: ({ snowfallSum, snowfallPreviousDay }) => freshSnowCm(snowfallSum, snowfallPreviousDay),
      curve: [
        [0, 0.4],
        [5, 0.7],
        [15, 1],
      ],
      describe: (cm) => (cm < 1 ? "No fresh snow" : `${whole(cm)} cm of fresh snow in 48 h`),
    },
    {
      id: "temperature",
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
      describe: (celsius) => `High of ${whole(celsius)}°C`,
    },
    {
      id: "gusts",
      weight: 0.15,
      value: ({ windGustsMax }) => windGustsMax,
      curve: [
        [30, 1],
        [50, 0.6],
        [70, 0.2],
        [80, 0],
      ],
      describe: (kmh) => `Gusts up to ${whole(kmh)} km/h`,
    },
    {
      id: "visibility",
      weight: 0.1,
      value: ({ daytimeVisibilityKm }) => daytimeVisibilityKm,
      curve: [
        [1, 0.1],
        [5, 0.6],
        [20, 1],
      ],
      describe: (km) => (km < 1 ? "Poor visibility, under 1 km" : `Visibility ${oneDecimal(km)} km`),
    },
    {
      id: "sunshine",
      weight: 0.05,
      value: ({ sunshineFraction }) => sunshineFraction,
      curve: [
        [0, 0.5],
        [0.7, 1],
      ],
      describe: (fraction) => `${percent(fraction)} sunshine`,
    },
  ],
  caps: [
    {
      replacesFactor: "temperature",
      when: ({ temperatureMax }) => (temperatureMax ?? 0) >= SLUSH_FROM_CELSIUS,
      maxScore: SLUSH_CAP,
      reason: ({ temperatureMax }) => `High of ${whole(temperatureMax ?? 0)}°C, wet and slushy snow`,
    },
  ],
};
