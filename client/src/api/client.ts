const API_ROOT = "/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    const text =
      typeof message === "string" && message !== "[object Object]"
        ? message
        : "The request could not be completed.";
    super(text);
    this.name = "ApiError";
  }
}

interface ApiRequestOptions extends RequestInit {
  skipRefresh?: boolean;
}

let refreshInFlight: Promise<void> | null = null;

async function refreshSession(): Promise<void> {
  if (!refreshInFlight) {
    refreshInFlight = apiRequest("/auth/refresh", {
      method: "POST",
      skipRefresh: true,
    })
      .then(() => undefined)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

function detailMessage(detail: unknown): string {
  if (typeof detail === "string" && detail.trim().length > 0) {
    return detail;
  }
  if (Array.isArray(detail)) {
    for (const item of detail) {
      if (typeof item === "string" && item.trim().length > 0) {
        return item;
      }
      if (item && typeof item === "object" && "msg" in item) {
        const msg = (item as { msg: unknown }).msg;
        if (typeof msg === "string" && msg.trim().length > 0) {
          return msg.replace(/^Value error, /i, "");
        }
      }
    }
  }
  return "The request could not be completed.";
}

export async function apiRequest<T>(
  path: string,
  init?: ApiRequestOptions,
): Promise<T> {
  const { skipRefresh = false, ...requestInit } = init ?? {};
  const response = await fetch(`${API_ROOT}${path}`, {
    ...requestInit,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...requestInit.headers,
    },
  });

  if (response.status === 401 && !skipRefresh && !path.startsWith("/auth/")) {
    try {
      await refreshSession();
      return apiRequest<T>(path, { ...requestInit, skipRefresh: true });
    } catch {
      // Use the original 401 below.
    }
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      detail?: unknown;
    } | null;
    throw new ApiError(detailMessage(payload?.detail), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
