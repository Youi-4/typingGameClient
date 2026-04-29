import React from "react";
import type { ReactNode } from "react"
import { Navigate } from "react-router-dom";
import { useAuthContext } from "../context/useAuthContext";
import { useUserProfileContext } from "../context/useUserProfileContext";

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, isAuthPending, isAuthError } = useAuthContext();
  const { isSettingProfile } = useUserProfileContext();

  if (isAuthPending || isSettingProfile) {
    return <h1>Loading...</h1>;
  }

  if (isAuthError || !isAuthenticated) {
    return <Navigate to="/Login" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
