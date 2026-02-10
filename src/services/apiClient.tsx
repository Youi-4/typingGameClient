import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3000/api", // Set the base URL for all API requests
  // Additional default settings like headers or timeouts can be added here.
  // For example, you could add a default header for authorization if needed:
  // headers: { Authorization: `Bearer ${YOUR_AUTH_TOKEN}` }
  withCredentials: true,
});

export default apiClient;

// Rationale:
// Creating a custom Axios instance for API calls
// This instance is pre-configured with base settings like the base URL,
// which can be reused across the application for making API requests.
