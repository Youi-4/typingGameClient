import apiClient from "./apiClient";
import { AxiosError } from "axios";

// Adjust this to match your backend user shape
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

// Function to validate authentication status
export const validateAuth = async (): Promise<AuthUser | AxiosError> => {
  try {
    const response = await apiClient.get<AuthUser>("/auth/get-loggedin-user");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// API call for checking authentication status
export const fetchUserAuth = async (): Promise<AuthUser | AxiosError> => {
  try {
    console.log("Fetching user authentication status");
    const response = await apiClient.get<AuthUser>("/auth/status");
    console.log("fetchUserAuth response:", response.data);
    return response.data;
  } catch (error) {
    console.log("fetchUserAuth error:", error);
    throw error;
  }
};
