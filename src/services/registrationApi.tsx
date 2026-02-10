import apiClient from "./apiClient";
export interface SignUpValues {
  email: string;
  password: string;
  user:string;
  verified: string;
}

export const signUp = async (values:SignUpValues) => {
  const response = await apiClient.post<SignUpValues>("/user/signup", values);
  console.log("signUp res", response);
  console.log("signUp res data", response.data);
  return response.data; // Accessing the data property of the Axios response
};