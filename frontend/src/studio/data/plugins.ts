import { PluginDefinition } from '../types';

export const builtInPlugins: PluginDefinition[] = [
  {
    id: 'cowbell-designer',
    name: 'Cowbell Designer',
    type: 'Synth',
    description:
      'Two FM oscillators with metallicity, decay and stereo spread to sculpt signature Rio cowbells.',
    parameters: [
      { name: 'Tune', defaultValue: 0, min: -12, max: 12 },
      { name: 'Decay', defaultValue: 0.6, min: 0.1, max: 2 },
      { name: 'Metallicity', defaultValue: 0.5, min: 0, max: 1 },
      { name: 'Stereo Spread', defaultValue: 0.3, min: 0, max: 1 }
    ],
    presets: ['Classic Rio', 'Hard Club', 'Filtered Bell', 'Stereo Pulse']
  },
  {
    id: 'bruxo-808-synth',
    name: 'Bruxo 808 Bass',
    type: 'Synth',
    description: 'Sine + sub oscillator with pitch envelope, drive and tilt EQ for rumbling 808s.',
    parameters: [
      { name: 'Drive', defaultValue: 0.5, min: 0, max: 1 },
      { name: 'Glide', defaultValue: 0.2, min: 0, max: 1 },
      { name: 'Clip', defaultValue: 0.4, min: 0, max: 1 },
      { name: 'Tilt EQ', defaultValue: 0.5, min: 0, max: 1 }
    ],
    presets: ['Destroyer', 'TapeWarm', 'Gritty', 'Ringed', 'CleanBoom']
  },
  {
    id: 'phonk-drum-machine',
    name: 'Phonk Drum Machine',
    type: 'Utility',
    description: '8 pads, randomize/humanize timing and built-in drive for instant drum grooves.',
    parameters: [
      { name: 'Drive', defaultValue: 0.4, min: 0, max: 1 },
      { name: 'Swing', defaultValue: 0.3, min: 0, max: 1 },
      { name: 'Humanize', defaultValue: 0.25, min: 0, max: 1 }
    ],
    presets: ['Tamborzão', 'Neo Rio', 'Miami Tape']
  },
  {
    id: 'phonk-radio-fx',
    name: 'Phonk Radio FX',
    type: 'FX',
    description: 'Telephone filter, tape-stop, reverse gate and stutter for vocal manipulation.',
    parameters: [
      { name: 'Formant Shift', defaultValue: 0.4, min: 0, max: 1 },
      { name: 'Tape Wear', defaultValue: 0.5, min: 0, max: 1 },
      { name: 'Stutter Rate', defaultValue: 0.35, min: 0, max: 1 },
      { name: 'Reverse Depth', defaultValue: 0.6, min: 0, max: 1 }
    ],
    presets: ['Radio Filter', 'Tape Warp', 'Bit Noise', 'Reverse Chop']
  },
  {
    id: 'master-phonkizer',
    name: 'Master Phonkizer Chain',
    type: 'FX',
    description:
      'Mastering chain with HP filter, tape saturation, exciter, parallel compression and limiter.',
    parameters: [
      { name: 'Tape Saturation', defaultValue: 0.55, min: 0, max: 1 },
      { name: 'Exciter', defaultValue: 0.45, min: 0, max: 1 },
      { name: 'Parallel Mix', defaultValue: 0.2, min: 0, max: 1 },
      { name: 'Limiter Ceiling', defaultValue: -0.8, min: -6, max: 0 }
    ],
    presets: ['Live Set', 'Cassette Booth', 'Festival Heat']
  },
  {
    id: 'core-fx-suite',
    name: 'Core FX Suite',
    type: 'FX',
    description: 'EQ, compressor, distortion, chorus, phaser, reverb, delay, stereo imager and limiter.',
    parameters: [
      { name: 'EQ Low', defaultValue: 0.5, min: 0, max: 1 },
      { name: 'Compressor', defaultValue: 0.5, min: 0, max: 1 },
      { name: 'Reverb', defaultValue: 0.4, min: 0, max: 1 },
      { name: 'Imager', defaultValue: 0.5, min: 0, max: 1 }
    ],
    presets: ['Wide Tape', 'Tight Bus', 'Grit Club']
  }
];
