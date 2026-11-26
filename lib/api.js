import axios from "axios";

// Create a reusable Axios instance for communicating with the backend API.
const api = axios.create({
  // Set the base URL using the API address stored in the environment variables.
  baseURL: process.env.NEXT_PUBLIC_API_URL,

  // Define the default headers sent with API requests.
  headers: {
    "Content-Type": "application/json",

    // Identify the workspace associated with the API request.
    "Workspaces-Identifier": process.env.NEXT_PUBLIC_WORKSPACE_ID,

    // Identify the application or machine making the API request.
    "X-Integration-Name": process.env.NEXT_PUBLIC_INTEGRATION_NAME,
  },
});

// Register a request interceptor to modify requests before they are sent.
// This allows the authentication token to be attached automatically.
api.interceptors.request.use((config) => {
  // Check that the code is running in the browser before accessing browser APIs.
  if (typeof window !== "undefined") {
    // Retrieve the user's authentication token from sessionStorage.
    const token = sessionStorage.getItem("workspace_token");

    // Only attach the Authorization header if a token exists.
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  // Return the modified configuration so Axios can continue with the request.
  return config;
});

// Export the configured Axios instance for use throughout the application.
export default api;
