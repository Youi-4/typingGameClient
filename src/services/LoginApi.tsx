import apiClient from "./apiClient";
import { AxiosError } from "axios";
import type {
  LoggedInUserResponseDto,
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

// Get currently logged-in user
export const getLoggedinUser = async () => {
  try {
    const response = await apiClient.get<LoggedInUserResponseDto>(
      "/auth/get-loggedin-user"
    );
    return response.data.user;
  } catch (error) {
    throw error as AxiosError;
  }
};

// API call for logging out
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
