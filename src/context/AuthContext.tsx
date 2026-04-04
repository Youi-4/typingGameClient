import { createContext } from "react";
import type { AuthUserDto, LoginRequestDto } from "../types/api";

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

export type User = AuthUserDto;
export type LoginValues = LoginRequestDto;

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
