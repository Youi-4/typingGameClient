import React, {
  createContext,
  useState,
  useEffect,
  useContext,

} from "react";
import type { ReactNode } from "react";
import { usePostData } from "../hooks/usePostData";
import {
  getProfileFromServer,
  setProfileOnServer,
} from "../services/userProfileApi";

/**
 * Adjust this to match the real profile shape
 */
export interface UserProfile {
  // example:
  // id: string;
  // name: string;
  [key: string]: any;
}

interface UserProfileContextValue {
  profile: UserProfile | null;
  isSettingProfile: boolean;
  isSettingProfileError: boolean;
  handleProfileSelection: (selectedProfile: UserProfile) => void;
}

const UserProfileContext = createContext<UserProfileContextValue | undefined>(
  undefined
);

interface UserProfileProviderProps {
  children: ReactNode;
}

export const UserProfileProvider: React.FC<UserProfileProviderProps> = ({
  children,
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Fetch the profile from the server when the component mounts
  useEffect(() => {
    const fetchProfile = async (): Promise<void> => {
      try {
        const profileData = await getProfileFromServer();
        setProfile(profileData);
        console.log("Profile fetched from server:", profileData);
      } catch (error) {
        console.error("Failed to fetch profile from server:", error);
      }
    };

    fetchProfile();
  }, []);

  const mutation = usePostData(
    setProfileOnServer,
    ["studentPlacementSubjects"],
    () => {
      console.log("Profile set successfully on server");
    },
    false
  );

  const saveProfileToServer = mutation.mutate;
  const isSettingProfile = mutation.status === "pending";
  const isSettingProfileError = mutation.status === "error";

  const handleProfileSelection = (selectedProfile: UserProfile): void => {
    saveProfileToServer(selectedProfile, {
      onSuccess: () => {
        setProfile(selectedProfile);
      },
      onError: (error: unknown) => {
        console.error("Error setting profile on server:", error);
      },
    });
  };

  return (
    <UserProfileContext.Provider
      value={{
        profile,
        isSettingProfile,
        isSettingProfileError,
        handleProfileSelection,
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfileContext = (): UserProfileContextValue => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error(
      "useUserProfileContext must be used within a UserProfileProvider"
    );
  }
  return context;
};
