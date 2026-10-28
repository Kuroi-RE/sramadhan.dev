import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { MusicApp } from "./MusicApp";
import { usePlayerStore } from "@/lib/stores/player-store";

vi.mock("@/lib/audio-engine", () => ({
  audioEngine: {
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    seek: vi.fn(),
    setVolume: vi.fn(),
    setMuted: vi.fn(),
    attachWebAudio: vi.fn(),
  },
}));

describe("MusicApp Component RTL Tests", () => {
  beforeEach(() => {
    usePlayerStore.setState({
      queue: [
        {
          id: "track-1",
          title: "Chill Horizon",
          artist: "Satria",
          album: "Singles",
          duration: 150,
          audioPath: "/music/chill.mp3",
        },
      ],
      currentTrackIndex: 0,
      isPlaying: false,
      positionMs: 30000,
      durationMs: 150000,
      volume: 0.8,
    });
  });

  it("renders sidebar navigation and bottom player bar", () => {
    render(<MusicApp />);

    expect(screen.getByTestId("music-app")).toBeInTheDocument();
    expect(screen.getByTestId("music-nav-library")).toBeInTheDocument();
    expect(screen.getByTestId("music-nav-nowplaying")).toBeInTheDocument();
    expect(screen.getByTestId("music-player-bar")).toBeInTheDocument();

    expect(screen.getByTestId("player-track-title")).toHaveTextContent(
      "Chill Horizon"
    );
    expect(screen.getByTestId("player-track-artist")).toHaveTextContent(
      "Satria"
    );
  });

  it("switches to now playing view and back to library", () => {
    render(<MusicApp />);

    const nowPlayingNav = screen.getByTestId("music-nav-nowplaying");
    fireEvent.click(nowPlayingNav);
    expect(screen.getByTestId("now-playing-view")).toBeInTheDocument();
    expect(screen.getByTestId("now-playing-title")).toHaveTextContent(
      "Chill Horizon"
    );

    const libraryNav = screen.getByTestId("music-nav-library");
    fireEvent.click(libraryNav);
    expect(screen.queryByTestId("now-playing-view")).not.toBeInTheDocument();
  });

  it("toggles play/pause when main control button is clicked", () => {
    render(<MusicApp />);

    const playBtn = screen.getByTestId("player-play-btn");
    fireEvent.click(playBtn);
    expect(usePlayerStore.getState().isPlaying).toBe(true);

    fireEvent.click(playBtn);
    expect(usePlayerStore.getState().isPlaying).toBe(false);
  });
});
