import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@shared/api";
import { renderWithQueryClient } from "../../../../test/renderWithQueryClient";
import { searchPlaces } from "../../api";
import { type PlaceSuggestion } from "../../types";
import { PlaceCombobox } from ".";

vi.mock("../../api", () => ({ searchPlaces: vi.fn() }));

const place = (overrides: Partial<PlaceSuggestion>): PlaceSuggestion => ({
  id: "1",
  name: "Paris",
  region: "Île-de-France",
  country: "France",
  countryCode: "FR",
  latitude: 48.85,
  longitude: 2.35,
  ...overrides,
});

const PARIS_FR = place({});
const PARIS_TX = place({ id: "2", region: "Texas", country: "United States", countryCode: "US" });

const setup = () => {
  const onSelect = vi.fn();
  renderWithQueryClient(<PlaceCombobox onSelect={onSelect} />);
  return { onSelect, input: screen.getByRole("combobox", { name: "City or town" }) };
};

beforeEach(() => {
  vi.mocked(searchPlaces).mockReset();
});

describe("PlaceCombobox", () => {
  it("lists matching places with their region and country", async () => {
    vi.mocked(searchPlaces).mockResolvedValue([PARIS_FR, PARIS_TX]);
    const { input } = setup();

    await userEvent.type(input, "Paris");

    const options = await screen.findAllByRole("option");
    expect(options.map((option) => option.textContent)).toEqual([
      "🇫🇷ParisÎle-de-France, France",
      "🇺🇸ParisTexas, United States",
    ]);
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(searchPlaces).toHaveBeenCalledTimes(1);
    expect(searchPlaces).toHaveBeenCalledWith("Paris", expect.any(AbortSignal));
  });

  it("does not search for a single character", async () => {
    const { input } = setup();

    await userEvent.type(input, "P");

    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(searchPlaces).not.toHaveBeenCalled();
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("selects a place with the keyboard", async () => {
    vi.mocked(searchPlaces).mockResolvedValue([PARIS_FR, PARIS_TX]);
    const { input, onSelect } = setup();

    await userEvent.type(input, "Paris");
    await screen.findAllByRole("option");
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");

    expect(input).toHaveAttribute(
      "aria-activedescendant",
      screen.getAllByRole("option")[1].getAttribute("id"),
    );

    await userEvent.keyboard("{Enter}");

    expect(onSelect).toHaveBeenCalledWith(PARIS_TX);
    expect(input).toHaveValue("Paris, Texas, United States");
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("selects a place with the mouse", async () => {
    vi.mocked(searchPlaces).mockResolvedValue([PARIS_FR]);
    const { input, onSelect } = setup();

    await userEvent.type(input, "Paris");
    await userEvent.click(await screen.findByRole("option"));

    expect(onSelect).toHaveBeenCalledWith(PARIS_FR);
    expect(input).toHaveValue("Paris, Île-de-France, France");
  });

  it("closes on Escape and clears on a second Escape", async () => {
    vi.mocked(searchPlaces).mockResolvedValue([PARIS_FR]);
    const { input } = setup();

    await userEvent.type(input, "Paris");
    await screen.findByRole("option");
    await userEvent.keyboard("{Escape}");

    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(input).toHaveValue("Paris");

    await userEvent.keyboard("{Escape}");

    expect(input).toHaveValue("");
  });

  it("tells the user when nothing matches", async () => {
    vi.mocked(searchPlaces).mockResolvedValue([]);
    const { input } = setup();

    await userEvent.type(input, "asdfgh");

    expect(await screen.findByText("No places found for “asdfgh”.")).toBeVisible();
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it("tells the user when search is unavailable", async () => {
    vi.mocked(searchPlaces).mockRejectedValue(new ApiError("UPSTREAM_UNAVAILABLE", "down"));
    const { input } = setup();

    await userEvent.type(input, "Paris");

    await waitFor(() =>
      expect(screen.getByText(/Place search is unavailable right now/)).toBeVisible(),
    );
  });
});
