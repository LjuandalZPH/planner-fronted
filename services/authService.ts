import { apiFetch } from "./api";

export interface AuthResponse {
  user: { id: string; email: string };
  token: string;
}

export async function login(email: string, password: string) {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logout() {
  return apiFetch<void>("/auth/logout", { method: "POST" });
}

