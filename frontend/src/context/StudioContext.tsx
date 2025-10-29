import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { AudioEngine, DEFAULT_TRACKS, SequencerTrack } from '../studio/audioEngine';

type StudioState = {
  bpm: number;
  swing: number;
  isPlaying: boolean;
  currentStep: number;
  tracks: SequencerTrack[];
};

type StudioAction =
  | { type: 'toggleStep'; trackId: string; stepIndex: number }
  | { type: 'setBpm'; bpm: number }
  | { type: 'setSwing'; swing: number }
  | { type: 'setPlaying'; isPlaying: boolean }
  | { type: 'setCurrentStep'; step: number }
  | { type: 'setTrackVolume'; trackId: string; volume: number }
  | { type: 'setStepVelocity'; trackId: string; stepIndex: number; velocity: number };

type StudioContextValue = {
  state: StudioState;
  actions: {
    toggleStep(trackId: string, stepIndex: number): void;
    setBpm(bpm: number): void;
    setSwing(swing: number): void;
    setPlaying(isPlaying: boolean): void;
    setTrackVolume(trackId: string, volume: number): void;
    setStepVelocity(trackId: string, stepIndex: number, velocity: number): void;
  };
  engine: AudioEngine;
};

const StudioContext = createContext<StudioContextValue | undefined>(undefined);

const initialState: StudioState = {
  bpm: 165,
  swing: 0.08,
  isPlaying: false,
  currentStep: 0,
  tracks: DEFAULT_TRACKS,
};

function reducer(state: StudioState, action: StudioAction): StudioState {
  switch (action.type) {
    case 'toggleStep': {
      return {
        ...state,
        tracks: state.tracks.map((track) => {
          if (track.id !== action.trackId) return track;
          const steps = track.steps.map((step, index) =>
            index === action.stepIndex
              ? { ...step, active: !step.active, velocity: step.active ? step.velocity : step.velocity || 0.9 }
              : step
          );
          return { ...track, steps };
        }),
      };
    }
    case 'setBpm':
      return { ...state, bpm: action.bpm };
    case 'setSwing':
      return { ...state, swing: action.swing };
    case 'setPlaying':
      return { ...state, isPlaying: action.isPlaying };
    case 'setCurrentStep':
      return { ...state, currentStep: action.step };
    case 'setTrackVolume':
      return {
        ...state,
        tracks: state.tracks.map((track) =>
          track.id === action.trackId ? { ...track, volume: action.volume } : track
        ),
      };
    case 'setStepVelocity':
      return {
        ...state,
        tracks: state.tracks.map((track) => {
          if (track.id !== action.trackId) return track;
          const steps = track.steps.map((step, index) =>
            index === action.stepIndex ? { ...step, velocity: action.velocity } : step
          );
          return { ...track, steps };
        }),
      };
    default:
      return state;
  }
}

export const StudioProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const engine = useMemo(() => new AudioEngine(), []);

  useEffect(() => {
    engine.setBpm(state.bpm);
  }, [engine, state.bpm]);

  useEffect(() => {
    engine.setSwing(state.swing);
  }, [engine, state.swing]);

  useEffect(() => {
    engine.setTracks(state.tracks);
  }, [engine, state.tracks]);

  useEffect(() => {
    engine.onStep((step) => dispatch({ type: 'setCurrentStep', step }));
    return () => {
      engine.onStep(undefined);
    };
  }, [engine]);

  useEffect(() => {
    if (state.isPlaying) {
      engine.start();
    } else {
      engine.stop();
    }
  }, [engine, state.isPlaying]);

  const value = useMemo<StudioContextValue>(() => ({
    state,
    actions: {
      toggleStep: (trackId, stepIndex) => dispatch({ type: 'toggleStep', trackId, stepIndex }),
      setBpm: (bpm) => dispatch({ type: 'setBpm', bpm }),
      setSwing: (swing) => dispatch({ type: 'setSwing', swing }),
      setPlaying: (isPlaying) => dispatch({ type: 'setPlaying', isPlaying }),
      setTrackVolume: (trackId, volume) => dispatch({ type: 'setTrackVolume', trackId, volume }),
      setStepVelocity: (trackId, stepIndex, velocity) =>
        dispatch({ type: 'setStepVelocity', trackId, stepIndex, velocity }),
    },
    engine,
  }), [engine, state]);

  useEffect(() => () => {
    engine.dispose();
  }, [engine]);

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
};

export function useStudio(): StudioContextValue {
  const context = useContext(StudioContext);
  if (!context) {
    throw new Error('useStudio must be used within a StudioProvider');
  }
  return context;
}

