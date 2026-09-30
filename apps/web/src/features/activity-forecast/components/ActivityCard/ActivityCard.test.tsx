import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { SKIING, SURFING } from "../../fixtures";
import { ActivityCard } from ".";

const renderCard = (ranking = SURFING) =>
  render(
    <ol>
      <ActivityCard ranking={ranking} rank={1} />
    </ol>,
  );

describe("ActivityCard", () => {
  it("shows the weekly rating and the best day's reasons by default", () => {
    renderCard();

    const card = screen.getByRole("article", { name: "Surfing" });
    expect(within(card).getByText("Great")).toBeInTheDocument();
    expect(within(card).getByText("Best day:")).toHaveTextContent("Best day: Fri 2 Oct");
    expect(
      within(card).getByRole("button", {
        name: "Friday 2 October: Great, 95 out of 100, best day",
      }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(within(card).getByText("Waves up to 1.8 m")).toBeInTheDocument();
  });

  it("shows another day's reasons when it is selected", async () => {
    renderCard();

    await userEvent.click(screen.getByRole("button", { name: /Thursday 1 October/ }));

    expect(screen.getByRole("button", { name: /Thursday 1 October/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByText("Wind up to 32 km/h")).toBeInTheDocument();
    expect(screen.queryByText("Waves up to 1.8 m")).not.toBeInTheDocument();
  });

  it("describes impossible days without a score", () => {
    renderCard();

    expect(
      screen.getByRole("button", { name: "Saturday 3 October: Not possible" }),
    ).toHaveTextContent("–");
  });

  it("mentions a wave forecast taken far from the city", () => {
    renderCard();

    expect(screen.getByText("Waves forecast about 21 km from the city centre")).toBeInTheDocument();
  });

  it("explains why an activity is not possible this week, without a day strip", () => {
    renderCard(SKIING);

    expect(screen.getByText("Not enough snow on the ground this week")).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Daily scores" })).not.toBeInTheDocument();
  });
});
