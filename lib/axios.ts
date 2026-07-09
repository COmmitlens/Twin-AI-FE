import axios from "axios";
import { getApiUrl } from "@/lib/env";

const api = axios.create({
  baseURL: getApiUrl(),
  withCredentials: true, // CRITICAL: Send HTTP-only cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect if it's the session validation endpoint
      // Let the auth context handle it
      const isValidateEndpoint = error.config?.url?.includes("/auth/validate");

      if (!isValidateEndpoint) {
        // Token expired or invalid - redirect to login
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/login")
        ) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
