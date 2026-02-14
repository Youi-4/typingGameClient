import apiClient from "./apiClient";

/**
 * Adjust these types to match your backend API response
 */
export interface UserProfile {
  // example fields:
  // id: string;
  // name: string;
  [key: string]: any;
}



export const getProfileBySession = async (): Promise<UserProfile> => {
  const response = await apiClient.post<UserProfile>("/user/profile/get/userBySession");
  console.log("Profile by session response:", response);
  console.log("Profile data:", response.data);
  return response.data;
};
// Set/update the entire profile on the server
export const setProfileOnServer = async (
  selectedProfile: UserProfile
): Promise<UserProfile> => {
  console.log("Attempting to set profile:", selectedProfile);
  const response = await apiClient.post("/user/profile/set", {
    profile: selectedProfile,
  });
  return response.data;
};

// Get the current user profile from the server
export const getProfileFromServer = async (): Promise<UserProfile> => {
  const response = await apiClient.post("/user/profile/get");
  return response.data;
};

