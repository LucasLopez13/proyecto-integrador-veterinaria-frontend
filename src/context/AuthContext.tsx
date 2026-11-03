import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User } from "../types/User";
import { authService } from "../services/authService";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const extractRoleName = (u: any): string => {
  if (!u) return "cliente";
  if (typeof u.rol === "object" && u.rol?.nombre) {
    return String(u.rol.nombre).toLowerCase().trim();
  }
  if (typeof u.role === "object" && u.role?.nombre) {
    return String(u.role.nombre).toLowerCase().trim();
  }
  return String(u.role || u.rol || "cliente").toLowerCase().trim();
};

const normalizeUser = (u: any): User => {
  const normalizedRole = extractRoleName(u) as any;
  return {
    ...u,
    name: u.name || `${u.nombre || ""} ${u.apellido || ""}`.trim(),
    role: normalizedRole,
    rol: normalizedRole,
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? normalizeUser(JSON.parse(storedUser)) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const res = await authService.getProfile(storedToken);
          const normalized = normalizeUser(res.user);
          setUser(normalized);
          localStorage.setItem("user", JSON.stringify(normalized));
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = (newUser: User, newToken: string) => {
    const normalized = normalizeUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(normalized));
    setToken(newToken);
    setUser(normalized);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: user !== null && token !== null,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de AuthProvider");
  }

  return context;
}