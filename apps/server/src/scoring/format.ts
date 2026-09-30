const THUNDERSTORM_CODE_FROM = 95;

export const isThunderstorm = (weatherCode: number | null) =>
  weatherCode !== null && weatherCode >= THUNDERSTORM_CODE_FROM;

export const whole = (value: number) => Math.round(value);

export const oneDecimal = (value: number) => Math.round(value * 10) / 10;

export const percent = (fraction: number) => `${Math.round(fraction * 100)}%`;
