import { useQuery } from "@tanstack/react-query";
import { ApiError, type ApiErrorCode } from "@shared/api";
import { fetchActivityForecast } from "../api";

const RETRYABLE_CODES: ApiErrorCode[] = ["UPSTREAM_UNAVAILABLE", "NETWORK_ERROR", "UNKNOWN"];
const MAX_RETRIES = 1;

const shouldRetry = (failureCount: number, error: Error) =>
  failureCount < MAX_RETRIES && error instanceof ApiError && RETRYABLE_CODES.includes(error.code);

export const useActivityForecast = (placeId: string) =>
  useQuery({
    queryKey: ["activityForecast", placeId],
    queryFn: ({ signal }) => fetchActivityForecast(placeId, signal),
    staleTime: 1000 * 60 * 15,
    retry: shouldRetry,
  });
