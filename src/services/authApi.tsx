import apiClient from "./apiClient";
import { AxiosError } from "axios";
import type { AuthUser } from "../types/sharedInterfaces";

// API call for checking authentication status
export const fetchUserAuth = async (): Promise<AuthUser | AxiosError> => {
  try {
    const response = await apiClient.get<AuthUser>("/auth/status");
    return response.data;
  } catch (error) {
    const status = (error as AxiosError)?.response?.status;
    if (status !== 401) {
      console.log("fetchUserAuth error:", error);
    }
    throw error;
  }
};

// Fetch a short-lived token for Socket.IO auth (goes through Vercel proxy so cookies work)
export const fetchSocketToken = async (): Promise<string> => {
  const response = await apiClient.get<{ socketToken: string }>("/auth/socket-token");
  return response.data.socketToken;
};

// Fetch a short-lived guest token for Socket.IO auth (no account required)
export const fetchGuestToken = async (): Promise<string> => {
  const response = await apiClient.get<{ socketToken: string }>("/auth/guest-token");
  return response.data.socketToken;
};
