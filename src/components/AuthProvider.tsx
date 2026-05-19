import React, { createContext, useContext, useState, useCallback } from "react";
import { api } from "../lib/api";

export interface UserProfile {
  id: number; username: string; xp: number; wins: number;
  gamesPlayed: number; currentStreak: number; bestStreak: number;
  rank: string; rankIcon: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  login: (data: { username: string; password: string }) => Promise<void>;
  register: (data: { username: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("opd_token"));
  const [user, setUser] = useState<UserProfile | null>(null);

  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem("opd_token")) return;
    try { setUser(await api.get<UserProfile>("/api/user/profile")); } catch { /* noop */ }
  }, []);

  // Load user on mount if token exists
  React.useEffect(() => { if (token) refreshUser(); }, []);

  const login = async (data: { username: string; password: string }) => {
    const res = await api.post<{ token: string; user: UserProfile }>("/api/auth/login", data);
    localStorage.setItem("opd_token", res.token);
    setToken(res.token); setUser(res.user);
  };

  const register = async (data: { username: string; email: string; password: string }) => {
    const res = await api.post<{ token: string; user: UserProfile }>("/api/auth/register", data);
    localStorage.setItem("opd_token", res.token);
    setToken(res.token); setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem("opd_token"); setToken(null); setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
