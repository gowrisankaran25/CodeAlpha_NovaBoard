import apiClient from "./apiClient";

export const authApi = {
  register: (data) => apiClient.post("/auth/register", data),
  login: (data) => apiClient.post("/auth/login", data),
  getMe: () => apiClient.get("/auth/me"),
  updateProfile: (data) => apiClient.patch("/auth/me", data),
};
