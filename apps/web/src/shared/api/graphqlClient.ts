import { type TypedDocumentString } from "./generated/graphql";

const GRAPHQL_URL = "/api/graphql";

export type ApiErrorCode =
  "BAD_USER_INPUT" | "PLACE_NOT_FOUND" | "UPSTREAM_UNAVAILABLE" | "NETWORK_ERROR" | "UNKNOWN";

const KNOWN_CODES: ApiErrorCode[] = ["BAD_USER_INPUT", "PLACE_NOT_FOUND", "UPSTREAM_UNAVAILABLE"];

export class ApiError extends Error {
  readonly code: ApiErrorCode;

  constructor(code: ApiErrorCode, message: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

type GraphQLResponse<TResult> = {
  data?: TResult | null;
  errors?: { message: string; extensions?: { code?: string } }[];
};

const toErrorCode = (code: string | undefined): ApiErrorCode =>
  KNOWN_CODES.find((known) => known === code) ?? "UNKNOWN";

const isAbort = (error: unknown) => error instanceof DOMException && error.name === "AbortError";

export const request = async <TResult, TVariables>(
  document: TypedDocumentString<TResult, TVariables>,
  variables: TVariables,
  signal?: AbortSignal,
): Promise<TResult> => {
  let response: Response;
  try {
    response = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: document.toString(), variables }),
      signal,
    });
  } catch (error) {
    if (isAbort(error)) {
      throw error;
    }
    throw new ApiError("NETWORK_ERROR", "Could not reach the server.");
  }

  const body = (await response.json().catch(() => null)) as GraphQLResponse<TResult> | null;
  const [firstError] = body?.errors ?? [];

  if (firstError) {
    throw new ApiError(toErrorCode(firstError.extensions?.code), firstError.message);
  }
  if (!response.ok || !body?.data) {
    throw new ApiError("NETWORK_ERROR", `Unexpected response (HTTP ${response.status}).`);
  }

  return body.data;
};
