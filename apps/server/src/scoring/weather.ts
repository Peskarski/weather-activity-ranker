const THUNDERSTORM_CODE_FROM = 95;

export const isThunderstorm = (weatherCode: number | null) =>
  weatherCode !== null && weatherCode >= THUNDERSTORM_CODE_FROM;
