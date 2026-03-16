import { useState } from "react";

export function useAuth() {
  const [user, setUser] = useState<null | { id: string; email: string }>(null);

  function login(email: string, _password: string) {
    // Implementar integración real (por ejemplo, Supabase) más adelante.
    setUser({ id: "mock-user", email });
  }

  function logout() {
    setUser(null);
  }

  return { user, login, logout, isAuthenticated: Boolean(user) };
}

