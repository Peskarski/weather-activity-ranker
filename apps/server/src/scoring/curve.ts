import type { CurvePoint } from "./types.ts";

export const interpolate = (curve: readonly CurvePoint[], value: number) => {
  const [firstValue, firstQuality] = curve[0];
  if (value <= firstValue) {
    return firstQuality;
  }

  for (let index = 1; index < curve.length; index++) {
    const [fromValue, fromQuality] = curve[index - 1];
    const [toValue, toQuality] = curve[index];
    if (value <= toValue) {
      const progress = (value - fromValue) / (toValue - fromValue);
      return fromQuality + progress * (toQuality - fromQuality);
    }
  }

  return curve[curve.length - 1][1];
};
