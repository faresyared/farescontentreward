import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

export type MusicGenerationStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface MusicGeneration {
  _id: string;
  prompt: string;
  tempo?: string;
  mood?: string;
  vocals?: string;
  durationSeconds?: number;
  status: MusicGenerationStatus;
  progress?: number;
  audioUrl?: string;
  previewUrl?: string;
  waveformUrl?: string;
  storageKey?: string;
  externalJobId?: string;
  title?: string;
  style?: string;
  campaign?: string;
  metadata?: Record<string, unknown> | null;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MusicGenerationInput {
  prompt: string;
  tempo?: string;
  mood?: string;
  vocals?: string;
  durationSeconds?: number;
  campaignId?: string;
  title?: string;
  style?: string;
}

interface MusicGenerationContextValue {
  generations: MusicGeneration[];
  loading: boolean;
  reload: () => Promise<void>;
  requestGeneration: (input: MusicGenerationInput) => Promise<MusicGeneration>;
  refreshGeneration: (id: string) => Promise<MusicGeneration>;
  attachGenerationToCampaign: (id: string, campaignId: string) => Promise<MusicGeneration>;
}

const MusicGenerationContext = createContext<MusicGenerationContextValue | null>(null);

export const MusicGenerationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [generations, setGenerations] = useState<MusicGeneration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchGenerations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get<MusicGeneration[]>('/api/music');
      setGenerations(res.data);
    } catch (error) {
      console.error('Failed to fetch Brazilian phonk generations', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGenerations();
  }, [fetchGenerations]);

  const requestGeneration = useCallback(async (input: MusicGenerationInput) => {
    const res = await axios.post<MusicGeneration>('/api/music/generate', input);
    setGenerations(prev => {
      const others = prev.filter(gen => gen._id !== res.data._id);
      return [res.data, ...others];
    });
    return res.data;
  }, []);

  const refreshGeneration = useCallback(async (id: string) => {
    const res = await axios.get<MusicGeneration>(`/api/music/${id}`);
    setGenerations(prev => prev.map(gen => (gen._id === id ? res.data : gen)));
    return res.data;
  }, []);

  const attachGenerationToCampaign = useCallback(async (id: string, campaignId: string) => {
    const res = await axios.post<{ generation: MusicGeneration }>(`/api/music/${id}/attach`, { campaignId });
    const updatedGeneration = res.data.generation;
    setGenerations(prev => prev.map(gen => (gen._id === updatedGeneration._id ? updatedGeneration : gen)));
    return updatedGeneration;
  }, []);

  const value = useMemo<MusicGenerationContextValue>(() => ({
    generations,
    loading,
    reload: fetchGenerations,
    requestGeneration,
    refreshGeneration,
    attachGenerationToCampaign
  }), [generations, loading, fetchGenerations, requestGeneration, refreshGeneration, attachGenerationToCampaign]);

  return (
    <MusicGenerationContext.Provider value={value}>
      {children}
    </MusicGenerationContext.Provider>
  );
};

export const useMusicGeneration = () => {
  const context = useContext(MusicGenerationContext);
  if (!context) {
    throw new Error('useMusicGeneration must be used within a MusicGenerationProvider');
  }
  return context;
};
