import React, { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProfileFromServer,
  setProfileOnServer,
  getProfileBySession
} from "../services/userProfileApi";
import { useAuthContext } from "./AuthProvider";

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
  const queryClient = useQueryClient();
  
  const profileQuery = useQuery({
    queryKey: ["userProfile"],
    queryFn: getProfileBySession,
  });

  const mutation = useMutation({
    mutationKey: ["userProfile", "set"],
    mutationFn: setProfileOnServer,
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(["userProfile"], updatedProfile);
      console.log("Profile set successfully on server");
    },
  });

  const isSettingProfile = mutation.isPending;
  const isSettingProfileError = mutation.isError;
  const profile = profileQuery.data ?? null;

  const handleProfileSelection = (selectedProfile: UserProfile): void => {
    mutation.mutate(selectedProfile, {
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
