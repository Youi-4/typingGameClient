import apiClient from "./apiClient";
import type { UserProfile } from "../context/UserProfileContext";

interface SessionUserResponse {
  user: {
    user: string;
    bio: string | null;
    avatar_color: string | null;
  };
}

export const getProfileBySession = async (): Promise<UserProfile> => {
  const response = await apiClient.post<SessionUserResponse>("/user/profile/get/userBySession");
  const { user } = response.data;
  return {
    username: user.user,
    bio: user.bio ?? null,
    avatar_color: user.avatar_color ?? null,
  };
};

export const setProfileOnServer = async (selectedProfile: UserProfile): Promise<UserProfile> => {
  const response = await apiClient.post<UserProfile>("/user/profile/set", {
    bio: selectedProfile.bio,
    avatarColor: selectedProfile.avatar_color,
  });
  return response.data;
};
