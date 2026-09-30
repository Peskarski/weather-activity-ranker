import { isThunderstorm, oneDecimal, whole } from "../format.ts";
import type { ActivityModel } from "../types.ts";

const FLAT_BELOW_M = 0.3;
const EXPERTS_ONLY_FROM_M = 5;

export const surfing: ActivityModel = {
  activity: "SURFING",
  gates: [
    {
      id: "NO_WAVE_DATA",
      when: ({ waveHeightMax }) => waveHeightMax === null,
      reason: () => "No wave forecast for this day",
      weekReason: "No wave forecast for this location",
    },
    {
      id: "FLAT",
      when: ({ waveHeightMax }) => (waveHeightMax ?? 0) < FLAT_BELOW_M,
      reason: ({ waveHeightMax }) => `Flat, waves under ${whole((waveHeightMax ?? 0) * 100)} cm`,
      weekReason: "Flat sea all week",
    },
    {
      id: "TOO_BIG",
      when: ({ waveHeightMax }) => (waveHeightMax ?? 0) >= EXPERTS_ONLY_FROM_M,
      reason: ({ waveHeightMax }) => `Waves up to ${oneDecimal(waveHeightMax ?? 0)} m, experts only`,
      weekReason: "Waves too big for all but experts all week",
    },
    {
      id: "THUNDERSTORM",
      when: ({ weatherCode }) => isThunderstorm(weatherCode),
      reason: () => "Thunderstorms, stay out of the water",
      weekReason: "Thunderstorms all week",
    },
  ],
  factors: [
    {
      id: "waveHeight",
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
      describe: (meters) => `Waves up to ${oneDecimal(meters)} m`,
    },
    {
      id: "swellPeriod",
      weight: 0.3,
      value: ({ swellPeriodMax }) => swellPeriodMax,
      curve: [
        [5, 0],
        [7, 0.3],
        [10, 0.8],
        [12, 1],
      ],
      describe: (seconds) => `${whole(seconds)} s swell period`,
    },
    {
      id: "wind",
      weight: 0.25,
      value: ({ windSpeedMax }) => windSpeedMax,
      curve: [
        [10, 1],
        [20, 0.6],
        [30, 0.25],
        [40, 0],
      ],
      describe: (kmh) => `Wind up to ${whole(kmh)} km/h`,
    },
    {
      id: "airTemperature",
      weight: 0.1,
      value: ({ apparentTemperatureMax }) => apparentTemperatureMax,
      curve: [
        [5, 0.3],
        [15, 0.8],
        [22, 1],
      ],
      describe: (celsius) => `Feels like ${whole(celsius)}°C`,
    },
  ],
  caps: [],
};
