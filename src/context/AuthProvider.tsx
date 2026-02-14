import  {
  createContext,
  useState,
  useContext,
  useEffect,
} from "react";
import type {ReactNode} from "react"
import { fetchUserAuth } from "../services/authApi";
import { loginUser, logoutUser } from "../services/LoginApi";
import { setupTokenRefresh, clearTokenRefresh, manualTokenRefresh } from "../utils/tokenRefresh";
import { useMutation } from "@tanstack/react-query";
/* =====================
   Types & Interfaces
===================== */

interface User {
  // adjust this to match your backend user object
  id: string;
  email: string;
  name?: string;
}

interface LoginValues {
  userName_or_email: string;
  password: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  sessionId: string | null;
  login: (values: LoginValues) => Promise<void>;
  logout: () => Promise<void>;
  isAuthPending: boolean;
  isAuthError: boolean;
  authErrorMessage: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

/* =====================
   Context
===================== */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* =====================
   Provider
===================== */

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


  /* =====================
     Auth Check
  ===================== */

  const checkAuth = async (): Promise<void> => {
    setIsAuthPending(true);
    try {
      const data = await fetchUserAuth();

      if (data) {
        setIsAuthenticated(true);
        setUser(data as User);
        setIsAuthError(false);
        setAuthErrorMessage("");
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setIsAuthError(true);
        setAuthErrorMessage("Failed to authenticate user.");
      }
    } catch (error) {
      const err = error as Error;
      setIsAuthenticated(false);
      setUser(null);
      setIsAuthError(true);
      setAuthErrorMessage(err.message);
    } finally {
      setIsAuthPending(false);
    }
  };

  /* =====================
     On Mount
  ===================== */

  useEffect(() => {
    console.log("useEffect triggered: checking auth status");
    checkAuth();
    
    // Try to refresh token if user is already authenticated
    // This ensures the token stays fresh on app reload
    const initTokenRefresh = async () => {
      const refreshed = await manualTokenRefresh();
      if (refreshed) {
        setupTokenRefresh();
      }
    };
    
    initTokenRefresh();
    
    // Cleanup on unmount
    return () => {
      clearTokenRefresh();
    };
  }, []);

  /* =====================
     Login
  ===================== */
  const login = async (values: LoginValues): Promise<void> => {
    console.log("login function called");
    try {
      setIsAuthPending(true);
      const data = await loginMutation.mutateAsync(values);
      // Use login response directly to set auth state instead of re-checking.
      setIsAuthenticated(true);
      setUser(data as unknown as User);
      setSessionId((data as any)?.session_id || null);
      setIsAuthError(false);
      setAuthErrorMessage("");
      setupTokenRefresh();
      console.log("Login successful, user set from login response");
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

  /* =====================
     Logout
  ===================== */

  const logout = async (): Promise<void> => {
    console.log("logout function called");
    try {
      
      // Clear token refresh interval on logout
      clearTokenRefresh();
      await logOutMutation.mutateAsync();
      setIsAuthenticated(false);
      setUser(null);
      setSessionId(null);
    } catch (error) {
      console.error("logout onError:", error);
      setIsAuthError(true);
    }
  };

  /* =====================
     Helpers
  ===================== */


  console.log("AuthProvider state:", {
    isAuthenticated,
    user,
    isAuthPending,
    isAuthError,
  });

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

/* =====================
   Hook
===================== */

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
