import apiClient from "./apiClient";


export const getUserBySession = async (values:string) => {
  const response = await apiClient.post<string>("/profile/get/userBySession", values);
  console.log("signUp res", response);
  console.log("signUp res data", response.data);
  return response.data; // Accessing the data property of the Axios response
};