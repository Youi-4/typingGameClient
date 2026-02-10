import React from "react";
import type { ReactNode }  from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthProvider";
interface PublicRouteProps {
  children: ReactNode;
}
const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, isAuthPending } = useAuthContext();

  console.log(
    "PublicRoute - ",
    "isAuthenticated:",
    isAuthenticated,
    ", isAuthPending:",
    isAuthPending
  );

  // Show a loading state while checking authentication
  if (isAuthPending) {
    return <h1>Loading...</h1>;
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/Home"  />;
  }

  // Render the children components if not authenticated
  return <>{children}</>;
};

export default PublicRoute;
