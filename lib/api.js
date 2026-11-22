
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
    "Workspaces-Identifier":
      process.env.NEXT_PUBLIC_WORKSPACE_ID,
    "X-Integration-Name":
      process.env.NEXT_PUBLIC_INTEGRATION_NAME,
  },
});

// Attach the bearer token to authenticated requests
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = sessionStorage.getItem("workspace_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default api;
