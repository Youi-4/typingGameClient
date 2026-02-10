import apiClient from "./apiClient";
import { AxiosError } from "axios";

/** ---- Types ---- */

// Login form values
export interface LoginValues {
  userName_or_email: string;
  password: string;
}

// Adjust to match your backend response
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

/** ---- API calls ---- */

// API call for logging in
export const loginUser = async (
  values: LoginValues
): Promise<LoginValues> => {
  const response = await apiClient.post<LoginValues>(
    "/user/login",
    values
  );
  console.log("loginUser response:", response);
  return response.data;
};

// Get currently logged-in user
export const getLoggedinUser = async (): Promise<AuthUser> => {
  try {
    const response = await apiClient.get<AuthUser>(
      "/auth/get-loggedin-user"
    );
    return response.data;
  } catch (error) {
    console.log("error fetching user:", error);
    throw error as AxiosError;
  }
};

// API call for logging out
export const logoutUser = async (): Promise<{ success: boolean }> => {
  try {
    const response = await apiClient.post<{ success: boolean }>(
      "/auth/logout"
    );
    console.log("logoutUser response:", response.data);
    return response.data;
  } catch (error) {
    console.log("logoutUser error:", error);
    throw error as AxiosError;
  }
};
