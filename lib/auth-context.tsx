"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import api from "@/lib/axios";

interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; message?: string; data?: any }>;
  logout: () => Promise<void>;
  register: (
    userData: RegisterData,
  ) => Promise<{ success: boolean; message?: string; data?: any }>;
  verifyOTP: (
    id: string,
    email: string,
    otp: string,
  ) => Promise<{ success: boolean; message?: string }>;
  validateSession: () => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const validateSession = useCallback(async () => {
    try {
      const response = await api.get("/auth/validate");
      console.log("Session validation response:", response.data);
      if (
        response.data.message === "success" ||
        response.data.message === "Success"
      ) {
        setUser(response.data.data);
        setIsAuthenticated(true);
        console.log("Session validated successfully");
      } else {
        console.log("Session validation failed: unexpected message format");
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error: any) {
      // 401 is expected when not authenticated - don't log as error
      if (error.response?.status === 401) {
        console.log("No active session");
      } else {
        console.error("Session validation error:", error);
      }
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Validate session on mount
  useEffect(() => {
    validateSession();
  }, [validateSession]);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password });

      if (
        response.data.message === "success" ||
        response.data.message === "Success"
      ) {
        setUser(response.data.data);
        setIsAuthenticated(true);
        return { success: true, data: response.data.data };
      }

      return { success: false, message: "Login failed" };
    } catch (error: any) {
      const message = error.response?.data?.message || "Login failed";
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await api.get("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear state regardless of API response
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await api.post("/auth/register", userData);
      return { success: true, data: response.data.data };
    } catch (error: any) {
      const message = error.response?.data?.message || "Registration failed";
      return { success: false, message };
    }
  };

  const verifyOTP = async (id: string, email: string, otp: string) => {
    try {
      const response = await api.post("/auth/verify-otp", {
        id: parseInt(id, 10),
        email,
        otp,
      });
      return { success: true, message: response.data.data };
    } catch (error: any) {
      const message =
        error.response?.data?.message || "OTP verification failed";
      return { success: false, message };
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    verifyOTP,
    validateSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
