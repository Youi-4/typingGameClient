import apiClient from "./apiClient";
import type { SignupRequestDto, SignupResponseDto } from "../types/api";

export const signUp = async (values: SignupRequestDto): Promise<SignupResponseDto> => {
  const response = await apiClient.post<SignupResponseDto>("/user/signup", values);
  return response.data;
};
