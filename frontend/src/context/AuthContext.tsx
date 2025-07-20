// src/context/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import jwtDecode from 'jwt-decode';
import setAuthToken from '../utils/setAuthToken';

interface AuthUser {
  id: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decodedToken: { user: AuthUser; exp: number } = jwtDecode(storedToken);
        // Check if the token is expired
        if (decodedToken.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setAuthToken(null);
        } else {
          setToken(storedToken);
          setUser(decodedToken.user);
          setAuthToken(storedToken);
        }
      } catch (error) {
        // Handle invalid token
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setAuthToken(null);
      }
    }
    setLoading(false);
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    const decodedToken: { user: AuthUser } = jwtDecode(newToken);
    setToken(newToken);
    setUser(decodedToken.user);
    setAuthToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};