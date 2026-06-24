import { create } from "zustand";
import { api, setAccessToken } from "@/lib/api";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";

  setSession: (accessToken: string, user: User) => void;
  setUser: (user: User) => void;
  clear: () => void;
  /** Attempt to restore a session via the refresh cookie on app start. */
  bootstrap: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  status: "idle",

  setSession: (accessToken, user) => {
    setAccessToken(accessToken);
    set({ accessToken, user, status: "authenticated" });
  },

  setUser: (user) => set({ user }),

  clear: () => {
    setAccessToken(null);
    set({ user: null, accessToken: null, status: "unauthenticated" });
  },

  bootstrap: async () => {
    set({ status: "loading" });
    try {
      const { data } = await api.post<{ accessToken: string }>(
        "/auth/refresh",
        {},
      );
      setAccessToken(data.accessToken);
      const me = await api.get<User>("/users/me");
      set({
        accessToken: data.accessToken,
        user: me.data,
        status: "authenticated",
      });
    } catch {
      setAccessToken(null);
      set({ user: null, accessToken: null, status: "unauthenticated" });
    }
  },
}));
