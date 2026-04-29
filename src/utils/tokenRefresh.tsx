import apiClient from "../services/apiClient";

let refreshInterval: number | null = null;

export const refreshAuthToken = async (): Promise<boolean> => {
  try {
    const response = await apiClient.post("/auth/refresh");
    return response.data.success === true;
  } catch {
    return false;
  }
};

export const setupTokenRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }

  const refreshIntervalMs = 6 * 24 * 60 * 60 * 1000;

  refreshInterval = setInterval(async () => {
    const success = await refreshAuthToken();
    if (!success) {
      clearTokenRefresh();
    }
  }, refreshIntervalMs);
};

export const clearTokenRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};
