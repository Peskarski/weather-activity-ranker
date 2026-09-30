import { afterEach, describe, expect, it, vi } from "vitest";
import { TypedDocumentString } from "./generated/graphql";
import { ApiError, request } from "./graphqlClient";

const DOCUMENT = new TypedDocumentString<{ ok: boolean }, { id: string }>("query Test { ok }");

const respondWith = (body: unknown, status = 200) =>
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify(body), { status })),
  );

const captureError = async (promise: Promise<unknown>) => {
  try {
    await promise;
  } catch (error) {
    return error as ApiError;
  }
  throw new Error("Expected the request to fail");
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("request", () => {
  it("posts the query and variables and returns data", async () => {
    respondWith({ data: { ok: true } });

    expect(await request(DOCUMENT, { id: "1" })).toEqual({ ok: true });

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe("/api/graphql");
    expect(JSON.parse(String(init?.body))).toEqual({
      query: "query Test { ok }",
      variables: { id: "1" },
    });
  });

  it("exposes the API error code", async () => {
    respondWith({
      data: null,
      errors: [{ message: "No place", extensions: { code: "PLACE_NOT_FOUND" } }],
    });

    const error = await captureError(request(DOCUMENT, { id: "1" }));

    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe("PLACE_NOT_FOUND");
  });

  it("treats unrecognised error codes as unknown", async () => {
    respondWith({
      errors: [{ message: "Unexpected error.", extensions: { code: "INTERNAL_SERVER_ERROR" } }],
    });

    expect((await captureError(request(DOCUMENT, { id: "1" }))).code).toBe("UNKNOWN");
  });

  it("reports network failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    expect((await captureError(request(DOCUMENT, { id: "1" }))).code).toBe("NETWORK_ERROR");
  });

  it("reports non-GraphQL error responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("Bad gateway", { status: 502 })),
    );

    expect((await captureError(request(DOCUMENT, { id: "1" }))).code).toBe("NETWORK_ERROR");
  });

  it("lets cancellations through untouched", async () => {
    const abort = new DOMException("Aborted", "AbortError");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(abort));

    await expect(request(DOCUMENT, { id: "1" })).rejects.toBe(abort);
  });
});
