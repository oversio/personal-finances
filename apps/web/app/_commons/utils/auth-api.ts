import axios from "axios";
import { apiClient } from "./api-client";
import type { AuthResponse, LoginCredentials, RegisterCredentials } from "@/_commons/types/auth";
import type { User } from "@/_commons/types/user";

const API_BASE_URL = "/api/v1";

export async function loginApi(credentials: LoginCredentials): Promise<AuthResponse> {
  // Use raw axios for login (no auth header needed)
  const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/login`, credentials);
  return response.data;
}

export async function registerApi(credentials: RegisterCredentials): Promise<AuthResponse> {
  // Use raw axios for register (no auth header needed)
  const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/register`, credentials);
  return response.data;
}

export async function logoutApi(refreshToken: string): Promise<void> {
  await apiClient.post("/auth/logout", { refreshToken });
}

export async function getMeApi(): Promise<User> {
  const response = await apiClient.get<User>("/auth/me");
  return response.data;
}

export function getGoogleAuthUrl(): string {
  return "/api/v1/auth/google";
}
