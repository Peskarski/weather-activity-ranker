import { fetchForecast, fetchMarine } from "./forecast.ts";
import { toDays, toMarineStatus } from "./normalize.ts";
import type { Place, WeekWeather } from "./types.ts";

export const fetchWeekWeather = async (place: Place): Promise<WeekWeather> => {
  const [forecast, marine] = await Promise.allSettled([fetchForecast(place), fetchMarine(place)]);

  if (forecast.status === "rejected") {
    throw forecast.reason;
  }

  if (marine.status === "rejected") {
    return { days: toDays(forecast.value, null), marine: { status: "UNAVAILABLE" } };
  }

  const marineStatus = toMarineStatus(marine.value, place);
  const marineData = marineStatus.status === "AVAILABLE" ? marine.value : null;

  return { days: toDays(forecast.value, marineData), marine: marineStatus };
};
