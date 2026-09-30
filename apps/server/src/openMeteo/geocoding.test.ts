import { afterEach, describe, expect, it, vi } from "vitest";
import { getPlace, searchPlaces } from "./geocoding.ts";
import { UpstreamError } from "./http.ts";

const respondWith = (body: unknown, status = 200) =>
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify(body), { status })),
  );

const zermatt = {
  id: 2657928,
  name: "Zermatt",
  latitude: 46.02,
  longitude: 7.75,
  elevation: 1608,
  timezone: "Europe/Zurich",
  country: "Switzerland",
  country_code: "CH",
  admin1: "Valais",
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("searchPlaces", () => {
  it("maps results to places", async () => {
    respondWith({ results: [zermatt] });

    expect(await searchPlaces("Zermatt")).toEqual([
      {
        id: 2657928,
        name: "Zermatt",
        admin1: "Valais",
        country: "Switzerland",
        countryCode: "CH",
        latitude: 46.02,
        longitude: 7.75,
        elevation: 1608,
        timezone: "Europe/Zurich",
      },
    ]);
  });

  it("returns an empty list when the response has no results key", async () => {
    respondWith({ generationtime_ms: 0.2 });

    expect(await searchPlaces("asdfgh")).toEqual([]);
  });

  it("URL-encodes non-ASCII names", async () => {
    respondWith({});

    await searchPlaces("Kraków");

    const [url] = vi.mocked(fetch).mock.calls[0];
    expect(String(url)).toContain("name=Krak%C3%B3w");
  });
});

describe("getPlace", () => {
  it("returns null for an unknown id", async () => {
    respondWith({ error: true, reason: "Location ID not found." }, 400);

    expect(await getPlace(999999999)).toBeNull();
  });

  it("throws an upstream error when the service fails", async () => {
    respondWith({ error: true, reason: "Internal error" }, 500);

    await expect(getPlace(1)).rejects.toBeInstanceOf(UpstreamError);
  });
});
