import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { getSysmonMetrics } from "./adapters/sysmon";
import { IslandView } from "./IslandView";
import { usePlayerStore } from "@/lib/stores/player-store";
import { useWindowStore } from "@/lib/stores/window-store";

vi.mock("@/lib/audio-engine", () => ({
  audioEngine: {
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    seek: vi.fn(),
    setVolume: vi.fn(),
    setMuted: vi.fn(),
    attachWebAudio: vi.fn(),
    getFrequencyData: vi
      .fn()
      .mockReturnValue(new Uint8Array([10, 20, 30, 40, 50])),
  },
}));

describe("Sysmon Metrics Adapter", () => {
  it("produces values strictly within 0 - 100", () => {
    for (let step = 0; step < 50; step++) {
      const metrics = getSysmonMetrics(step);
      expect(metrics.cpu).toBeGreaterThanOrEqual(0);
      expect(metrics.cpu).toBeLessThanOrEqual(100);
      expect(metrics.ram).toBeGreaterThanOrEqual(0);
      expect(metrics.ram).toBeLessThanOrEqual(100);
    }
  });

  it("is strictly deterministic for the same step and seed", () => {
    const run1 = getSysmonMetrics(15, 999);
    const run2 = getSysmonMetrics(15, 999);
    expect(run1).toEqual(run2);
  });
});

describe("IslandView Component RTL Tests", () => {
  beforeEach(() => {
    useWindowStore.getState().resetWindows();
    usePlayerStore.setState({
      queue: [
        {
          id: "island-track",
          title: "PioPio Beat",
          artist: "Satria",
          album: "EP",
          duration: 120,
          audioPath: "/music/piopio.mp3",
        },
      ],
      currentTrackIndex: 0,
      isPlaying: false,
    });
  });

  it("renders collapsed notch initially and expands on hover", async () => {
    render(<IslandView />);

    expect(screen.getByTestId("notch-collapsed")).toBeInTheDocument();
    expect(screen.queryByTestId("notch-expanded")).not.toBeInTheDocument();

    const container = screen.getByTestId("island-container");
    await act(async () => {
      fireEvent.mouseEnter(container);
    });

    expect(screen.getByTestId("notch-expanded")).toBeInTheDocument();
  });

  it("triggers play/pause toggle when play button in notch is clicked", async () => {
    render(<IslandView />);
    const container = screen.getByTestId("island-container");

    await act(async () => {
      fireEvent.mouseEnter(container);
    });

    const playBtn = screen.getByTestId("notch-play-btn");
    await act(async () => {
      fireEvent.click(playBtn);
    });

    expect(usePlayerStore.getState().isPlaying).toBe(true);
  });

  it("opens app window when app shortcut in expanded notch is clicked", async () => {
    render(<IslandView />);
    const container = screen.getByTestId("island-container");

    await act(async () => {
      fireEvent.mouseEnter(container);
    });

    const terminalShortcut = screen.getByTestId("notch-shortcut-terminal");
    await act(async () => {
      fireEvent.click(terminalShortcut);
    });

    expect(useWindowStore.getState().windows.terminal?.isOpen).toBe(true);
  });
});
