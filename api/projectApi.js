import apiClient from "./apiClient";

export const projectApi = {
  getAll: () => apiClient.get("/projects"),
  getOne: (id) => apiClient.get(`/projects/${id}`),
  create: (data) => apiClient.post("/projects", data),
  update: (id, data) => apiClient.patch(`/projects/${id}`, data),
  delete: (id) => apiClient.delete(`/projects/${id}`),
  addMember: (id, data) => apiClient.post(`/projects/${id}/members`, data),
  removeMember: (id, userId) => apiClient.delete(`/projects/${id}/members/${userId}`),
};

export const taskApi = {
  getAll: (projectId, params) => apiClient.get(`/projects/${projectId}/tasks`, { params }),
  getOne: (projectId, taskId) => apiClient.get(`/projects/${projectId}/tasks/${taskId}`),
  create: (projectId, data) => apiClient.post(`/projects/${projectId}/tasks`, data),
  update: (projectId, taskId, data) => apiClient.patch(`/projects/${projectId}/tasks/${taskId}`, data),
  move: (projectId, taskId, data) => apiClient.patch(`/projects/${projectId}/tasks/${taskId}/move`, data),
  delete: (projectId, taskId) => apiClient.delete(`/projects/${projectId}/tasks/${taskId}`),
  addComment: (projectId, taskId, data) => apiClient.post(`/projects/${projectId}/tasks/${taskId}/comments`, data),
  deleteComment: (projectId, taskId, commentId) =>
    apiClient.delete(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`),
};

export const columnApi = {
  create: (projectId, data) => apiClient.post(`/projects/${projectId}/columns`, data),
  update: (projectId, columnId, data) => apiClient.patch(`/projects/${projectId}/columns/${columnId}`, data),
  delete: (projectId, columnId) => apiClient.delete(`/projects/${projectId}/columns/${columnId}`),
  reorder: (projectId, data) => apiClient.patch(`/projects/${projectId}/columns/reorder`, data),
};
