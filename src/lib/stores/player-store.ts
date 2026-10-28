import { create } from "zustand";
import { MusicTrackItem } from "@/lib/types/manifests";
import { audioEngine } from "@/lib/audio-engine";
import { parseLrc, LrcLine } from "@/lib/lrc-parser";

export type RepeatMode = "off" | "all" | "one";

export interface PlayerState {
  queue: MusicTrackItem[];
  currentTrackIndex: number;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  positionMs: number;
  durationMs: number;
  lyrics: LrcLine[];

  currentTrack: () => MusicTrackItem | null;
  setQueue: (tracks: MusicTrackItem[], startIndex?: number) => void;
  playTrack: (track: MusicTrackItem) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (positionMs: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  updatePosition: (positionMs: number, durationMs?: number) => void;
  loadLyrics: (lrcUrl?: string) => Promise<void>;
}

export const usePlayerStore = create<PlayerState>()((set, get) => ({
  queue: [],
  currentTrackIndex: -1,
  isPlaying: false,
  volume: 0.8,
  isMuted: false,
  isShuffle: false,
  repeatMode: "off",
  positionMs: 0,
  durationMs: 0,
  lyrics: [],

  currentTrack: () => {
    const { queue, currentTrackIndex } = get();
    if (currentTrackIndex >= 0 && currentTrackIndex < queue.length) {
      return queue[currentTrackIndex];
    }
    return null;
  },

  setQueue: (tracks, startIndex = 0) => {
    set({ queue: tracks, currentTrackIndex: startIndex });
    if (tracks[startIndex]) {
      get().playTrack(tracks[startIndex]);
    }
  },

  playTrack: (track) => {
    const { queue } = get();
    const index = queue.findIndex((t) => t.id === track.id);
    const newQueue = index === -1 ? [...queue, track] : queue;
    const trackIndex = index === -1 ? newQueue.length - 1 : index;

    set({
      queue: newQueue,
      currentTrackIndex: trackIndex,
      isPlaying: true,
      positionMs: 0,
      durationMs: track.duration * 1000,
    });

    audioEngine.play(track.audioPath);
    if (track.lrcPath) {
      get().loadLyrics(track.lrcPath);
    } else {
      set({ lyrics: [] });
    }
  },

  play: () => {
    const track = get().currentTrack();
    if (!track) return;
    set({ isPlaying: true });
    audioEngine.play(track.audioPath);
  },

  pause: () => {
    set({ isPlaying: false });
    audioEngine.pause();
  },

  togglePlay: () => {
    const { isPlaying, currentTrack } = get();
    if (isPlaying) {
      get().pause();
    } else {
      if (currentTrack()) {
        get().play();
      } else {
        const { queue } = get();
        if (queue.length > 0) {
          get().playTrack(queue[0]);
        }
      }
    }
  },

  nextTrack: () => {
    const { queue, currentTrackIndex, isShuffle, repeatMode } = get();
    if (queue.length === 0) return;

    if (repeatMode === "one") {
      get().seek(0);
      get().play();
      return;
    }

    let nextIndex: number;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = currentTrackIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeatMode === "all") {
          nextIndex = 0;
        } else {
          get().pause();
          return;
        }
      }
    }

    get().playTrack(queue[nextIndex]);
  },

  prevTrack: () => {
    const { queue, currentTrackIndex, positionMs } = get();
    if (queue.length === 0) return;

    // If played more than 3 seconds, restart current track
    if (positionMs > 3000) {
      get().seek(0);
      return;
    }

    const prevIndex =
      currentTrackIndex > 0 ? currentTrackIndex - 1 : queue.length - 1;
    get().playTrack(queue[prevIndex]);
  },

  seek: (positionMs: number) => {
    set({ positionMs });
    audioEngine.seek(positionMs / 1000);
  },

  setVolume: (volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume));
    set({ volume: clamped, isMuted: clamped === 0 });
    audioEngine.setVolume(clamped);
  },

  toggleMute: () => {
    const { isMuted, volume } = get();
    const nextMuted = !isMuted;
    set({ isMuted: nextMuted });
    audioEngine.setMuted(nextMuted);
    if (!nextMuted && volume === 0) {
      get().setVolume(0.5);
    }
  },

  toggleShuffle: () => {
    set((state) => ({ isShuffle: !state.isShuffle }));
  },

  cycleRepeat: () => {
    const { repeatMode } = get();
    const modes: RepeatMode[] = ["off", "all", "one"];
    const nextIndex = (modes.indexOf(repeatMode) + 1) % modes.length;
    set({ repeatMode: modes[nextIndex] });
  },

  updatePosition: (positionMs: number, durationMs?: number) => {
    set(() => ({
      positionMs,
      ...(typeof durationMs === "number" && durationMs > 0
        ? { durationMs }
        : {}),
    }));
  },

  loadLyrics: async (lrcUrl?: string) => {
    if (!lrcUrl) {
      set({ lyrics: [] });
      return;
    }
    try {
      const res = await fetch(lrcUrl);
      if (res.ok) {
        const text = await res.text();
        const parsed = parseLrc(text);
        set({ lyrics: parsed });
      } else {
        set({ lyrics: [] });
      }
    } catch {
      set({ lyrics: [] });
    }
  },
}));

// Wire native HTMLAudioElement event listeners to Zustand store
if (typeof window !== "undefined" && audioEngine.audio) {
  audioEngine.audio.addEventListener("timeupdate", () => {
    const audio = audioEngine.audio;
    if (audio) {
      usePlayerStore
        .getState()
        .updatePosition(
          audio.currentTime * 1000,
          audio.duration ? audio.duration * 1000 : undefined
        );
    }
  });

  audioEngine.audio.addEventListener("ended", () => {
    usePlayerStore.getState().nextTrack();
  });
}
