import { createContext } from "react";

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  sessionId: string | null;
  login: (values: LoginValues) => Promise<void>;
  logout: () => Promise<void>;
  isAuthPending: boolean;
  isAuthError: boolean;
  authErrorMessage: string;
}

export interface User {
  id: string;
  email: string;
  userName?: string;
}

export interface LoginValues {
  userName_or_email: string;
  password: string;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
