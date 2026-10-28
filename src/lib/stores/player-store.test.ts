import { describe, it, expect, beforeEach, vi } from "vitest";
import { usePlayerStore } from "./player-store";
import { audioEngine } from "../audio-engine";
import { MusicTrackItem } from "../types/manifests";

vi.mock("../audio-engine", () => ({
  audioEngine: {
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    seek: vi.fn(),
    setVolume: vi.fn(),
    setMuted: vi.fn(),
    attachWebAudio: vi.fn(),
  },
}));

const mockTracks: MusicTrackItem[] = [
  {
    id: "song-1",
    title: "Midnight City",
    artist: "Satria",
    album: "Neon Dreams",
    duration: 180,
    audioPath: "/music/song-1.mp3",
    lrcPath: "/music/song-1.lrc",
  },
  {
    id: "song-2",
    title: "Daylight",
    artist: "Satria",
    album: "Neon Dreams",
    duration: 210,
    audioPath: "/music/song-2.mp3",
  },
];

describe("Player Store Management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePlayerStore.setState({
      queue: mockTracks,
      currentTrackIndex: 0,
      isPlaying: false,
      volume: 0.8,
      isMuted: false,
      isShuffle: false,
      repeatMode: "off",
      positionMs: 0,
      durationMs: 180000,
    });
  });

  it("plays track and updates queue and active state", () => {
    usePlayerStore.getState().playTrack(mockTracks[1]);

    const state = usePlayerStore.getState();
    expect(state.currentTrackIndex).toBe(1);
    expect(state.isPlaying).toBe(true);
    expect(state.currentTrack()?.id).toBe("song-2");
    expect(audioEngine.play).toHaveBeenCalledWith("/music/song-2.mp3");
  });

  it("toggles play/pause state", () => {
    usePlayerStore.setState({ isPlaying: false });
    usePlayerStore.getState().togglePlay();
    expect(usePlayerStore.getState().isPlaying).toBe(true);
    expect(audioEngine.play).toHaveBeenCalled();

    usePlayerStore.getState().togglePlay();
    expect(usePlayerStore.getState().isPlaying).toBe(false);
    expect(audioEngine.pause).toHaveBeenCalled();
  });

  it("moves to next track and stops at end of queue when repeat is off", () => {
    usePlayerStore.setState({ currentTrackIndex: 0 });
    usePlayerStore.getState().nextTrack();
    expect(usePlayerStore.getState().currentTrackIndex).toBe(1);

    // End of queue -> pauses when repeatMode is off
    usePlayerStore.getState().nextTrack();
    expect(audioEngine.pause).toHaveBeenCalled();
  });

  it("loops to start on nextTrack when repeatMode is 'all'", () => {
    usePlayerStore.setState({ currentTrackIndex: 1, repeatMode: "all" });
    usePlayerStore.getState().nextTrack();
    expect(usePlayerStore.getState().currentTrackIndex).toBe(0);
  });

  it("restarts track on nextTrack when repeatMode is 'one'", () => {
    usePlayerStore.setState({ currentTrackIndex: 0, repeatMode: "one" });
    usePlayerStore.getState().nextTrack();
    expect(audioEngine.seek).toHaveBeenCalledWith(0);
  });

  it("moves to previous track or restarts if position > 3s", () => {
    usePlayerStore.setState({ currentTrackIndex: 1, positionMs: 5000 });
    usePlayerStore.getState().prevTrack();
    // Position was > 3000ms -> should restart current track
    expect(audioEngine.seek).toHaveBeenCalledWith(0);

    usePlayerStore.setState({ currentTrackIndex: 1, positionMs: 1000 });
    usePlayerStore.getState().prevTrack();
    // Position was <= 3000ms -> should go to track 0
    expect(usePlayerStore.getState().currentTrackIndex).toBe(0);
  });

  it("seeks position and changes volume", () => {
    usePlayerStore.getState().seek(45000);
    expect(usePlayerStore.getState().positionMs).toBe(45000);
    expect(audioEngine.seek).toHaveBeenCalledWith(45);

    usePlayerStore.getState().setVolume(0.5);
    expect(usePlayerStore.getState().volume).toBe(0.5);
    expect(audioEngine.setVolume).toHaveBeenCalledWith(0.5);
  });

  it("toggles mute and shuffle properly", () => {
    usePlayerStore.getState().toggleMute();
    expect(usePlayerStore.getState().isMuted).toBe(true);

    usePlayerStore.getState().toggleShuffle();
    expect(usePlayerStore.getState().isShuffle).toBe(true);

    usePlayerStore.getState().cycleRepeat();
    expect(usePlayerStore.getState().repeatMode).toBe("all");
    usePlayerStore.getState().cycleRepeat();
    expect(usePlayerStore.getState().repeatMode).toBe("one");
    usePlayerStore.getState().cycleRepeat();
    expect(usePlayerStore.getState().repeatMode).toBe("off");
  });
});
