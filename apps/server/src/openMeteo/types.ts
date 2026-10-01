export type Place = {
  id: number;
  name: string;
  admin1: string | null;
  country: string | null;
  countryCode: string | null;
  latitude: number;
  longitude: number;
  elevation: number | null;
  timezone: string;
};

export type DayWeather = {
  date: string;
  weatherCode: number | null;
  temperatureMax: number | null;
  apparentTemperatureMax: number | null;
  precipitationSum: number | null;
  precipitationProbabilityMax: number | null;
  snowfallSum: number | null;
  snowfallPreviousDay: number | null;
  windSpeedMax: number | null;
  windGustsMax: number | null;
  sunshineFraction: number | null;
  snowDepthMax: number | null;
  daytimeVisibilityKm: number | null;
  waveHeightMax: number | null;
  swellPeriodMax: number | null;
};

export type MarineStatus =
  | { status: "AVAILABLE"; latitude: number; longitude: number; distanceKm: number }
  | { status: "NO_COAST" }
  | { status: "UNAVAILABLE" };

export type WeekWeather = {
  days: DayWeather[];
  marine: MarineStatus;
};

export type Series = (number | null)[];

export type TimeSeriesBlock = {
  time: string[];
  [variable: string]: string[] | Series;
};
