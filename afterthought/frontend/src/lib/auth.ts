import { create } from "zustand";

import { apiFetch, apiUrl } from "@/lib/api";
import type { User } from "@/lib/types";

export type AuthStatus = "idle" | "loading" | "authenticated" | "anonymous";

interface AuthState {
  user: User | null;
  status: AuthStatus;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<User>;
  register: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
}

let initialization: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  status: "idle",
  initialize: async () => {
    if (get().status !== "idle") return;
    if (initialization) return initialization;
    set({ status: "loading" });
    initialization = apiFetch<User>("/api/auth/me")
      .then((user) => set({ user, status: "authenticated" }))
      .catch(() => set({ user: null, status: "anonymous" }))
      .finally(() => {
        initialization = null;
      });
    return initialization;
  },
  login: async (email, password) => {
    const body = new URLSearchParams({ username: email, password });
    const response = await fetch(apiUrl("/api/auth/token"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!response.ok) {
      throw new Error(
        response.status === 429
          ? "Too many sign-in attempts. Please wait and try again."
          : "Email or password is incorrect.",
      );
    }
    const user = await apiFetch<User>("/api/auth/me");
    set({ user, status: "authenticated" });
    return user;
  },
  register: async (email, password, displayName) => {
    await apiFetch<User>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        display_name: displayName || null,
      }),
    });
  },
  logout: async () => {
    try {
      await apiFetch<void>("/api/auth/logout", { method: "POST" });
    } finally {
      set({ user: null, status: "anonymous" });
    }
  },
}));
