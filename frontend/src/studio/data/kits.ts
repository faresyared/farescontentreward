import { SampleKit } from '../types';

export const sampleKits: SampleKit[] = [
  {
    id: 'phonk-essentials-vol1',
    name: 'Phonk Essentials Vol. 1',
    description:
      'Classic cowbells, claps, 808s, sirens and textures captured from iconic Brazilian phonk records.',
    accentColor: '#ff6b35',
    samples: [
      {
        id: 'phonk-essentials-vol1:kick-tamborzao',
        name: 'Tamborzão Kick',
        category: 'Drums',
        tags: ['kick', 'drive', 'club'],
        generator: 'kick',
        description: 'Punchy low-end kick tailored for Rio club systems.'
      },
      {
        id: 'phonk-essentials-vol1:snare-snap',
        name: 'Snap Snare',
        category: 'Drums',
        tags: ['snare', 'snap'],
        generator: 'snare',
        description: 'Short snare layered with vinyl air.'
      },
      {
        id: 'phonk-essentials-vol1:cowbell-classic',
        name: 'Classic Cowbell',
        category: 'Cowbells',
        tags: ['cowbell', 'fm', 'metallic'],
        generator: 'cowbell',
        description: 'The signature Rio metallic cowbell.'
      },
      {
        id: 'phonk-essentials-vol1:rim-wood',
        name: 'Wood Rim',
        category: 'Drums',
        tags: ['rim', 'percussion'],
        generator: 'rim'
      },
      {
        id: 'phonk-essentials-vol1:siren-rise',
        name: 'Police Siren Rise',
        category: 'FX',
        tags: ['rise', 'siren'],
        generator: 'siren'
      },
      {
        id: 'phonk-essentials-vol1:vox-radio',
        name: 'Radio Vox',
        category: 'Vocals',
        tags: ['radio', 'vocal'],
        generator: 'vox'
      }
    ]
  },
  {
    id: 'rio-drums-pack',
    name: 'Rio Drums Pack',
    description: 'Swing-heavy tamborzão rhythms and vocals sourced in Rio.',
    accentColor: '#00d4ff',
    samples: [
      {
        id: 'rio-drums-pack:kick-slam',
        name: 'Slam Kick',
        category: 'Drums',
        tags: ['kick', 'slam'],
        generator: 'kick'
      },
      {
        id: 'rio-drums-pack:snare-rattle',
        name: 'Rattle Snare',
        category: 'Drums',
        tags: ['snare', 'bright'],
        generator: 'snare'
      },
      {
        id: 'rio-drums-pack:cowbell-wide',
        name: 'Wide Cowbell',
        category: 'Cowbells',
        tags: ['cowbell', 'stereo'],
        generator: 'cowbell'
      },
      {
        id: 'rio-drums-pack:hat-spark',
        name: 'Spark Hat',
        category: 'Drums',
        tags: ['hat', 'bright'],
        generator: 'hat'
      },
      {
        id: 'rio-drums-pack:vox-swing',
        name: 'Swing Vox',
        category: 'Vocals',
        tags: ['vocal', 'phrase'],
        generator: 'vox'
      }
    ]
  },
  {
    id: 'bruxo-808s-pack',
    name: 'Bruxo 808s Pack',
    description: 'Deep distorted 808s with glide and analog grit.',
    accentColor: '#a855f7',
    samples: [
      {
        id: 'bruxo-808s-pack:808-destroyer',
        name: 'Destroyer 808',
        category: '808s',
        tags: ['808', 'distorted'],
        generator: 'bass'
      },
      {
        id: 'bruxo-808s-pack:808-tapewarm',
        name: 'Tape Warm 808',
        category: '808s',
        tags: ['warm', 'analog'],
        generator: 'bass'
      }
    ]
  },
  {
    id: 'funk-carioca-fx',
    name: 'Funk Carioca FX',
    description: 'FX elements, risers and vinyl cuts to spice transitions.',
    accentColor: '#fbbf24',
    samples: [
      {
        id: 'funk-carioca-fx:reverse-radio',
        name: 'Reverse Radio',
        category: 'FX',
        tags: ['reverse', 'radio'],
        generator: 'fx'
      },
      {
        id: 'funk-carioca-fx:tape-stop',
        name: 'Tape Stop',
        category: 'FX',
        tags: ['stop', 'texture'],
        generator: 'fx'
      },
      {
        id: 'funk-carioca-fx:vox-callout',
        name: 'Callout Vox',
        category: 'Vocals',
        tags: ['vocal', 'phrase'],
        generator: 'vox'
      }
    ]
  },
  {
    id: 'phonk-radio-vocals',
    name: 'Phonk Radio Vocals',
    description: 'Pitched Portuguese voice phrases and cuts.',
    accentColor: '#f97316',
    samples: [
      {
        id: 'phonk-radio-vocals:vox-radio-01',
        name: 'Radio Vox 01',
        category: 'Vocals',
        tags: ['radio', 'phrase'],
        generator: 'vox'
      },
      {
        id: 'phonk-radio-vocals:vox-radio-02',
        name: 'Radio Vox 02',
        category: 'Vocals',
        tags: ['radio', 'phrase'],
        generator: 'vox'
      }
    ]
  },
  {
    id: 'brazilian-trap-phonk-fusion',
    name: 'Brazilian Trap/Phonk Fusion Pack',
    description: 'Modern club-ready drums and FX blending trap and phonk.',
    accentColor: '#38bdf8',
    samples: [
      {
        id: 'brazilian-trap-phonk-fusion:kick-modern',
        name: 'Modern Kick',
        category: 'Drums',
        tags: ['kick', 'modern'],
        generator: 'kick'
      },
      {
        id: 'brazilian-trap-phonk-fusion:snare-wet',
        name: 'Wet Snare',
        category: 'Drums',
        tags: ['snare', 'fx'],
        generator: 'snare'
      },
      {
        id: 'brazilian-trap-phonk-fusion:cowbell-filtered',
        name: 'Filtered Cowbell',
        category: 'Cowbells',
        tags: ['cowbell', 'filtered'],
        generator: 'cowbell'
      },
      {
        id: 'brazilian-trap-phonk-fusion:808-clean',
        name: 'Clean Boom 808',
        category: '808s',
        tags: ['808', 'clean'],
        generator: 'bass'
      }
    ]
  }
];
