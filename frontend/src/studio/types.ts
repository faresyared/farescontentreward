export type Step = {
  active: boolean;
  velocity: number; // 0-1
  probability: number; // 0-1
};

export type TrackType = 'sample' | 'cowbell' | 'bass' | 'fx';

export interface Track {
  id: string;
  name: string;
  color: string;
  type: TrackType;
  steps: Step[];
  volume: number; // 0-1
  pan: number; // -1 to 1
  muted: boolean;
  solo: boolean;
  kitSampleId?: string;
  pluginChain: string[];
}

export interface SampleDescriptor {
  id: string;
  name: string;
  category: 'Drums' | '808s' | 'Vocals' | 'FX' | 'Cowbells';
  tags: string[];
  generator: 'kick' | 'snare' | 'cowbell' | 'rim' | 'vox' | 'siren' | 'hat' | 'bass' | 'fx';
  description?: string;
}

export interface SampleKit {
  id: string;
  name: string;
  description: string;
  accentColor: string;
  samples: SampleDescriptor[];
}

export interface PluginDefinition {
  id: string;
  name: string;
  type: 'Synth' | 'FX' | 'Utility';
  description: string;
  parameters: { name: string; defaultValue: number; min: number; max: number }[];
  presets: string[];
}

export interface DemoProject {
  id: string;
  name: string;
  description: string;
  bpm: number;
  swing: number;
  trackPatterns: Record<string, { activeSteps: number[]; velocity?: number; probability?: number }[]>;
}

export interface AutomationLane {
  id: string;
  target: string;
  points: { time: number; value: number }[];
}

export interface StudioSnapshot {
  bpm: number;
  swing: number;
  isPlaying: boolean;
  isRecording: boolean;
  metronome: boolean;
  loop: boolean;
  countInBars: number;
  stepsPerPattern: number;
  currentStep: number;
  projectName: string;
  tracks: Track[];
  selectedTrackId: string;
  kits: SampleKit[];
  activeKitId: string;
  plugins: PluginDefinition[];
  automation: AutomationLane[];
  demoProjects: DemoProject[];
  cloudSyncEnabled: boolean;
  lastSavedAt?: number;
}

export interface StudioActions {
  start: () => Promise<void>;
  stop: () => void;
  toggleRecord: () => void;
  toggleLoop: () => void;
  toggleMetronome: () => void;
  setBpm: (value: number) => void;
  setSwing: (value: number) => void;
  setCountIn: (bars: number) => void;
  toggleStep: (trackId: string, stepIndex: number) => void;
  setStepVelocity: (trackId: string, stepIndex: number, velocity: number) => void;
  setStepProbability: (trackId: string, stepIndex: number, probability: number) => void;
  setTrackVolume: (trackId: string, volume: number) => void;
  setTrackPan: (trackId: string, pan: number) => void;
  toggleTrackMute: (trackId: string) => void;
  toggleTrackSolo: (trackId: string) => void;
  selectTrack: (trackId: string) => void;
  loadKit: (kitId: string) => void;
  previewSample: (sampleId: string) => void;
  loadDemoProject: (projectId: string) => void;
  randomizeTrackHumanize: (trackId: string) => void;
  setProjectName: (name: string) => void;
}

export type StudioState = StudioSnapshot & StudioActions;
