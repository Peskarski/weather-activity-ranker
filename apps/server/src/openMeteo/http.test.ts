import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { fetchJson, UpstreamError } from "./http.ts";

const SCHEMA = z.object({ temperature: z.number() });
const URL_ = new URL("https://example.test/forecast");

const respondWith = (body: unknown, status = 200) =>
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify(body), { status })),
  );

const captureError = async (promise: Promise<unknown>) => {
  try {
    await promise;
  } catch (error) {
    return error as UpstreamError;
  }
  throw new Error("Expected the request to fail");
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchJson", () => {
  it("returns the body when it matches the schema", async () => {
    respondWith({ temperature: 21.5, extra: "ignored" });

    expect(await fetchJson("Test", URL_, SCHEMA)).toEqual({ temperature: 21.5 });
  });

  it("rejects a body that does not match the schema, naming the field", async () => {
    respondWith({ temperature: "warm" });

    const error = await captureError(fetchJson("Test", URL_, SCHEMA));

    expect(error).toBeInstanceOf(UpstreamError);
    expect(error.message).toContain("unexpected response");
    expect(error.message).toContain("temperature");
  });

  it("uses the service's own error reason and status", async () => {
    respondWith({ error: true, reason: "Location ID not found." }, 400);

    const error = await captureError(fetchJson("Test", URL_, SCHEMA));

    expect(error.message).toBe("Test: Location ID not found.");
    expect(error.status).toBe(400);
  });

  it("treats an error flag in a 200 response as a failure", async () => {
    respondWith({ error: true, reason: "Invalid variable" });

    expect((await captureError(fetchJson("Test", URL_, SCHEMA))).message).toBe(
      "Test: Invalid variable",
    );
  });

  it("reports non-JSON responses by status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("<html>502</html>", { status: 502 })),
    );

    expect((await captureError(fetchJson("Test", URL_, SCHEMA))).message).toBe("Test: HTTP 502");
  });

  it("reports timeouts", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new DOMException("The operation timed out.", "TimeoutError")),
    );

    expect((await captureError(fetchJson("Test", URL_, SCHEMA))).message).toBe("Test: timed out");
  });
});
