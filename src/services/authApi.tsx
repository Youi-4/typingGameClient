import apiClient from "./apiClient";
import type {
  AuthStatusResponseDto,
  SocketTokenResponseDto,
} from "../types/api";

export const fetchUserAuth = async (): Promise<AuthStatusResponseDto> => {
  const response = await apiClient.get<AuthStatusResponseDto>("/auth/status");
  return response.data;
};

export const fetchSocketToken = async (): Promise<string> => {
  const response = await apiClient.get<SocketTokenResponseDto>("/auth/socket-token");
  return response.data.socketToken;
};

export const fetchGuestToken = async (): Promise<string> => {
  const response = await apiClient.get<SocketTokenResponseDto>("/auth/guest-token");
  return response.data.socketToken;
};
