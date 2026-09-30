import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchWeekWeather, getPlace, searchPlaces, UpstreamError } from "../openMeteo/index.ts";
import type { Place } from "../openMeteo/index.ts";
import { makeWeek } from "../scoring/fixtures.ts";
import { yoga } from "../yoga.ts";

vi.mock("../openMeteo/index.ts", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../openMeteo/index.ts")>()),
  searchPlaces: vi.fn(),
  getPlace: vi.fn(),
  fetchWeekWeather: vi.fn(),
}));

const WARSAW: Place = {
  id: 756135,
  name: "Warsaw",
  admin1: "Masovia",
  country: "Poland",
  countryCode: "PL",
  latitude: 52.23,
  longitude: 21.01,
  elevation: 113,
  timezone: "Europe/Warsaw",
};

const execute = async (query: string, variables: Record<string, unknown>) => {
  const response = await yoga.fetch("http://localhost/api/graphql", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  return response.json();
};

const SEARCH = /* GraphQL */ `
  query Search($query: String!) {
    searchPlaces(query: $query) {
      id
      name
      region
      country
    }
  }
`;

const FORECAST = /* GraphQL */ `
  query Forecast($placeId: ID!) {
    activityForecast(placeId: $placeId) {
      place {
        id
        name
      }
      activities {
        activity
        available
        unavailableReason
        weekLabel
        days {
          date
          reasons {
            code
            impact
            value
          }
        }
      }
    }
  }
`;

const errorCode = (result: { errors?: { extensions?: { code?: string } }[] }) =>
  result.errors?.[0]?.extensions?.code;

beforeEach(() => {
  vi.resetAllMocks();
});

describe("searchPlaces", () => {
  it("returns matching places with the region exposed", async () => {
    vi.mocked(searchPlaces).mockResolvedValue([WARSAW]);

    const result = await execute(SEARCH, { query: "  Warsaw " });

    expect(searchPlaces).toHaveBeenCalledWith("Warsaw");
    expect(result.data.searchPlaces).toEqual([
      { id: "756135", name: "Warsaw", region: "Masovia", country: "Poland" },
    ]);
  });

  it("does not call the geocoder for queries shorter than 2 characters", async () => {
    const result = await execute(SEARCH, { query: "W" });

    expect(result.data.searchPlaces).toEqual([]);
    expect(searchPlaces).not.toHaveBeenCalled();
  });

  it("rejects overly long queries", async () => {
    const result = await execute(SEARCH, { query: "x".repeat(101) });

    expect(errorCode(result)).toBe("BAD_USER_INPUT");
  });
});

describe("activityForecast", () => {
  it("returns the place and ranked activities with reason codes", async () => {
    vi.mocked(getPlace).mockResolvedValue(WARSAW);
    vi.mocked(fetchWeekWeather).mockResolvedValue(makeWeek(Array(7).fill({})));

    const result = await execute(FORECAST, { placeId: "756135" });

    const { place, activities } = result.data.activityForecast;
    expect(place).toEqual({ id: "756135", name: "Warsaw" });
    expect(activities.map(({ activity }: { activity: string }) => activity)).toEqual([
      "OUTDOOR_SIGHTSEEING",
      "INDOOR_SIGHTSEEING",
      "SURFING",
      "SKIING",
    ]);
    expect(activities[3]).toMatchObject({
      available: false,
      unavailableReason: "NO_SNOW",
      weekLabel: "NOT_POSSIBLE",
    });
    expect(activities[3].days[0].reasons).toEqual([
      { code: "NO_SNOW", impact: "NEGATIVE", value: 0 },
    ]);
  });

  it("rejects ids that are not numbers", async () => {
    const result = await execute(FORECAST, { placeId: "warsaw" });

    expect(errorCode(result)).toBe("BAD_USER_INPUT");
    expect(getPlace).not.toHaveBeenCalled();
  });

  it("reports unknown places", async () => {
    vi.mocked(getPlace).mockResolvedValue(null);

    const result = await execute(FORECAST, { placeId: "999999999" });

    expect(errorCode(result)).toBe("PLACE_NOT_FOUND");
    expect(result.data).toBeNull();
  });

  it("reports the weather service being down", async () => {
    vi.mocked(getPlace).mockResolvedValue(WARSAW);
    vi.mocked(fetchWeekWeather).mockRejectedValue(
      new UpstreamError("Open-Meteo forecast", "timed out"),
    );

    const result = await execute(FORECAST, { placeId: "756135" });

    expect(errorCode(result)).toBe("UPSTREAM_UNAVAILABLE");
  });

  it("hides unexpected errors from clients", async () => {
    vi.mocked(getPlace).mockRejectedValue(new TypeError("secret internals"));

    const result = await execute(FORECAST, { placeId: "756135" });

    expect(result.errors[0].message).toBe("Unexpected error.");
    expect(JSON.stringify(result)).not.toContain("secret internals");
  });
});
