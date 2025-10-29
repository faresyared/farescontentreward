import { createContext, ReactNode, useContext, useMemo, useRef, useState } from 'react';
import { builtInPlugins } from '../data/plugins';
import { sampleKits } from '../data/kits';
import { demoProjects } from '../data/demoProjects';
import { AudioEngine } from '../audio/audioEngine';
import { SampleDescriptor, Step, StudioActions, StudioSnapshot, StudioState, Track } from '../types';

const STEPS_PER_PATTERN = 16;

const createEmptySteps = (): Step[] =>
  Array.from({ length: STEPS_PER_PATTERN }, () => ({ active: false, velocity: 0.8, probability: 1 }));

const createTrack = (partial: Partial<Track> & { id: string; name: string; type: Track['type'] }): Track => ({
  color: '#00d4ff',
  steps: createEmptySteps(),
  volume: 0.8,
  pan: 0,
  muted: false,
  solo: false,
  pluginChain: [],
  ...partial,
});

const initialTracks: Track[] = [
  createTrack({
    id: 'kick',
    name: 'Tamborzão Kick',
    type: 'sample',
    color: '#ff6b35',
    kitSampleId: 'phonk-essentials-vol1:kick-tamborzao',
    pluginChain: ['core-fx-suite'],
    steps: createEmptySteps().map((step, index) => ({
      ...step,
      active: [0, 4, 8, 12].includes(index),
      velocity: [0, 8].includes(index) ? 1 : 0.85,
    })),
  }),
  createTrack({
    id: 'snare',
    name: 'Phonk Clap',
    type: 'sample',
    color: '#f97316',
    kitSampleId: 'phonk-essentials-vol1:snare-snap',
    steps: createEmptySteps().map((step, index) => ({
      ...step,
      active: [4, 12].includes(index),
      velocity: 0.78,
    })),
    pluginChain: ['core-fx-suite'],
  }),
  createTrack({
    id: 'cowbell',
    name: 'Cowbell Designer',
    type: 'cowbell',
    color: '#00d4ff',
    kitSampleId: 'phonk-essentials-vol1:cowbell-classic',
    steps: createEmptySteps().map((step, index) => ({
      ...step,
      active: [2, 6, 10, 14].includes(index),
      velocity: 0.82,
      probability: 0.95,
    })),
    pluginChain: ['cowbell-designer'],
  }),
  createTrack({
    id: 'bass',
    name: 'Bruxo 808',
    type: 'bass',
    color: '#a855f7',
    kitSampleId: 'bruxo-808s-pack:808-destroyer',
    steps: createEmptySteps().map((step, index) => ({
      ...step,
      active: [0, 4, 8, 12].includes(index),
      velocity: 0.9,
    })),
    pluginChain: ['bruxo-808-synth', 'master-phonkizer'],
  }),
  createTrack({
    id: 'vox',
    name: 'Phonk Radio Vox',
    type: 'fx',
    color: '#9333ea',
    kitSampleId: 'phonk-essentials-vol1:vox-radio',
    steps: createEmptySteps().map((step, index) => ({
      ...step,
      active: index === 8,
      velocity: 0.7,
      probability: 0.9,
    })),
    pluginChain: ['phonk-radio-fx'],
  }),
  createTrack({
    id: 'fx',
    name: 'FX Siren',
    type: 'fx',
    color: '#38bdf8',
    kitSampleId: 'phonk-essentials-vol1:siren-rise',
    steps: createEmptySteps().map((step, index) => ({
      ...step,
      active: index === 15,
      velocity: 0.75,
    })),
    pluginChain: ['core-fx-suite'],
  }),
];

const initialState: StudioSnapshot = {
  bpm: 165,
  swing: 0.12,
  isPlaying: false,
  isRecording: false,
  metronome: true,
  loop: true,
  countInBars: 1,
  stepsPerPattern: STEPS_PER_PATTERN,
  currentStep: 0,
  projectName: 'Untitled Phonk Project',
  tracks: initialTracks,
  selectedTrackId: initialTracks[0].id,
  kits: sampleKits,
  activeKitId: sampleKits[0].id,
  plugins: builtInPlugins,
  automation: [
    {
      id: 'master-volume',
      target: 'Master Volume',
      points: [
        { time: 0, value: 0.8 },
        { time: 0.5, value: 0.85 },
        { time: 1, value: 0.82 },
      ],
    },
    {
      id: 'cowbell-metallicity',
      target: 'Cowbell Designer · Metallicity',
      points: [
        { time: 0, value: 0.3 },
        { time: 0.25, value: 0.7 },
        { time: 0.5, value: 0.5 },
      ],
    },
  ],
  demoProjects,
  cloudSyncEnabled: false,
  lastSavedAt: Date.now(),
};

const StudioContext = createContext<StudioState | null>(null);

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const pickSampleForTrack = (track: Track, samples: SampleDescriptor[]) => {
  const findByGenerator = (generator: SampleDescriptor['generator']) =>
    samples.find((sample) => sample.generator === generator)?.id;

  switch (track.id) {
    case 'kick':
      return findByGenerator('kick');
    case 'snare':
      return findByGenerator('snare') ?? findByGenerator('rim');
    case 'cowbell':
      return findByGenerator('cowbell');
    case 'vox':
      return findByGenerator('vox');
    case 'fx':
      return findByGenerator('fx') ?? findByGenerator('siren');
    case 'bass':
      return findByGenerator('bass');
    default:
      return samples[0]?.id;
  }
};

export const StudioProvider = ({ children }: { children: ReactNode }) => {
  const [snapshot, setSnapshot] = useState<StudioSnapshot>(initialState);
  const snapshotRef = useRef(snapshot);
  const engineRef = useRef<AudioEngine | null>(null);

  const setStudioState = (updater: (state: StudioSnapshot) => StudioSnapshot) => {
    setSnapshot((prev) => {
      const next = updater(prev);
      snapshotRef.current = next;
      return next;
    });
  };

  const getEngine = () => {
    if (!engineRef.current) {
      engineRef.current = new AudioEngine(() => snapshotRef.current as StudioSnapshot);
      engineRef.current.setOnStep((step) => {
        setStudioState((prev) => ({ ...prev, currentStep: step }));
      });
      engineRef.current.setOnStatus((status) => {
        if (status === 'stopped') {
          setStudioState((prev) => ({ ...prev, isPlaying: false, currentStep: 0 }));
        }
      });
      engineRef.current.setBpm(snapshotRef.current.bpm);
      engineRef.current.setSwing(snapshotRef.current.swing);
      void engineRef.current.loadKitSamples(snapshotRef.current.kits[0].samples);
    }
    return engineRef.current;
  };

  const actions = useMemo<StudioActions>(() => ({
    start: async () => {
      const engine = getEngine();
      engine.setBpm(snapshotRef.current.bpm);
      engine.setSwing(snapshotRef.current.swing);
      await engine.start(snapshotRef.current.countInBars);
      setStudioState((prev) => ({ ...prev, isPlaying: true }));
    },
    stop: () => {
      const engine = getEngine();
      engine.stop();
      setStudioState((prev) => ({ ...prev, isPlaying: false, currentStep: 0 }));
    },
    toggleRecord: () => {
      setStudioState((prev) => ({ ...prev, isRecording: !prev.isRecording }));
    },
    toggleLoop: () => {
      setStudioState((prev) => ({ ...prev, loop: !prev.loop }));
    },
    toggleMetronome: () => {
      setStudioState((prev) => ({ ...prev, metronome: !prev.metronome }));
    },
    setBpm: (value: number) => {
      const bpm = clamp(value, 120, 220);
      setStudioState((prev) => ({ ...prev, bpm }));
      getEngine().setBpm(bpm);
    },
    setSwing: (value: number) => {
      const swing = clamp(value, 0, 0.5);
      setStudioState((prev) => ({ ...prev, swing }));
      getEngine().setSwing(swing);
    },
    setCountIn: (bars: number) => {
      setStudioState((prev) => ({ ...prev, countInBars: clamp(Math.round(bars), 0, 4) }));
    },
    toggleStep: (trackId: string, stepIndex: number) => {
      setStudioState((prev) => ({
        ...prev,
        tracks: prev.tracks.map((track) =>
          track.id === trackId
            ? {
                ...track,
                steps: track.steps.map((step, index) =>
                  index === stepIndex ? { ...step, active: !step.active } : step
                ),
              }
            : track
        ),
        lastSavedAt: Date.now(),
      }));
    },
    setStepVelocity: (trackId: string, stepIndex: number, velocity: number) => {
      setStudioState((prev) => ({
        ...prev,
        tracks: prev.tracks.map((track) =>
          track.id === trackId
            ? {
                ...track,
                steps: track.steps.map((step, index) =>
                  index === stepIndex ? { ...step, velocity: clamp(velocity, 0, 1) } : step
                ),
              }
            : track
        ),
        lastSavedAt: Date.now(),
      }));
    },
    setStepProbability: (trackId: string, stepIndex: number, probability: number) => {
      setStudioState((prev) => ({
        ...prev,
        tracks: prev.tracks.map((track) =>
          track.id === trackId
            ? {
                ...track,
                steps: track.steps.map((step, index) =>
                  index === stepIndex ? { ...step, probability: clamp(probability, 0, 1) } : step
                ),
              }
            : track
        ),
        lastSavedAt: Date.now(),
      }));
    },
    setTrackVolume: (trackId: string, volume: number) => {
      setStudioState((prev) => ({
        ...prev,
        tracks: prev.tracks.map((track) =>
          track.id === trackId ? { ...track, volume: clamp(volume, 0, 1) } : track
        ),
      }));
      getEngine().refreshMixerState(snapshotRef.current.tracks);
    },
    setTrackPan: (trackId: string, pan: number) => {
      setStudioState((prev) => ({
        ...prev,
        tracks: prev.tracks.map((track) =>
          track.id === trackId ? { ...track, pan: clamp(pan, -1, 1) } : track
        ),
      }));
      getEngine().refreshMixerState(snapshotRef.current.tracks);
    },
    toggleTrackMute: (trackId: string) => {
      setStudioState((prev) => ({
        ...prev,
        tracks: prev.tracks.map((track) =>
          track.id === trackId ? { ...track, muted: !track.muted } : track
        ),
      }));
      getEngine().refreshMixerState(snapshotRef.current.tracks);
    },
    toggleTrackSolo: (trackId: string) => {
      setStudioState((prev) => ({
        ...prev,
        tracks: prev.tracks.map((track) =>
          track.id === trackId ? { ...track, solo: !track.solo } : track
        ),
      }));
      getEngine().refreshMixerState(snapshotRef.current.tracks);
    },
    selectTrack: (trackId: string) => {
      setStudioState((prev) => ({ ...prev, selectedTrackId: trackId }));
    },
    loadKit: (kitId: string) => {
      const kit = sampleKits.find((item) => item.id === kitId);
      if (!kit) return;
      setStudioState((prev) => ({
        ...prev,
        activeKitId: kitId,
        tracks: prev.tracks.map((track) => {
          const sampleId = pickSampleForTrack(track, kit.samples);
          return sampleId ? { ...track, kitSampleId: sampleId } : track;
        }),
        lastSavedAt: Date.now(),
      }));
      const engine = getEngine();
      void engine.loadKitSamples(kit.samples);
      engine.configureTracks(snapshotRef.current.tracks);
    },
    previewSample: (sampleId: string) => {
      getEngine().previewSample(sampleId);
    },
    loadDemoProject: (projectId: string) => {
      const project = demoProjects.find((item) => item.id === projectId);
      if (!project) return;
      setStudioState((prev) => ({
        ...prev,
        bpm: project.bpm,
        swing: project.swing,
        projectName: project.name,
        tracks: prev.tracks.map((track) => {
          const patterns = project.trackPatterns[track.id];
          if (!patterns?.length) {
            return { ...track, steps: createEmptySteps() };
          }
          const steps = createEmptySteps();
          patterns.forEach((pattern) => {
            pattern.activeSteps.forEach((index) => {
              const position = index % STEPS_PER_PATTERN;
              steps[position] = {
                active: true,
                velocity: pattern.velocity ?? 0.8,
                probability: pattern.probability ?? 1,
              };
            });
          });
          return { ...track, steps };
        }),
        lastSavedAt: Date.now(),
      }));
      const engine = getEngine();
      engine.setBpm(project.bpm);
      engine.setSwing(project.swing);
      engine.configureTracks(snapshotRef.current.tracks);
    },
    randomizeTrackHumanize: (trackId: string) => {
      setStudioState((prev) => ({
        ...prev,
        tracks: prev.tracks.map((track) =>
          track.id === trackId
            ? {
                ...track,
                steps: track.steps.map((step) => ({
                  ...step,
                  velocity: clamp(step.velocity + (Math.random() - 0.5) * 0.2, 0.4, 1),
                  probability: clamp(step.probability + (Math.random() - 0.5) * 0.1, 0.6, 1),
                })),
              }
            : track
        ),
        lastSavedAt: Date.now(),
      }));
    },
    setProjectName: (name: string) => {
      setStudioState((prev) => ({ ...prev, projectName: name }));
    },
  }), []);

  const value: StudioState = useMemo(() => ({ ...snapshot, ...actions }), [snapshot, actions]);

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
};

export const useStudioStore = <T,>(selector: (state: StudioState) => T): T => {
  const context = useContext(StudioContext);
  if (!context) {
    throw new Error('useStudioStore must be used within a StudioProvider');
  }
  return selector(context);
};
