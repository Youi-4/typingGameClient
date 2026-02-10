import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true,
});

export default apiClient;

// Rationale:
// Creating a custom Axios instance for API calls
// This instance is pre-configured with base settings like the base URL,
// which can be reused across the application for making API requests.
