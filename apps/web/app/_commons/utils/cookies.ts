export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split("=").map(c => c.trim());
    if (cookieName === name && cookieValue) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
}

export function deleteCookie(name: string, path: string = "/", domain?: string): void {
  if (typeof document === "undefined") return;

  // Delete without domain (for local development)
  document.cookie = `${name}=; path=${path}; max-age=0`;

  // Also delete with domain (for production cross-subdomain cookies)
  if (domain) {
    document.cookie = `${name}=; path=${path}; domain=${domain}; max-age=0`;
  }
}

export const AUTH_COOKIES = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
} as const;

export function getAuthTokensFromCookies() {
  return {
    accessToken: getCookie(AUTH_COOKIES.ACCESS_TOKEN),
    refreshToken: getCookie(AUTH_COOKIES.REFRESH_TOKEN),
  };
}

export function clearAuthCookies(): void {
  // Extract root domain for cross-subdomain cookie deletion
  // e.g., "finances.omasolutions.cl" -> ".omasolutions.cl"
  const rootDomain = getRootDomain();

  deleteCookie(AUTH_COOKIES.ACCESS_TOKEN, "/", rootDomain);
  deleteCookie(AUTH_COOKIES.REFRESH_TOKEN, "/", rootDomain);
}

function getRootDomain(): string | undefined {
  if (typeof window === "undefined") return undefined;

  const hostname = window.location.hostname;

  // localhost doesn't need domain
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return undefined;
  }

  // Extract root domain (e.g., "app.example.com" -> ".example.com")
  const parts = hostname.split(".");
  if (parts.length >= 2) {
    return "." + parts.slice(-2).join(".");
  }

  return undefined;
}
