"use server";

/**
 * Lightweight API client to call the backend API.
 * - Uses NEXT_PUBLIC_BACKEND_API_URL for base URL.
 * - Passes through cookies for server actions by default when using fetch.
 * - During `next build` phase, short-circuits network calls to avoid hanging CI if backend is unavailable.
 */

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8000";

/**
 * Detect if we are in Next.js build phase.
 * NEXT_PHASE is set by Next.js during build; also, process.env.NODE_ENV === "production" and process.env.NEXT_RUNTIME may be present.
 */
function isBuildPhase() {
  const phase = process.env.NEXT_PHASE || "";
  // When building in CI, this is typically 'phase-production-build'
  const phaseIsBuild = phase.includes("build");
  // Additional explicit toggle for CI where NEXT_PHASE may not be present
  const explicitToggle =
    (process.env.DISABLE_API_DURING_BUILD || "").toLowerCase() === "true";
  return phaseIsBuild || explicitToggle;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiResponse<T> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
}

// PUBLIC_INTERFACE
export async function apiRequest<T>(
  path: string,
  options: {
    method?: HttpMethod;
    body?: unknown;
    headers?: Record<string, string>;
    // If set, the cookie header will be forwarded (useful for server components/actions).
    // In Next.js server actions, cookies are automatically forwarded by fetch unless overridden.
    nextOptions?: RequestInit;
  } = {}
): Promise<ApiResponse<T>> {
  // During next build, avoid making network calls that could hang if backend isn't up.
  if (isBuildPhase()) {
    return {
      ok: false,
      status: 0,
      error: "Skipped external API call during build phase",
    };
  }

  const url = `${BASE_URL}${path}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const init: RequestInit = {
    method: options.method || "GET",
    headers,
    credentials: "include", // include cookies for same-site requests; backend should set HttpOnly cookie
    body: options.body ? JSON.stringify(options.body) : undefined,
    ...options.nextOptions,
  };

  try {
    const res = await fetch(url, init);

    const contentType = res.headers.get("content-type") || "";
    let parsed: unknown = undefined;
    if (contentType.includes("application/json")) {
      parsed = await res.json().catch(() => undefined);
    } else {
      parsed = await res.text().catch(() => undefined);
    }

    if (!res.ok) {
      const message =
        (typeof parsed === "object" && parsed !== null
          ? // @ts-expect-error index access on unknown
            (parsed.detail || parsed.error || parsed.message)
          : undefined) || `Request failed with status ${res.status}`;
      return { ok: false, status: res.status, error: String(message) };
    }

    return { ok: true, status: res.status, data: parsed as T };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    return { ok: false, status: 0, error: message };
  }
}
