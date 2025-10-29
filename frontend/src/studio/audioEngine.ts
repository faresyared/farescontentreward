export type StepState = {
  active: boolean;
  velocity: number;
};

export type SequencerTrack = {
  id: string;
  name: string;
  color: string;
  sampleId: string;
  volume: number;
  steps: StepState[];
};

type StepListener = (step: number) => void;

type SampleDefinition = {
  id: string;
  name: string;
  category: 'Drums' | '808s' | 'Vocals' | 'FX';
};

const STEPS_PER_PATTERN = 16;

const FACTORY_SAMPLE_METADATA: SampleDefinition[] = [
  { id: 'cowbell-classic', name: 'Classic Cowbell', category: 'Drums' },
  { id: 'cowbell-hard', name: 'Hard Club Cowbell', category: 'Drums' },
  { id: 'cowbell-stereo', name: 'Stereo Pulse Cowbell', category: 'Drums' },
  { id: 'kick-hard', name: 'Destroyer Kick', category: 'Drums' },
  { id: 'snare-rio', name: 'Rio Clap', category: 'Drums' },
  { id: 'bass-destroyer', name: 'Bruxo 808 Destroyer', category: '808s' },
  { id: 'bass-clean', name: 'CleanBoom 808', category: '808s' },
];

const kitPalette = {
  cowbell: '#00d4ff',
  kick: '#ff6b35',
  snare: '#ffb347',
  bass: '#9c6bff',
};

function createSteps(): StepState[] {
  return Array.from({ length: STEPS_PER_PATTERN }, (_, index) => ({
    active: false,
    velocity: index % 4 === 0 ? 0.95 : 0.8,
  }));
}

export const DEFAULT_TRACKS: SequencerTrack[] = [
  {
    id: 'cowbell',
    name: 'Cowbell Designer',
    color: kitPalette.cowbell,
    sampleId: 'cowbell-classic',
    volume: 0.85,
    steps: createSteps().map((step, idx) => ({
      ...step,
      active: idx % 4 === 0,
    })),
  },
  {
    id: 'kick',
    name: 'Bruxo Kick',
    color: kitPalette.kick,
    sampleId: 'kick-hard',
    volume: 0.9,
    steps: createSteps().map((step, idx) => ({
      ...step,
      active: idx % 4 === 0,
    })),
  },
  {
    id: 'snare',
    name: 'Rio Clap',
    color: kitPalette.snare,
    sampleId: 'snare-rio',
    volume: 0.7,
    steps: createSteps().map((step, idx) => ({
      ...step,
      active: idx % 8 === 4,
    })),
  },
  {
    id: 'bass',
    name: 'Bruxo 808',
    color: kitPalette.bass,
    sampleId: 'bass-destroyer',
    volume: 0.8,
    steps: createSteps().map((step, idx) => ({
      ...step,
      active: idx === 0 || idx === 8,
      velocity: 1,
    })),
  },
];

export class AudioEngine {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private channelGains = new Map<string, GainNode>();
  private compressor: DynamicsCompressorNode | null = null;
  private limiter: GainNode | null = null;
  private lookahead = 0.1;
  private scheduleInterval: number | null = null;
  private tempo = 165;
  private swing = 0.08;
  private nextStepTime = 0;
  private currentStep = 0;
  private isPlaying = false;
  private stepListener?: StepListener;
  private tracks: SequencerTrack[] = DEFAULT_TRACKS;
  private buffers = new Map<string, AudioBuffer>();
  private samples: SampleDefinition[] = FACTORY_SAMPLE_METADATA;

  private get secondsPerStep() {
    const secondsPerBeat = 60 / this.tempo;
    return secondsPerBeat / 4;
  }

  async start() {
    const ctx = await this.ensureContext();
    if (!ctx || this.isPlaying) return;

    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    this.isPlaying = true;
    this.nextStepTime = ctx.currentTime + 0.05;
    this.scheduleLoop();
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    if (this.scheduleInterval !== null) {
      window.clearInterval(this.scheduleInterval);
      this.scheduleInterval = null;
    }
  }

  dispose() {
    this.stop();
    if (this.context) {
      this.context.close();
      this.context = null;
    }
    this.channelGains.clear();
    this.buffers.clear();
  }

  setBpm(bpm: number) {
    this.tempo = bpm;
  }

  setSwing(swing: number) {
    this.swing = swing;
  }

  setTracks(tracks: SequencerTrack[]) {
    this.tracks = tracks;
    this.channelGains.forEach((gain, id) => {
      const track = tracks.find((t) => t.id === id);
      if (track) {
        gain.gain.value = track.volume;
      }
    });
  }

  onStep(listener: StepListener | undefined) {
    this.stepListener = listener;
  }

  async previewSample(sampleId: string) {
    const ctx = await this.ensureContext();
    if (!ctx) return;
    const buffer = this.buffers.get(sampleId);
    if (!buffer) return;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.value = 0.9;
    source.connect(gain).connect(this.masterGain ?? ctx.destination);
    source.start();
  }

  async triggerNote(frequency: number) {
    const ctx = await this.ensureContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = frequency;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1800;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.connect(filter).connect(gain).connect(this.masterGain ?? ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.7);
  }

  getFactorySamples() {
    return this.samples;
  }

  private async ensureContext() {
    if (typeof window === 'undefined') return null;
    if (!this.context) {
      this.context = new AudioContext({ latencyHint: 'interactive' });
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = 0.8;
      this.masterGain.connect(this.context.destination);

      this.compressor = this.context.createDynamicsCompressor();
      this.compressor.threshold.value = -14;
      this.compressor.knee.value = 30;
      this.compressor.ratio.value = 4;
      this.compressor.attack.value = 0.005;
      this.compressor.release.value = 0.25;

      this.limiter = this.context.createGain();
      this.limiter.gain.value = 0.95;

      this.masterGain.disconnect();
      this.masterGain.connect(this.compressor).connect(this.limiter).connect(this.context.destination);

      await this.loadFactoryContent(this.context);
    }
    return this.context;
  }

  private scheduleLoop() {
    if (!this.context) return;
    const ctx = this.context;
    const scheduleAhead = this.lookahead;

    const tick = () => {
      if (!this.isPlaying) return;
      while (this.nextStepTime < ctx.currentTime + scheduleAhead) {
        const stepIndex = this.currentStep % STEPS_PER_PATTERN;
        this.scheduleStep(stepIndex, this.nextStepTime);
        this.currentStep = (this.currentStep + 1) % STEPS_PER_PATTERN;
        const swingOffset = stepIndex % 2 === 1 ? this.swing * this.secondsPerStep : 0;
        this.nextStepTime += this.secondsPerStep + swingOffset;
      }
      this.stepListener?.((this.currentStep + STEPS_PER_PATTERN - 1) % STEPS_PER_PATTERN);
    };

    tick();
    this.scheduleInterval = window.setInterval(tick, 25);
  }

  private scheduleStep(stepIndex: number, time: number) {
    if (!this.context) return;
    const ctx = this.context;
    this.tracks.forEach((track) => {
      const step = track.steps[stepIndex];
      if (!step?.active) return;
      const buffer = this.buffers.get(track.sampleId);
      if (!buffer) return;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.value = step.velocity * track.volume;
      const channelGain = this.getOrCreateChannel(track.id);
      source.connect(gain).connect(channelGain);
      source.start(time);
    });
  }

  private getOrCreateChannel(trackId: string) {
    if (!this.context || !this.masterGain) {
      throw new Error('AudioContext not initialised');
    }
    let gain = this.channelGains.get(trackId);
    if (!gain) {
      gain = this.context.createGain();
      const track = this.tracks.find((t) => t.id === trackId);
      gain.gain.value = track?.volume ?? 1;
      gain.connect(this.masterGain);
      this.channelGains.set(trackId, gain);
    }
    return gain;
  }

  private async loadFactoryContent(ctx: AudioContext) {
    const generator = new SampleGenerator(ctx);
    const sampleMap: Record<string, AudioBuffer> = {
      'cowbell-classic': generator.createCowbell({ preset: 'Classic Rio' }),
      'cowbell-hard': generator.createCowbell({ preset: 'Hard Club', metallicity: 0.95 }),
      'cowbell-stereo': generator.createCowbell({ preset: 'Stereo Pulse', stereoSpread: 0.6 }),
      'kick-hard': generator.createKick(),
      'snare-rio': generator.createSnare(),
      '808-destroyer': generator.create808({ preset: 'Destroyer' }),
      'bass-destroyer': generator.create808({ preset: 'Destroyer', sustain: 1.4 }),
      'bass-clean': generator.create808({ preset: 'CleanBoom', drive: 0.1, sustain: 1.2 }),
    };

    Object.entries(sampleMap).forEach(([id, buffer]) => {
      this.buffers.set(id, buffer);
    });

    this.samples = FACTORY_SAMPLE_METADATA;
  }
}

type CowbellOptions = {
  metallicity?: number;
  decay?: number;
  stereoSpread?: number;
  preset?: string;
};

type BassOptions = {
  drive?: number;
  sustain?: number;
  preset?: string;
};

class SampleGenerator {
  constructor(private ctx: AudioContext) {}

  createCowbell(options: CowbellOptions = {}) {
    const { metallicity = 0.85, decay = 0.4, stereoSpread = 0.25 } = options;
    const duration = decay + 0.15;
    const channels = 2;
    const buffer = this.ctx.createBuffer(channels, Math.ceil(this.ctx.sampleRate * duration), this.ctx.sampleRate);

    for (let channel = 0; channel < channels; channel += 1) {
      const data = buffer.getChannelData(channel);
      const detune = channel === 0 ? -stereoSpread * 20 : stereoSpread * 20;
      for (let i = 0; i < data.length; i += 1) {
        const t = i / this.ctx.sampleRate;
        const env = Math.exp(-t * 6 / decay);
        const mod = Math.sin(2 * Math.PI * (840 + detune) * t) * metallicity * Math.exp(-t * 8);
        const tone = Math.sin(2 * Math.PI * (620 + detune) * t + mod * 2);
        data[i] = tone * env;
      }
    }

    return buffer;
  }

  createKick() {
    const duration = 0.8;
    const buffer = this.ctx.createBuffer(1, Math.ceil(this.ctx.sampleRate * duration), this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      const t = i / this.ctx.sampleRate;
      const pitch = 80 * Math.pow(2, -t * 6);
      const env = Math.exp(-t * 8);
      data[i] = Math.sin(2 * Math.PI * pitch * t) * env * 1.1;
    }
    return buffer;
  }

  createSnare() {
    const duration = 0.6;
    const buffer = this.ctx.createBuffer(1, Math.ceil(this.ctx.sampleRate * duration), this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    const sampleRate = this.ctx.sampleRate;
    for (let i = 0; i < data.length; i += 1) {
      const t = i / sampleRate;
      const noise = Math.random() * 2 - 1;
      const env = Math.exp(-t * 12);
      const tone = Math.sin(2 * Math.PI * 200 * t) * Math.exp(-t * 20);
      data[i] = (noise * 0.8 + tone * 0.2) * env;
    }
    return buffer;
  }

  create808(options: BassOptions = {}) {
    const { drive = 0.2, sustain = 1.1 } = options;
    const duration = sustain + 0.5;
    const buffer = this.ctx.createBuffer(1, Math.ceil(this.ctx.sampleRate * duration), this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    const sampleRate = this.ctx.sampleRate;
    for (let i = 0; i < data.length; i += 1) {
      const t = i / sampleRate;
      const pitch = 46 * Math.pow(2, -t * 2.4);
      const env = Math.exp(-t * 2.8);
      const sample = Math.sin(2 * Math.PI * pitch * t);
      const saturated = Math.tanh(sample * (1 + drive * 6));
      data[i] = saturated * env;
    }
    return buffer;
  }
}

