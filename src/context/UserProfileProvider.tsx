import React from "react";
import type { ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  setProfileOnServer,
  getProfileBySession
} from "../services/userProfileApi";
import { useAuthContext } from "./useAuthContext";
import { UserProfileContext } from "./UserProfileContext";
import type { UserProfile } from "./UserProfileContext";

interface UserProfileProviderProps {
  children: ReactNode;
}

export const UserProfileProvider: React.FC<UserProfileProviderProps> = ({
  children,
}) => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthContext();

  const profileQuery = useQuery({
    queryKey: ["userProfile"],
    queryFn: getProfileBySession,
    enabled: isAuthenticated,
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
