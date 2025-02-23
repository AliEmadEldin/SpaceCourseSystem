import { create } from "zustand";
import { apiRequest } from "./queryClient";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  token: null,
  isAuthenticated: false,
  isAdmin: false,
  login: async (email: string, password: string) => {
    const res = await apiRequest("POST", "/api/auth/login", { email, password });
    const { token } = await res.json();
    const payload = JSON.parse(atob(token.split(".")[1]));
    set({ 
      token, 
      isAuthenticated: true,
      isAdmin: payload.role === "admin"
    });
  },
  register: async (email: string, password: string) => {
    const res = await apiRequest("POST", "/api/auth/register", { email, password });
    const { token } = await res.json();
    const payload = JSON.parse(atob(token.split(".")[1]));
    set({ 
      token, 
      isAuthenticated: true,
      isAdmin: payload.role === "admin"
    });
  },
  logout: () => {
    set({ token: null, isAuthenticated: false, isAdmin: false });
  }
}));
