import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, users, getUserById } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  login: (userId: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('af_user_id');
    if (saved) {
      const found = getUserById(saved);
      if (found) setUser(found);
    }
  }, []);

  const login = (userId: string) => {
    const found = getUserById(userId);
    if (found) {
      setUser(found);
      localStorage.setItem('af_user_id', userId);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('af_user_id');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export { users };
