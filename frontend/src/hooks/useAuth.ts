"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, apiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { User } from "@/types";

interface AuthResponse {
  accessToken: string;
  user: User;
}

interface Credentials {
  email: string;
  password: string;
  displayName?: string;
}

/** Auth actions (register/login/logout) with loading + error state. */
export function useAuth() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const clear = useAuthStore((s) => s.clear);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(
    path: "/auth/register" | "/auth/login",
    creds: Credentials,
  ): Promise<boolean> {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post<AuthResponse>(path, creds);
      setSession(data.accessToken, data.user);
      return true;
    } catch (err) {
      setError(apiErrorMessage(err, "Não foi possível autenticar"));
      return false;
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    error,
    register: (creds: Credentials) => submit("/auth/register", creds),
    login: (creds: Credentials) => submit("/auth/login", creds),
    logout: async () => {
      try {
        await api.post("/auth/logout");
      } finally {
        clear();
        router.replace("/login");
      }
    },
  };
}
