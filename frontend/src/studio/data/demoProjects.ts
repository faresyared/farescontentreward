import { DemoProject } from '../types';

export const demoProjects: DemoProject[] = [
  {
    id: 'phonk-rio-starter',
    name: 'Phonk Rio Starter',
    description: 'Signature tamborzão groove with cowbell lead and rolling 808.',
    bpm: 165,
    swing: 0.12,
    trackPatterns: {
      kick: [
        { activeSteps: [0, 4, 8, 12], velocity: 0.95 },
      ],
      snare: [
        { activeSteps: [4, 12], velocity: 0.8 },
      ],
      cowbell: [
        { activeSteps: [2, 6, 10, 14], velocity: 0.75 },
      ],
      bass: [
        { activeSteps: [0, 4, 8, 12], velocity: 0.9 },
      ],
    },
  },
  {
    id: 'cowbell-heavy',
    name: 'Cowbell Heavy',
    description: 'Dense cowbell rhythms and syncopated snares.',
    bpm: 170,
    swing: 0.18,
    trackPatterns: {
      kick: [{ activeSteps: [0, 3, 6, 8, 11, 14], velocity: 0.9 }],
      snare: [{ activeSteps: [4, 12], velocity: 0.85 }],
      cowbell: [{ activeSteps: [1, 2, 5, 7, 9, 13, 15], velocity: 0.8 }],
      bass: [{ activeSteps: [0, 8, 12], velocity: 0.95 }],
    },
  },
  {
    id: 'tapestop-drop',
    name: 'TapeStop Drop',
    description: 'Slow build with vocal chop, siren FX and massive drop.',
    bpm: 160,
    swing: 0.1,
    trackPatterns: {
      kick: [{ activeSteps: [0, 8, 12], velocity: 0.92 }],
      snare: [{ activeSteps: [4, 12], velocity: 0.85 }],
      cowbell: [{ activeSteps: [3, 7, 11, 15], velocity: 0.7 }],
      bass: [{ activeSteps: [0, 4, 8], velocity: 0.88 }],
    },
  },
];
