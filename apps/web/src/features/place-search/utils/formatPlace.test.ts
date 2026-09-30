import { describe, expect, it } from "vitest";
import { countryFlag, placeLabel } from "./formatPlace";

const base = {
  id: "1",
  name: "London",
  region: "England",
  country: "United Kingdom",
  countryCode: "GB",
  latitude: 51.5,
  longitude: -0.1,
};

describe("countryFlag", () => {
  it.each([
    ["GB", "🇬🇧"],
    ["pl", "🇵🇱"],
    [null, ""],
    ["XYZ", ""],
  ])("turns %s into %s", (code, flag) => {
    expect(countryFlag(code)).toBe(flag);
  });
});

describe("placeLabel", () => {
  it("joins name, region and country", () => {
    expect(placeLabel(base)).toBe("London, England, United Kingdom");
  });

  it("skips missing parts and a region equal to the name", () => {
    expect(placeLabel({ ...base, name: "Madrid", region: "Madrid", country: "Spain" })).toBe(
      "Madrid, Spain",
    );
    expect(placeLabel({ ...base, region: null, country: null })).toBe("London");
  });
});
