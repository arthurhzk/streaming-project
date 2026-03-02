import { createContext } from 'react';

export interface AuthContextValue {
  isAuthenticated: boolean;
  userId: string | null;
  setAuthenticated: (userId: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
