import { DemoProject, SampleDescriptor, StudioSnapshot, Track } from '../types';

type StoreGetter = () => StudioSnapshot;

type StepCallback = (step: number) => void;

type StatusCallback = (status: 'started' | 'stopped') => void;

const LOOKAHEAD = 0.1;
const SCHEDULE_INTERVAL = 25;
const STEPS_PER_BAR = 16;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const createBuffer = (context: AudioContext, duration: number): AudioBuffer => {
  return context.createBuffer(1, Math.max(1, Math.floor(context.sampleRate * duration)), context.sampleRate);
};

const generateKick = (context: AudioContext) => {
  const buffer = createBuffer(context, 0.8);
  const data = buffer.getChannelData(0);
  const sampleRate = context.sampleRate;
  for (let i = 0; i < data.length; i++) {
    const t = i / sampleRate;
    const envelope = Math.pow(1 - t, 3);
    const frequency = 55 + Math.pow(1 - t, 2) * 140;
    data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 1.2;
  }
  return buffer;
};

const generateSnare = (context: AudioContext) => {
  const buffer = createBuffer(context, 0.5);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    const t = i / context.sampleRate;
    const envelope = Math.pow(1 - t, 4);
    const noise = (Math.random() * 2 - 1) * envelope * 0.8;
    const body = Math.sin(2 * Math.PI * 200 * t) * Math.pow(1 - t, 3) * 0.3;
    data[i] = noise + body;
  }
  return buffer;
};

const generateCowbell = (context: AudioContext) => {
  const buffer = createBuffer(context, 0.65);
  const data = buffer.getChannelData(0);
  const baseFreq = 540;
  for (let i = 0; i < data.length; i++) {
    const t = i / context.sampleRate;
    const mod = Math.sin(2 * Math.PI * 1200 * t) * 0.5;
    const freq = baseFreq + mod * baseFreq * 0.6;
    const envelope = Math.exp(-t * 6);
    const metallic = Math.sin(2 * Math.PI * freq * t) + Math.sin(2 * Math.PI * freq * 1.5 * t) * 0.6;
    data[i] = metallic * envelope * 0.9;
  }
  return buffer;
};

const generateHat = (context: AudioContext) => {
  const buffer = createBuffer(context, 0.2);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    const t = i / context.sampleRate;
    const envelope = Math.pow(1 - t, 4);
    const metallic = Math.sin(2 * Math.PI * 6000 * t) * envelope * 0.4;
    const noise = (Math.random() * 2 - 1) * envelope * 0.7;
    data[i] = metallic + noise;
  }
  return buffer;
};

const generateRim = (context: AudioContext) => {
  const buffer = createBuffer(context, 0.3);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    const t = i / context.sampleRate;
    const envelope = Math.exp(-t * 18);
    const body = Math.sin(2 * Math.PI * 900 * t) * 0.8;
    data[i] = (body + Math.sin(2 * Math.PI * 1200 * t) * 0.3) * envelope;
  }
  return buffer;
};

const generateSiren = (context: AudioContext) => {
  const buffer = createBuffer(context, 1.2);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    const t = i / context.sampleRate;
    const freq = 300 + Math.sin(2 * Math.PI * 2 * t) * 120;
    const envelope = Math.min(1, t * 6) * Math.pow(1 - Math.max(0, t - 0.8) * 4, 2);
    data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.6;
  }
  return buffer;
};

const generateVocal = (context: AudioContext) => {
  const buffer = createBuffer(context, 0.8);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    const t = i / context.sampleRate;
    const phoneme = Math.sin(2 * Math.PI * 160 * t) * Math.exp(-t * 4);
    const texture = (Math.random() * 2 - 1) * Math.exp(-t * 2) * 0.2;
    data[i] = phoneme * 0.6 + texture;
  }
  return buffer;
};

const generateBass = (context: AudioContext) => {
  const buffer = createBuffer(context, 1.4);
  const data = buffer.getChannelData(0);
  const sampleRate = context.sampleRate;
  for (let i = 0; i < data.length; i++) {
    const t = i / sampleRate;
    const pitchEnv = Math.pow(1 - Math.min(1, t * 2), 3);
    const frequency = 45 + pitchEnv * 55;
    const drive = Math.tanh(Math.sin(2 * Math.PI * frequency * t) * 2.2);
    data[i] = drive * Math.exp(-t * 2.2) * 1.1;
  }
  return buffer;
};

const generatorMap: Record<SampleDescriptor['generator'], (context: AudioContext) => AudioBuffer> = {
  kick: generateKick,
  snare: generateSnare,
  cowbell: generateCowbell,
  rim: generateRim,
  vox: generateVocal,
  siren: generateSiren,
  hat: generateHat,
  bass: generateBass,
  fx: generateSiren,
};

interface ChannelNodes {
  gain: GainNode;
  pan: StereoPannerNode;
}

export class AudioEngine {
  private context?: AudioContext;
  private masterGain?: GainNode;
  private metronomeGain?: GainNode;
  private channelNodes = new Map<string, ChannelNodes>();
  private sampleCache = new Map<string, AudioBuffer>();
  private onStep?: StepCallback;
  private onStatus?: StatusCallback;
  private getStore: StoreGetter;
  private currentStep = 0;
  private nextStepTime = 0;
  private schedulerId?: number;
  private bpm = 165;
  private swing = 0;
  private countInRemaining = 0;

  constructor(getStore: StoreGetter) {
    this.getStore = getStore;
  }

  public setOnStep(callback: StepCallback) {
    this.onStep = callback;
  }

  public setOnStatus(callback: StatusCallback) {
    this.onStatus = callback;
  }

  public setBpm(bpm: number) {
    this.bpm = clamp(bpm, 120, 220);
  }

  public setSwing(swing: number) {
    this.swing = clamp(swing, 0, 1);
  }

  public async start(countInBars = 0) {
    const ctx = await this.ensureContext();
    await ctx.resume();
    this.currentStep = 0;
    const stepDuration = this.getStepDuration();
    const now = ctx.currentTime + 0.05;
    this.countInRemaining = Math.max(0, Math.floor(countInBars));
    this.nextStepTime = now + stepDuration * STEPS_PER_BAR * this.countInRemaining;
    this.scheduleMetronomeCountIn(now, stepDuration, this.countInRemaining);
    this.schedulerId = window.setInterval(() => this.schedule(), SCHEDULE_INTERVAL);
    this.onStatus?.('started');
  }

  public stop() {
    if (this.schedulerId) {
      window.clearInterval(this.schedulerId);
      this.schedulerId = undefined;
    }
    this.currentStep = 0;
    this.onStep?.(0);
    this.onStatus?.('stopped');
  }

  public configureTracks(tracks: Track[]) {
    if (!this.context) {
      return;
    }
    tracks.forEach((track) => {
      this.ensureChannel(track.id);
      if (track.kitSampleId && !this.sampleCache.has(track.kitSampleId)) {
        const descriptor = this.findSample(track.kitSampleId);
        if (descriptor) {
          const buffer = generatorMap[descriptor.generator](this.context!);
          this.sampleCache.set(track.kitSampleId, buffer);
        }
      }
      this.applyMixerSettings(track);
    });
  }

  public refreshMixerState(tracks: Track[]) {
    if (!this.context) {
      return;
    }
    tracks.forEach((track) => this.applyMixerSettings(track));
  }

  public async loadKitSamples(samples: SampleDescriptor[]) {
    const ctx = await this.ensureContext();
    samples.forEach((sample) => {
      const buffer = generatorMap[sample.generator](ctx);
      this.sampleCache.set(sample.id, buffer);
    });
  }

  public previewSample(sampleId: string) {
    if (!this.context) {
      void this.ensureContext().then(() => this.previewSample(sampleId));
      return;
    }
    const buffer = this.sampleCache.get(sampleId);
    if (!buffer) {
      const descriptor = this.findSample(sampleId);
      if (!descriptor) return;
      const generated = generatorMap[descriptor.generator](this.context);
      this.sampleCache.set(sampleId, generated);
      this.playBuffer(sampleId, generated, this.context.currentTime, 0.8);
      return;
    }
    this.playBuffer(sampleId, buffer, this.context.currentTime, 0.8);
  }

  public handleDemoProject(project: DemoProject) {
    if (!this.context) {
      return;
    }
    Object.keys(project.trackPatterns).forEach((trackId) => {
      const patterns = project.trackPatterns[trackId];
      patterns?.forEach((pattern) => {
        const descriptor = this.findSample(pattern.activeSteps[0]?.toString() || '');
        if (descriptor && !this.sampleCache.has(descriptor.id)) {
          const buffer = generatorMap[descriptor.generator](this.context!);
          this.sampleCache.set(descriptor.id, buffer);
        }
      });
    });
  }

  private async ensureContext() {
    if (this.context) {
      return this.context;
    }
    const context = new AudioContext({ latencyHint: 'interactive' });
    const masterGain = context.createGain();
    masterGain.gain.value = 0.9;
    masterGain.connect(context.destination);
    this.context = context;
    this.masterGain = masterGain;

    const metronomeGain = context.createGain();
    metronomeGain.gain.value = 0.0;
    metronomeGain.connect(masterGain);
    this.metronomeGain = metronomeGain;

    this.configureTracks(this.getStore().tracks);
    return context;
  }

  private scheduleMetronomeCountIn(startTime: number, stepDuration: number, bars: number) {
    if (!this.context || !this.metronomeGain || bars <= 0) {
      return;
    }
    const clickBuffer = this.sampleCache.get('metronome-click') ?? this.createMetronomeBuffer();
    if (!this.sampleCache.has('metronome-click')) {
      this.sampleCache.set('metronome-click', clickBuffer);
    }
    const beatsPerBar = 4;
    for (let bar = 0; bar < bars; bar++) {
      for (let beat = 0; beat < beatsPerBar; beat++) {
        const time = startTime + (bar * beatsPerBar + beat) * stepDuration * (STEPS_PER_BAR / beatsPerBar);
        this.playMetronome(time, beat === 0 ? 0.9 : 0.6, clickBuffer);
      }
    }
  }

  private createMetronomeBuffer() {
    const context = this.context!;
    const buffer = createBuffer(context, 0.2);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / context.sampleRate;
      const envelope = Math.exp(-t * 40);
      data[i] = Math.sin(2 * Math.PI * 2000 * t) * envelope;
    }
    return buffer;
  }

  private playMetronome(time: number, gain: number, buffer: AudioBuffer) {
    if (!this.context || !this.metronomeGain) return;
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    const gainNode = this.context.createGain();
    gainNode.gain.value = gain;
    source.connect(gainNode);
    gainNode.connect(this.metronomeGain);
    source.start(time);
  }

  private schedule() {
    if (!this.context || !this.masterGain) {
      return;
    }
    const currentTime = this.context.currentTime;
    const stepDuration = this.getStepDuration();
    while (this.nextStepTime < currentTime + LOOKAHEAD) {
      const store = this.getStore();
      const stepIndex = this.currentStep % this.getStore().stepsPerPattern;
      const swingOffset = this.computeSwingOffset(stepIndex, stepDuration);
      const scheduledTime = this.nextStepTime + swingOffset;
      this.triggerTracks(stepIndex, scheduledTime, store);
      if (store.metronome && this.currentStep % (STEPS_PER_BAR / 4) === 0) {
        const metronomeBuffer = this.sampleCache.get('metronome-click') ?? this.createMetronomeBuffer();
        if (!this.sampleCache.has('metronome-click')) {
          this.sampleCache.set('metronome-click', metronomeBuffer);
        }
        const accent = this.currentStep % STEPS_PER_BAR === 0 ? 0.9 : 0.4;
        this.playMetronome(scheduledTime, accent, metronomeBuffer);
      }
      this.onStep?.(stepIndex);
      this.currentStep = (this.currentStep + 1) % STEPS_PER_BAR;
      this.nextStepTime += stepDuration;
    }
  }

  private triggerTracks(stepIndex: number, time: number, store: StudioSnapshot) {
    store.tracks.forEach((track) => {
      const step = track.steps[stepIndex];
      if (!step?.active) return;
      if (Math.random() > step.probability) return;
      const velocity = clamp(step.velocity, 0, 1);
      switch (track.type) {
        case 'cowbell':
        case 'sample':
        case 'fx':
          this.playSampleTrack(track, time, velocity);
          break;
        case 'bass':
          this.playBassTrack(track, time, velocity);
          break;
      }
    });
  }

  private playSampleTrack(track: Track, time: number, velocity: number) {
    if (!this.context) return;
    if (track.kitSampleId) {
      const buffer = this.sampleCache.get(track.kitSampleId);
      if (!buffer) {
        const descriptor = this.findSample(track.kitSampleId);
        if (descriptor) {
          const generated = generatorMap[descriptor.generator](this.context);
          this.sampleCache.set(track.kitSampleId, generated);
          this.playBuffer(track.id, generated, time, velocity, track.id);
        }
        return;
      }
      this.playBuffer(track.id, buffer, time, velocity, track.id);
    } else if (track.type === 'cowbell') {
      const buffer = generateCowbell(this.context);
      this.playBuffer(track.id, buffer, time, velocity, track.id);
    }
  }

  private playBassTrack(track: Track, time: number, velocity: number) {
    if (!this.context) return;
    const duration = 1.2;
    const osc = this.context.createOscillator();
    osc.type = 'sine';
    const gain = this.context.createGain();
    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180, time);
    filter.frequency.linearRampToValueAtTime(900, time + 0.2);
    osc.frequency.setValueAtTime(48, time);
    osc.frequency.exponentialRampToValueAtTime(36, time + 0.25);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(velocity * 0.9, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    osc.connect(filter);
    filter.connect(gain);
    const channel = this.ensureChannel(track.id);
    gain.connect(channel.pan);
    osc.start(time);
    osc.stop(time + duration);
  }

  private playBuffer(cacheKey: string, buffer: AudioBuffer, time: number, velocity: number, trackId?: string) {
    if (!this.context) return;
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    const gain = this.context.createGain();
    gain.gain.value = velocity;
    source.connect(gain);
    const channel = this.ensureChannel(trackId ?? cacheKey);
    gain.connect(channel.pan);
    source.start(time);
  }

  private ensureChannel(trackId: string) {
    if (!this.context || !this.masterGain) {
      throw new Error('Audio context not ready');
    }
    const existing = this.channelNodes.get(trackId);
    if (existing) return existing;
    const pan = this.context.createStereoPanner();
    const gain = this.context.createGain();
    gain.gain.value = 1;
    pan.connect(gain);
    gain.connect(this.masterGain);
    const channel: ChannelNodes = { gain, pan };
    this.channelNodes.set(trackId, channel);
    return channel;
  }

  private applyMixerSettings(track: Track) {
    const channel = this.channelNodes.get(track.id);
    if (!channel) return;
    const store = this.getStore();
    const soloActive = store.tracks.some((t) => t.solo);
    const shouldMute = track.muted || (soloActive && !track.solo);
    channel.gain.gain.value = shouldMute ? 0 : track.volume;
    channel.pan.pan.value = track.pan;
  }

  private computeSwingOffset(stepIndex: number, stepDuration: number) {
    if (this.swing <= 0) return 0;
    const isSwingStep = stepIndex % 2 === 1;
    return isSwingStep ? stepDuration * this.swing * 0.4 : 0;
  }

  private getStepDuration() {
    return 60 / this.bpm / 4;
  }

  private findSample(sampleId: string): SampleDescriptor | undefined {
    const { kits } = this.getStore();
    for (const kit of kits) {
      const sample = kit.samples.find((item) => item.id === sampleId);
      if (sample) return sample;
    }
    return undefined;
  }
}
