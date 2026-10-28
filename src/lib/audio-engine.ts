import { getAudioContext, initAudioContext } from "./audio-context";

class AudioEngine {
  private static instance: AudioEngine | null = null;
  public audio: HTMLAudioElement | null = null;
  public analyser: AnalyserNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private isSourceConnected = false;

  private constructor() {
    if (typeof window !== "undefined") {
      this.audio = new Audio();
      this.audio.preload = "auto";
      this.audio.crossOrigin = "anonymous";
    }
  }

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  /**
   * Connects the HTMLAudioElement to the Web Audio AudioContext + AnalyserNode.
   * Safe to call multiple times.
   */
  public attachWebAudio(): boolean {
    if (
      typeof window === "undefined" ||
      !this.audio ||
      this.isSourceConnected
    ) {
      return this.isSourceConnected;
    }

    const ctx = getAudioContext() || initAudioContext();
    if (!ctx) return false;

    try {
      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      this.sourceNode = ctx.createMediaElementSource(this.audio);
      this.sourceNode.connect(this.analyser);
      this.analyser.connect(ctx.destination);

      this.isSourceConnected = true;
      return true;
    } catch (err) {
      console.warn(
        "Failed to attach Web Audio nodes to HTMLAudioElement:",
        err
      );
      return false;
    }
  }

  public getFrequencyData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(0);
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  public play(src?: string): Promise<void> {
    if (!this.audio) return Promise.resolve();

    if (src && this.audio.src !== src) {
      this.audio.src = src;
      this.audio.load();
    }

    this.attachWebAudio();
    return this.audio.play().catch((err) => {
      console.warn("Audio playback interrupted or blocked:", err);
    });
  }

  public pause(): void {
    this.audio?.pause();
  }

  public seek(seconds: number): void {
    if (this.audio) {
      this.audio.currentTime = seconds;
    }
  }

  public setVolume(volume: number): void {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  public setMuted(muted: boolean): void {
    if (this.audio) {
      this.audio.muted = muted;
    }
  }
}

export const audioEngine = AudioEngine.getInstance();
