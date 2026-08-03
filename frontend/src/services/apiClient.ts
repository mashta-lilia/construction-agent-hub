/**
 * Global API client, per CLAUDE.md 2.1 ("services/ (корінь src/) --
 * тільки глобальна конфігурація API: базовий axios/fetch-інстанс,
 * interceptors, обробка помилок/токенів"). Domain-specific calls belong in
 * `features/<name>/services`, not here -- this module only owns the
 * shared request plumbing.
 *
 * There is no backend to call yet (see docs/api-contract.md's status
 * note), so nothing in the app imports this module today. It exists so
 * the backend PRs land against an established client instead of each
 * feature inventing its own fetch wrapper.
 */

export class ApiError extends Error {
  readonly status: number;
  readonly body: string;

  constructor(status: number, body: string) {
    super(body || `Request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

const BASE_URL = "/api";
const DEFAULT_TIMEOUT_MS = 15_000;

export interface ApiRequestInit extends RequestInit {
  /** Aborts the request after this many ms. Ignored if `signal` is set. */
  timeoutMs?: number;
}

/**
 * `TResponse | undefined`: some responses genuinely have no body (204, or
 * a 200 with an empty body) -- returning `undefined` there rather than
 * asserting `TResponse` keeps that case visible to callers instead of
 * lying about the type.
 */
export async function apiRequest<TResponse>(
  path: string,
  init: ApiRequestInit = {},
): Promise<TResponse | undefined> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, signal, headers: initHeaders, ...rest } = init;

  const headers = new Headers(initHeaders);
  // Only a JSON *string* body needs this header set for it. A `FormData`
  // or `URLSearchParams` body must let the browser set its own
  // Content-Type (multipart needs a generated boundary parameter) --
  // forcing "application/json" here would strip that and the server
  // could no longer parse the body.
  const isJsonBody = typeof rest.body === "string";
  if (isJsonBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers,
    signal: signal ?? AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new ApiError(response.status, body);
  }

  // Any empty successful body -- not just 204 -- must skip response.json(),
  // which throws a raw SyntaxError (not an ApiError) on an empty string and
  // would bypass callers' ApiError handling.
  const text = await response.text();
  if (!text) return undefined;
  return JSON.parse(text) as TResponse;
}
