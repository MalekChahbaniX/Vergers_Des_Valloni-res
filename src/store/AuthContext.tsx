import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Keychain from 'react-native-keychain';
import { setAuthToken } from '../services/api';

type User = { id: string; name: string; role?: string } | null;

type AuthContextType = {
  user: User;
  token: string | null;
  /** true while the stored session is being restored on app launch */
  isLoading: boolean;
  signin: (token: string, user: User) => Promise<void>;
  signout: () => Promise<void>;
};

// react-native-keychain stores one username/password pair per "service",
// so token + user are bundled into a single JSON blob under one service key.
const SERVICE = 'vlaws_auth';

// Session is invalidated if the app was backgrounded for longer than this.
// Adjust to match the "expiration automatique après inactivité prolongée" requirement.
const INACTIVITY_LIMIT_MS = 15 * 60 * 1000; // 15 minutes

const defaultContextValue: AuthContextType = {
  user: null,
  token: null,
  isLoading: true,
  signin: async () => undefined,
  signout: async () => undefined,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  return ctx ?? defaultContextValue;
};

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const backgroundedAt = useRef<number | null>(null);

  const signout = async () => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
    try {
      await Keychain.resetGenericPassword({ service: SERVICE });
    } catch (err) {
      console.warn('Auth clear failed', err);
    }
  };

  // Restore a persisted session when the app cold-starts.
  useEffect(() => {
    const restore = async () => {
      try {
        const creds = await Keychain.getGenericPassword({ service: SERVICE });
        if (creds) {
          const parsed = JSON.parse(creds.password) as { token: string; user: User };
          setToken(parsed.token);
          setUser(parsed.user);
          setAuthToken(parsed.token);
        }
      } catch (err) {
        console.warn('Auth restore failed', err);
      } finally {
        setIsLoading(false);
      }
    };
    restore();
  }, []);

  // Auto sign-out if the app comes back from background after too long.
  useEffect(() => {
    const handleAppStateChange = (next: AppStateStatus) => {
      if (next === 'background' || next === 'inactive') {
        backgroundedAt.current = Date.now();
        return;
      }
      if (next === 'active' && backgroundedAt.current) {
        const elapsed = Date.now() - backgroundedAt.current;
        backgroundedAt.current = null;
        if (elapsed > INACTIVITY_LIMIT_MS) {
          signout();
        }
      }
    };
    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signin = async (t: string, u: User) => {
    setToken(t);
    setUser(u);
    setAuthToken(t);
    try {
      // username field is unused here, only the JSON payload in "password" matters
      await Keychain.setGenericPassword('auth', JSON.stringify({ token: t, user: u }), {
        service: SERVICE,
      });
    } catch (err) {
      console.warn('Auth persist failed', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signin, signout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;