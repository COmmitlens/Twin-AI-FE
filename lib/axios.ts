import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/v1";

const api = axios.create({
  baseURL:
    process.env.NODE_ENV === "development" ? "http://localhost:8000/v1" : "/v1",
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
