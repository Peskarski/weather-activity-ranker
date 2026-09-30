import { type Reason, type ReasonCode } from "../types";

type Format = (value: number) => string;

const whole = (value: number) => Math.round(value);
const oneDecimal = (value: number) => Math.round(value * 10) / 10;
const centimetres = (metres: number) => Math.round(metres * 100);
const percent = (fraction: number) => Math.round(fraction * 100);

const REASON_MESSAGES: Record<ReasonCode, Format> = {
  NO_SNOW: (depth) =>
    depth < 0.01 ? "No snow on the ground" : `Only ${centimetres(depth)} cm of snow on the ground`,
  LIFTS_CLOSED: (kmh) => `Gusts up to ${whole(kmh)} km/h, lifts likely closed`,
  THUNDERSTORM: () => "Thunderstorms",
  NO_COAST: () => "No coast within about 25 km",
  MARINE_UNAVAILABLE: () => "Wave forecast is temporarily unavailable",
  NO_WAVE_DATA: () => "No wave forecast for this day",
  FLAT: (metres) => `Flat sea, waves only ${centimetres(metres)} cm`,
  TOO_BIG: (metres) => `Waves up to ${oneDecimal(metres)} m, experts only`,
  SLUSH: (celsius) => `High of ${whole(celsius)}°C, wet and slushy snow`,
  HEAVY_RAIN: (mm) => `Heavy rain, ${oneDecimal(mm)} mm`,
  STRONG_GUSTS: (kmh) => `Gusts up to ${whole(kmh)} km/h`,
  HEAVY_SNOW: (cm) => `${whole(cm)} cm of snowfall, getting around may be hard`,
  BAD_WEATHER_OUTSIDE: (score) =>
    `Poor weather outside (outdoor sightseeing ${whole(score)}/100), a good day to be indoors`,
  GOOD_WEATHER_OUTSIDE: (score) =>
    `Good weather outside (outdoor sightseeing ${whole(score)}/100), consider going out`,
  SNOW_DEPTH: (depth) => `${centimetres(depth)} cm snow base`,
  FRESH_SNOW: (cm) => (cm < 1 ? "No fresh snow" : `${whole(cm)} cm of fresh snow in 48 h`),
  TEMPERATURE: (celsius) => `High of ${whole(celsius)}°C`,
  FEELS_LIKE: (celsius) => `Feels like ${whole(celsius)}°C`,
  GUSTS: (kmh) => `Gusts up to ${whole(kmh)} km/h`,
  WIND: (kmh) => `Wind up to ${whole(kmh)} km/h`,
  VISIBILITY: (km) => (km < 1 ? "Poor visibility, under 1 km" : `Visibility ${oneDecimal(km)} km`),
  SUNSHINE: (fraction) => `${percent(fraction)}% sunshine`,
  PRECIPITATION: (mm) => (mm < 0.1 ? "Dry" : `${oneDecimal(mm)} mm of rain`),
  PRECIPITATION_PROBABILITY: (probability) => `${whole(probability)}% chance of rain`,
  WAVE_HEIGHT: (metres) => `Waves up to ${oneDecimal(metres)} m`,
  SWELL_PERIOD: (seconds) => `${whole(seconds)} s swell period`,
};

const UNAVAILABLE_MESSAGES: Partial<Record<ReasonCode, string>> = {
  NO_SNOW: "Not enough snow on the ground this week",
  LIFTS_CLOSED: "Wind strong enough to close the lifts all week",
  THUNDERSTORM: "Thunderstorms all week",
  NO_COAST: "No coast within about 25 km",
  MARINE_UNAVAILABLE: "Wave forecast is temporarily unavailable",
  NO_WAVE_DATA: "No wave forecast for this location",
  FLAT: "Flat sea all week",
  TOO_BIG: "Waves too big for all but experts all week",
};

const NOT_POSSIBLE_THIS_WEEK = "Not possible this week";

export const reasonMessage = ({ code, value }: Pick<Reason, "code" | "value">) =>
  REASON_MESSAGES[code](value ?? 0);

export const unavailableMessage = (code: ReasonCode | null) =>
  (code && UNAVAILABLE_MESSAGES[code]) || NOT_POSSIBLE_THIS_WEEK;
