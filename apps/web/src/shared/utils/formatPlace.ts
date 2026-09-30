import { type PlaceName } from "../types";

const REGIONAL_INDICATOR_A = 0x1f1e6;
const LETTER_A = 65;

export const countryFlag = (countryCode: string | null) =>
  countryCode && /^[a-z]{2}$/i.test(countryCode)
    ? String.fromCodePoint(
        ...[...countryCode.toUpperCase()].map(
          (letter) => REGIONAL_INDICATOR_A + letter.charCodeAt(0) - LETTER_A,
        ),
      )
    : "";

export const placeDetails = ({ name, region, country }: PlaceName) =>
  [region, country].filter((part) => part && part !== name).join(", ");

export const placeLabel = (place: PlaceName) =>
  [place.name, placeDetails(place)].filter(Boolean).join(", ");
