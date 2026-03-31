import { createContext } from "react";

export interface UserProfile {
  [key: string]: unknown;
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
