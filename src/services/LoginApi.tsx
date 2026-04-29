import apiClient from "./apiClient";
import { AxiosError } from "axios";
import type {
  LoginRequestDto,
  LoginResponseDto,
} from "../types/api";

export const loginUser = async (
  values: LoginRequestDto
): Promise<LoginResponseDto> => {
  const response = await apiClient.post<LoginResponseDto>(
    "/user/login",
    values
  );
  return response.data;
};

export const logoutUser = async (): Promise<{ success: boolean }> => {
  try {
    const response = await apiClient.post<{ success: boolean }>(
      "/auth/logout"
    );
    return response.data;
  } catch (error) {
    throw error as AxiosError;
  }
};
