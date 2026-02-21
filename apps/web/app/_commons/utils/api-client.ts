import { useAuthStore } from "@/_commons/stores/auth.store";

const API_BASE_URL = "/api/v1";

interface RequestConfig {
  url: string;
  method?: string;
  data?: unknown;
  params?: Record<string, unknown>;
  signal?: AbortSignal;
}

interface Response<T = unknown> {
  data: T;
  status: number;
  statusText: string;
}

/**
 * API client that mimics axios interface but uses native fetch.
 * This allows the fetcher to remain agnostic to the underlying HTTP implementation.
 */
export const apiClient = {
  async request<T>(config: RequestConfig): Promise<Response<T>> {
    const response = await fetchWithAuth(config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const error = new ApiError(response.status, response.statusText, errorData);
      // Attach response-like object for compatibility with error handlers
      (error as ApiError & { response?: { status: number; data: unknown } }).response = {
        status: response.status,
        data: errorData,
      };
      throw error;
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) {
      return {
        data: undefined as T,
        status: response.status,
        statusText: response.statusText,
      };
    }

    const data = await response.json();
    return {
      data,
      status: response.status,
      statusText: response.statusText,
    };
  },
};

async function fetchWithAuth(config: RequestConfig): Promise<globalThis.Response> {
  const { accessToken } = useAuthStore.getState();
  const { url, method = "GET", data, params, signal } = config;

  // Build URL with query params
  const fullUrl = buildUrl(url, params);

  // Prepare headers
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  // Make the request
  const response = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    signal,
  });

  // Handle 401 with token refresh
  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.set("Authorization", `Bearer ${newToken}`);
      return fetch(fullUrl, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        signal,
      });
    }
  }

  return response;
}

function buildUrl(url: string, params?: Record<string, unknown>): string {
  const fullUrl = `${API_BASE_URL}${url}`;

  if (!params || Object.keys(params).length === 0) {
    return fullUrl;
  }

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  }

  return `${fullUrl}?${searchParams.toString()}`;
}

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken, setTokens, logout } = useAuthStore.getState();

  if (!refreshToken) {
    logout();
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      logout();
      return null;
    }

    const data = await response.json();
    const { accessToken, refreshToken: newRefreshToken } = data.tokens;

    setTokens({
      accessToken,
      refreshToken: newRefreshToken,
    });

    return accessToken;
  } catch {
    logout();
    return null;
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown,
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = "ApiError";
  }
}
