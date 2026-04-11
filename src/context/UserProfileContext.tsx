import { createContext } from "react";

export interface UserProfile {
  username: string;
  bio: string | null;
  avatar_color: string | null;
}

export interface UserProfileContextValue {
  profile: UserProfile | null;
  isSettingProfile: boolean;
  isSettingProfileError: boolean;
  handleProfileSelection: (selectedProfile: UserProfile) => void;
}

export const UserProfileContext = createContext<UserProfileContextValue | undefined>(
  undefined
);
