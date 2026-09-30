import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@shared/api";
import { renderWithQueryClient } from "../../../../test/renderWithQueryClient";
import { fetchActivityForecast } from "../../api";
import { FORECAST } from "../../fixtures";
import { ActivityForecast } from ".";

vi.mock("../../api", () => ({ fetchActivityForecast: vi.fn() }));

beforeEach(() => {
  vi.mocked(fetchActivityForecast).mockReset();
});

describe("ActivityForecast", () => {
  it("shows a loading state, then the ranked activities for the place", async () => {
    vi.mocked(fetchActivityForecast).mockResolvedValue(FORECAST);

    renderWithQueryClient(<ActivityForecast placeId="1" />);

    expect(screen.getByText("Loading forecast…")).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "Biarritz, New Aquitaine, France" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent),
    ).toEqual(["Surfing", "Skiing"]);
  });

  it("tells the user a linked place does not exist, without offering a retry", async () => {
    vi.mocked(fetchActivityForecast).mockRejectedValue(new ApiError("PLACE_NOT_FOUND", "nope"));

    renderWithQueryClient(<ActivityForecast placeId="999" />);

    expect(await screen.findByRole("alert")).toHaveTextContent("We couldn't find that place.");
    expect(screen.queryByRole("button", { name: "Try again" })).not.toBeInTheDocument();
    expect(fetchActivityForecast).toHaveBeenCalledTimes(1);
  });

  it("retries once automatically, then lets the user retry when the weather service is down", async () => {
    const down = new ApiError("UPSTREAM_UNAVAILABLE", "down");
    vi.mocked(fetchActivityForecast)
      .mockRejectedValueOnce(down)
      .mockRejectedValueOnce(down)
      .mockResolvedValueOnce(FORECAST);

    renderWithQueryClient(<ActivityForecast placeId="1" />);

    expect(await screen.findByRole("alert", {}, { timeout: 3000 })).toHaveTextContent(
      "The weather service isn't responding right now.",
    );
    expect(fetchActivityForecast).toHaveBeenCalledTimes(2);

    await userEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(
      await screen.findByRole("heading", { name: "Biarritz, New Aquitaine, France" }),
    ).toBeInTheDocument();
  });
});
