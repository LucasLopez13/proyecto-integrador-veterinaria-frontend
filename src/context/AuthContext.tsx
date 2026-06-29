import {
  createContext,
  useState,
  useEffect,
  
} from "react";
import type {ReactNode} from "react";
import type { User } from "../types/User";

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

export const AuthContext =
  createContext<AuthContextType>(
    {} as AuthContextType
  );

interface Props {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: Props) {
  const [user, setUser] =
    useState<User | null>(null);

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);

    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );
  };

  const logout = () => {
    setUser(null);

    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}