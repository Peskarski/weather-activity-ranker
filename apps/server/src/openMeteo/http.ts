const DEFAULT_TIMEOUT_MS = 8000;

export class UpstreamError extends Error {
  readonly service: string;
  readonly status: number | null;

  constructor(service: string, message: string, status: number | null = null) {
    super(`${service}: ${message}`);
    this.name = "UpstreamError";
    this.service = service;
    this.status = status;
  }
}

type ErrorBody = { error?: boolean; reason?: string };

export const fetchJson = async <T>(
  service: string,
  url: URL,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<T> => {
  let response: Response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  } catch (error) {
    const reason =
      error instanceof Error && error.name === "TimeoutError" ? "timed out" : "unreachable";
    throw new UpstreamError(service, reason);
  }

  const body = (await response.json().catch(() => null)) as (T & ErrorBody) | null;

  if (!response.ok || body === null || body.error) {
    throw new UpstreamError(service, body?.reason ?? `HTTP ${response.status}`, response.status);
  }

  return body;
};
