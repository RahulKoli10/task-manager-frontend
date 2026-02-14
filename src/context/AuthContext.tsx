"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "@/lib/axios";

interface User {
  id: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const setAuth = (user: User, token: string) => {
    setUser(user);
    setToken(token);

    // ✅ Set axios default header
    axios.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${token}`;
  };

  const logout = async () => {
    await axios.post("/auth/logout");
    setUser(null);
    setToken(null);

    //  Remove header on logout
    delete axios.defaults.headers.common["Authorization"];
  };

  // Restore session on refresh
useEffect(() => {
  const restoreSession = async () => {
    try {
      const res = await axios.post("/auth/refresh");

      setUser(res.data.user);
      setToken(res.data.accessToken);

      // 🔥 THIS WAS MISSING
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${res.data.accessToken}`;

    } catch (error) {
      setUser(null);
      setToken(null);
      delete axios.defaults.headers.common["Authorization"];
    } finally {
      setLoading(false);
    }
  };

  restoreSession();
}, []);



  return (
    <AuthContext.Provider
      value={{ user, token, loading, setAuth, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth must be used within AuthProvider");
  return context;
};
