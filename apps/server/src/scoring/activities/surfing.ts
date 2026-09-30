import { isThunderstorm } from "../weather.ts";
import type { ActivityModel } from "../types.ts";

const FLAT_BELOW_M = 0.3;
const EXPERTS_ONLY_FROM_M = 5;

export const surfing: ActivityModel = {
  activity: "SURFING",
  gates: [
    {
      code: "NO_WAVE_DATA",
      when: ({ waveHeightMax }) => waveHeightMax === null,
    },
    {
      code: "FLAT",
      when: ({ waveHeightMax }) => (waveHeightMax ?? 0) < FLAT_BELOW_M,
      value: ({ waveHeightMax }) => waveHeightMax,
    },
    {
      code: "TOO_BIG",
      when: ({ waveHeightMax }) => (waveHeightMax ?? 0) >= EXPERTS_ONLY_FROM_M,
      value: ({ waveHeightMax }) => waveHeightMax,
    },
    {
      code: "THUNDERSTORM",
      when: ({ weatherCode }) => isThunderstorm(weatherCode),
    },
  ],
  factors: [
    {
      code: "WAVE_HEIGHT",
      weight: 0.35,
      value: ({ waveHeightMax }) => waveHeightMax,
      curve: [
        [0.3, 0.1],
        [0.6, 0.5],
        [1, 0.9],
        [1.2, 1],
        [2.5, 1],
        [3.5, 0.5],
        [4.5, 0.1],
      ],
    },
    {
      code: "SWELL_PERIOD",
      weight: 0.3,
      value: ({ swellPeriodMax }) => swellPeriodMax,
      curve: [
        [5, 0],
        [7, 0.3],
        [10, 0.8],
        [12, 1],
      ],
    },
    {
      code: "WIND",
      weight: 0.25,
      value: ({ windSpeedMax }) => windSpeedMax,
      curve: [
        [10, 1],
        [20, 0.6],
        [30, 0.25],
        [40, 0],
      ],
    },
    {
      code: "FEELS_LIKE",
      weight: 0.1,
      value: ({ apparentTemperatureMax }) => apparentTemperatureMax,
      curve: [
        [5, 0.3],
        [15, 0.8],
        [22, 1],
      ],
    },
  ],
  caps: [],
};
