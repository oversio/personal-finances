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

export function deleteCookie(name: string, path: string = "/"): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=${path}; max-age=0`;
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
  deleteCookie(AUTH_COOKIES.ACCESS_TOKEN);
  deleteCookie(AUTH_COOKIES.REFRESH_TOKEN);
}
