import {
  useState,
  useEffect,
} from "react";
import type { ReactNode } from "react"
import { fetchUserAuth } from "../services/authApi";
import { loginUser, logoutUser } from "../services/LoginApi";
import { setupTokenRefresh, clearTokenRefresh, manualTokenRefresh } from "../utils/tokenRefresh";
import { useMutation } from "@tanstack/react-query";
import { AuthContext } from "./AuthContext";
import type { User, LoginValues } from "./AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isAuthPending, setIsAuthPending] = useState<boolean>(true);
  const [isAuthError, setIsAuthError] = useState<boolean>(false);
  const [authErrorMessage, setAuthErrorMessage] = useState<string>("");
  const loginMutation = useMutation({
    mutationKey: ["login"],
    mutationFn: loginUser,
  });
    const logOutMutation = useMutation({
    mutationKey: ["logout"],
    mutationFn: logoutUser,
  });

  const checkAuth = async (): Promise<boolean> => {
    setIsAuthPending(true);
    try {
      const data = await fetchUserAuth();

      if ("success" in data && data.success) {
        setIsAuthenticated(true);
        setUser(data.user);
        setIsAuthError(false);
        setAuthErrorMessage("");
        return true;
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setIsAuthError(true);
        setAuthErrorMessage("Failed to authenticate user.");
        return false;
      }
    } catch (error) {
      const err = error as Error;
      setIsAuthenticated(false);
      setUser(null);
      setIsAuthError(true);
      setAuthErrorMessage(err.message);
      return false;
    } finally {
      setIsAuthPending(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      // Handle Google OAuth token passed via URL
      const params = new URLSearchParams(window.location.search);
      const googleToken = params.get("token");
      if (googleToken) {
        document.cookie = `token=${googleToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        params.delete("token");
        const cleanUrl = params.toString()
          ? `${window.location.pathname}?${params.toString()}`
          : window.location.pathname;
        window.history.replaceState({}, "", cleanUrl);
      }

      const authenticated = await checkAuth();
      if (authenticated) {
        const refreshed = await manualTokenRefresh();
        if (refreshed) {
          setupTokenRefresh();
        }
      }
    };

    init();

    return () => {
      clearTokenRefresh();
    };
  }, []);

  const login = async (values: LoginValues): Promise<void> => {
    try {
      setIsAuthPending(true);
      const data = await loginMutation.mutateAsync(values);
      setIsAuthenticated(true);
      setUser(data.user as User);
      setSessionId(null);
      setIsAuthError(false);
      setAuthErrorMessage("");
      setupTokenRefresh();
    } catch (error) {
      const err = error as Error;
      setIsAuthenticated(false);
      setUser(null);
      setIsAuthError(true);
      setAuthErrorMessage(err.message);
      throw err;
    } finally {
      setIsAuthPending(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      clearTokenRefresh();
      await logOutMutation.mutateAsync();
      setIsAuthenticated(false);
      setUser(null);
      setSessionId(null);
    } catch (error) {
      setIsAuthError(true);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        sessionId,
        login,
        logout,
        isAuthPending,
        isAuthError,
        authErrorMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
