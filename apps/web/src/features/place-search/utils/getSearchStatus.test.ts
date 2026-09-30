import { describe, expect, it } from "vitest";
import { getSearchStatus } from "./getSearchStatus";

const STATE = { isSearchable: true, isError: false, hasResults: false, isLoading: false };

describe("getSearchStatus", () => {
  it.each([
    [{ isSearchable: false, isError: true }, "idle"],
    [{ isError: true, hasResults: true }, "error"],
    [{ hasResults: true, isLoading: true }, "results"],
    [{ isLoading: true }, "loading"],
    [{}, "empty"],
  ])("given %o returns %s", (overrides, status) => {
    expect(getSearchStatus({ ...STATE, ...overrides })).toBe(status);
  });
});
