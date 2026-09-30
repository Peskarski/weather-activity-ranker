import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useDebounce } from "@shared/hooks";
import { searchPlaces } from "../api";

export const MIN_QUERY_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 300;

export const usePlaceSearch = (query: string) => {
  const trimmedQuery = query.trim();
  const debouncedQuery = useDebounce(trimmedQuery, SEARCH_DEBOUNCE_MS);
  const isSearchable = debouncedQuery.length >= MIN_QUERY_LENGTH;

  const { data, isError, isFetching } = useQuery({
    queryKey: ["places", debouncedQuery],
    queryFn: ({ signal }) => searchPlaces(debouncedQuery, signal),
    enabled: isSearchable,
    staleTime: 1000 * 60 * 60,
    placeholderData: keepPreviousData,
  });

  return {
    places: data ?? [],
    isError,
    isFetching,
    isSearchable: trimmedQuery.length >= MIN_QUERY_LENGTH,
    isDebouncing: trimmedQuery !== debouncedQuery,
  };
};
