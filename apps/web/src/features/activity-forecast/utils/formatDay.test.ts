import { describe, expect, it } from "vitest";
import { formatDayOfMonth, formatLongDay, formatShortDay, formatWeekday } from "./formatDay";

describe("formatDay", () => {
  it("formats forecast dates as the local calendar day, whatever the viewer's time zone", () => {
    expect(formatShortDay("2026-10-02")).toBe("Fri 2 Oct");
    expect(formatWeekday("2026-10-02")).toBe("Fri");
    expect(formatDayOfMonth("2026-10-02")).toBe("2");
    expect(formatLongDay("2026-10-02")).toBe("Friday 2 October");
  });
});
