/**
 * Global API client: base URL, JSON handling and one error shape.
 *
 * Request/response types are **not** written by hand — they are generated from
 * the FastAPI OpenAPI schema (`npm run api:types`) into `api-schema.d.ts`.
 * A hand-maintained contract drifts silently the moment someone changes an
 * endpoint, so domain calls in `features/<name>/services` should import the
 * generated types instead of redeclaring payloads.
 */
const configuredBaseUrl: unknown = import.meta.env.VITE_API_BASE_URL;

const BASE_URL =
  typeof configuredBaseUrl === 'string' && configuredBaseUrl.length > 0
    ? configuredBaseUrl
    : '/api';

export class ApiError extends Error {
  constructor(
    override readonly message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ErrorPayload {
  detail?: string;
  code?: string;
}

export async function apiRequest<TResponse>(
  path: string,
  init: RequestInit = {},
): Promise<TResponse> {
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  if (!response.ok) {
    let payload: ErrorPayload = {};
    try {
      payload = (await response.json()) as ErrorPayload;
    } catch {
      // тіло помилки може бути порожнім або не JSON — статусу достатньо
    }
    throw new ApiError(payload.detail ?? response.statusText, response.status, payload.code);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}
