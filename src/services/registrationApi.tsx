import apiClient from "./apiClient";
import type { SignUpValues } from "../types/sharedInterfaces";

export const signUp = async (values:SignUpValues) => {
  const response = await apiClient.post<SignUpValues>("/user/signup", values);
  console.log("signUp res", response);
  console.log("signUp res data", response.data);
  return response.data; // Accessing the data property of the Axios response
};