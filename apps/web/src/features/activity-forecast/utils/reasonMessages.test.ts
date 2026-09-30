import { describe, expect, it } from "vitest";
import { reasonMessage, unavailableMessage } from "./reasonMessages";

describe("reasonMessage", () => {
  it.each([
    [{ code: "SNOW_DEPTH", value: 1.49 }, "149 cm snow base"],
    [{ code: "NO_SNOW", value: 0 }, "No snow on the ground"],
    [{ code: "NO_SNOW", value: 0.12 }, "Only 12 cm of snow on the ground"],
    [{ code: "FRESH_SNOW", value: 0.4 }, "No fresh snow"],
    [{ code: "FRESH_SNOW", value: 11.2 }, "11 cm of fresh snow in 48 h"],
    [{ code: "PRECIPITATION", value: 0 }, "Dry"],
    [{ code: "HEAVY_RAIN", value: 11.64 }, "Heavy rain, 11.6 mm"],
    [{ code: "SUNSHINE", value: 0.874 }, "87% sunshine"],
    [{ code: "WAVE_HEIGHT", value: 2.38 }, "Waves up to 2.4 m"],
    [{ code: "THUNDERSTORM", value: null }, "Thunderstorms"],
    [
      { code: "GOOD_WEATHER_OUTSIDE", value: 70 },
      "Good weather outside (outdoor sightseeing 70/100), consider going out",
    ],
  ] as const)("describes %o as %s", (reason, message) => {
    expect(reasonMessage(reason)).toBe(message);
  });
});

describe("unavailableMessage", () => {
  it("uses week-level wording", () => {
    expect(unavailableMessage("NO_SNOW")).toBe("Not enough snow on the ground this week");
  });

  it("falls back for codes without week-level wording", () => {
    expect(unavailableMessage("WIND")).toBe("Not possible this week");
    expect(unavailableMessage(null)).toBe("Not possible this week");
  });
});
