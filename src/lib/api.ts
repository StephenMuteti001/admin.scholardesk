import axios from "axios";

import { clearAuth } from "@/services/authService";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://api.scholardesk.pro/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  xsrfCookieName: "csrf_access_token",
  xsrfHeaderName: "X-CSRF-TOKEN",
});

/* ----------------------------------------
 * Request interceptor
 * --------------------------------------*/
api.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    if (typeof document !== "undefined") {
      const match = document.cookie.match(/(?:^|;\s*)csrf_access_token=([^;]+)/);
      if (match) {
        config.headers["X-CSRF-TOKEN"] = decodeURIComponent(match[1]);
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/* ----------------------------------------
 * Response interceptor
 * --------------------------------------*/
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      clearAuth();
      if (typeof window !== "undefined") window.dispatchEvent(new Event("scholardesk:auth-required"));
    } else if (status === 403 && typeof window !== "undefined") {
      window.dispatchEvent(new Event("scholardesk:access-denied"));
    }
    return Promise.reject(error);
  },
);

export default api;
