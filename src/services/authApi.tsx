import apiClient from "./apiClient";
import { AxiosError } from "axios";
import type {
  AuthStatusResponseDto,
  SocketTokenResponseDto,
} from "../types/api";

// API call for checking authentication status
export const fetchUserAuth = async (): Promise<AuthStatusResponseDto | AxiosError> => {
  try {
    const response = await apiClient.get<AuthStatusResponseDto>("/auth/status");
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
  const response = await apiClient.get<SocketTokenResponseDto>("/auth/socket-token");
  return response.data.socketToken;
};

// Fetch a short-lived guest token for Socket.IO auth (no account required)
export const fetchGuestToken = async (): Promise<string> => {
  const response = await apiClient.get<SocketTokenResponseDto>("/auth/guest-token");
  return response.data.socketToken;
};
