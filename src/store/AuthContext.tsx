import React, { createContext, useContext, useState, ReactNode } from 'react';

type User = { id: string; name: string; role?: string } | null;

type AuthContextType = {
  user: User;
  token: string | null;
  signin: (token: string, user: User) => void;
  signout: () => void;
};

const defaultContextValue: AuthContextType = {
  user: null,
  token: null,
  signin: () => undefined,
  signout: () => undefined,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  return ctx ?? defaultContextValue;
};

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);

  const signin = (t: string, u: User) => {
    setToken(t);
    setUser(u);
  };

  const signout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, signin, signout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
