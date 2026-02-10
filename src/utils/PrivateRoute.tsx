import React from "react";
import type { ReactNode } from "react"
import { Navigate } from "react-router-dom";
// import { useLocation } from "react-router-dom";
import { useAuthContext } from "../context/AuthProvider";
import { useUserProfileContext } from "../context/UserProfileProvider";
// import NotFound from "../pages/Not_Found";

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
//   allowedRoles = [],
}) => {
  const { isAuthenticated, isAuthPending, isAuthError } =
    useAuthContext();

  const { profile, isSettingProfile } = useUserProfileContext();
//   const location = useLocation();

  console.log(
    "PrivateRoute - ",
    "isAuthenticated:",
    isAuthenticated,
    ", isAuthPending:",
    isAuthPending,
    ", isAuthError:",
    isAuthError,
    ", profile:",
    profile
  );

  // Show a loading state while checking authentication or fetching profile
  if (isAuthPending || isSettingProfile) {
    return <h1>Loading...</h1>;
  }

  // Redirect to login if not authenticated or if there was an error
  if (isAuthError || !isAuthenticated) {
    return <Navigate to="/Login" replace />;
  }

  // --------------------------------------------------
  // OPTIONAL ROLE / PROFILE LOGIC (typed & ready)
  // --------------------------------------------------

//   if (
//     user?.roles.includes("student") &&
//     !profile &&
//     location.pathname !== "/profile/select"
//   ) {
//     return <Navigate to="/profile/select" replace />;
//   }

//   if (allowedRoles.length > 0) {
//     const userHasRequiredRole = allowedRoles.some((role) =>
//       user?.roles.includes(role)
//     );

//     if (!userHasRequiredRole) {
//       return <NotFound />;
//     }
//   }

  // Render children if authenticated (and authorized, if enabled)
  return <>{children}</>;
};

export default PrivateRoute;
