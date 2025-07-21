// frontend/src/context/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import setAuthToken from '../utils/setAuthToken';
import { FullCampaign } from '../components/CampaignDetailsModal'; // We'll reuse this type

interface AuthUser {
  id: string;
  role: 'user' | 'admin';
  username: string;
  avatar: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
  savedCampaigns: FullCampaign[]; // New state for saved campaigns
  toggleSaveCampaign: (campaignId: string) => Promise<void>; // New function to handle saving
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedCampaigns, setSavedCampaigns] = useState<FullCampaign[]>([]);

  const fetchSavedCampaigns = useCallback(async () => {
    if (localStorage.token) {
        try {
            const res = await axios.get('/api/users/me/saved');
            setSavedCampaigns(res.data);
        } catch (err) {
            console.error("Could not fetch saved campaigns on load", err);
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
          fetchSavedCampaigns();
        }
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, [fetchSavedCampaigns]);

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    const decodedToken: { user: AuthUser } = jwtDecode(newToken);
    setToken(newToken);
    setUser(decodedToken.user);
    setAuthToken(newToken);
    fetchSavedCampaigns(); // Fetch saved campaigns immediately on login
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setAuthToken(null);
    setSavedCampaigns([]); // Clear saved campaigns on logout
  };

  const toggleSaveCampaign = async (campaignId: string) => {
    try {
        const res = await axios.put(`/api/users/me/save/${campaignId}`);
        // The backend sends back the new list of saved campaign IDs.
        // We need to refetch the full campaign objects.
        fetchSavedCampaigns();
    } catch (err) {
        console.error("Failed to toggle save campaign", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, savedCampaigns, toggleSaveCampaign }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) { throw new Error('useAuth must be used within an AuthProvider'); }
  return context;
};