import { z } from "zod";

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

const errorBodySchema = z.object({
  error: z.literal(true),
  reason: z.string().optional(),
});

export const fetchJson = async <T>(
  service: string,
  url: URL,
  schema: z.ZodType<T>,
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

  const body: unknown = await response.json().catch(() => null);
  const errorBody = errorBodySchema.safeParse(body);

  if (!response.ok || errorBody.success) {
    const reason = errorBody.data?.reason ?? `HTTP ${response.status}`;
    throw new UpstreamError(service, reason, response.status);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new UpstreamError(service, `unexpected response: ${z.prettifyError(parsed.error)}`);
  }

  return parsed.data;
};
