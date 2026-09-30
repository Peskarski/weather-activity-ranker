import { type SearchStatus } from "../types";

type SearchState = {
  isSearchable: boolean;
  isError: boolean;
  hasResults: boolean;
  isLoading: boolean;
};

export const getSearchStatus = ({
  isSearchable,
  isError,
  hasResults,
  isLoading,
}: SearchState): SearchStatus => {
  if (!isSearchable) {
    return "idle";
  }
  if (isError) {
    return "error";
  }
  if (hasResults) {
    return "results";
  }
  if (isLoading) {
    return "loading";
  }
  return "empty";
};
