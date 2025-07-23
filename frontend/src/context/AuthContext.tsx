import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import setAuthToken from '../utils/setAuthToken';
import { FullCampaign } from '../components/CampaignDetailsModal';

interface AuthUser {
  id: string;
  role: 'user' | 'admin';
  username: string;
  avatar: string;
  isVerified: boolean; // Add this field
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
  joinedCampaigns: FullCampaign[];
  fetchJoinedCampaigns: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [joinedCampaigns, setJoinedCampaigns] = useState<FullCampaign[]>([]);

  const fetchJoinedCampaigns = useCallback(async () => {
    if (localStorage.token) {
        try {
            const res = await axios.get('/api/users/me/joined');
            setJoinedCampaigns(res.data);
        } catch (err) {
            console.error("Could not fetch joined campaigns", err);
        }
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decodedToken: { user: AuthUser; exp: number } = jwtDecode(storedToken);
        if (decodedToken.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
        } else {
          setToken(storedToken);
          setUser(decodedToken.user);
          setAuthToken(storedToken);
          fetchJoinedCampaigns();
        }
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, [fetchJoinedCampaigns]);

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    const decodedToken: { user: AuthUser } = jwtDecode(newToken);
    setToken(newToken);
    setUser(decodedToken.user); // The user object now includes isVerified
    setAuthToken(newToken);
    fetchJoinedCampaigns();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setAuthToken(null);
    setJoinedCampaigns([]);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, joinedCampaigns, fetchJoinedCampaigns }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) { throw new Error('useAuth must be used within an AuthProvider'); }
  return context;
};