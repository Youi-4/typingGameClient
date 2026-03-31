import { useContext } from "react";
import { UserProfileContext } from "./UserProfileContext";
import type { UserProfileContextValue } from "./UserProfileContext";

export const useUserProfileContext = (): UserProfileContextValue => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error(
      "useUserProfileContext must be used within a UserProfileProvider"
    );
  }
  return context;
};
