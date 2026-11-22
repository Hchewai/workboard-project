
import api from "./api";

// Log in and store the returned bearer token
export async function login(email, password) {
  const response = await api.post("/auth/login", {
    email,
    password,
    workspace_type: "project_management",
  });

  const token = response.data.token;

  sessionStorage.setItem("workspace_token", token);

  return response.data;
}

// Retrieve the stored token
export function getToken() {
  return sessionStorage.getItem("workspace_token");
}

// Log out and remove the stored token
export function logout() {
  sessionStorage.removeItem("workspace_token");
}
