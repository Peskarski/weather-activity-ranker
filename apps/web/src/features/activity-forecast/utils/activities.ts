import { type Activity, type ScoreLabel } from "../types";

export const ACTIVITY_NAMES: Record<Activity, string> = {
  SKIING: "Skiing",
  SURFING: "Surfing",
  OUTDOOR_SIGHTSEEING: "Outdoor sightseeing",
  INDOOR_SIGHTSEEING: "Indoor sightseeing",
};

export const ACTIVITY_ICONS: Record<Activity, string> = {
  SKIING: "⛷️",
  SURFING: "🏄",
  OUTDOOR_SIGHTSEEING: "🏛️",
  INDOOR_SIGHTSEEING: "🖼️",
};

export const SCORE_LABELS: Record<ScoreLabel, string> = {
  GREAT: "Great",
  GOOD: "Good",
  FAIR: "Fair",
  POOR: "Poor",
  NOT_POSSIBLE: "Not possible",
};

export const SCORE_LABEL_STYLES: Record<ScoreLabel, string> = {
  GREAT: "bg-green-100 text-green-800 border-green-300",
  GOOD: "bg-lime-100 text-lime-800 border-lime-300",
  FAIR: "bg-amber-100 text-amber-800 border-amber-300",
  POOR: "bg-orange-100 text-orange-800 border-orange-300",
  NOT_POSSIBLE: "bg-gray-100 text-gray-600 border-gray-300",
};

const MIN_NOTABLE_WAVE_DISTANCE_KM = 5;

export const waveDistanceNote = (distanceKm: number | null) =>
  distanceKm !== null && distanceKm >= MIN_NOTABLE_WAVE_DISTANCE_KM
    ? `Waves forecast about ${Math.round(distanceKm)} km from the city centre`
    : null;
