import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { LyricsSheet } from "./lyrics/LyricsSheet";
import { LrcLine } from "@/lib/lrc-parser";

const sampleLyrics: LrcLine[] = [
  { timeMs: 1000, text: "Walking down the neon street" },
  { timeMs: 4000, text: "City lights begin to meet" },
  { timeMs: 8000, text: "Midnight echoes in my mind" },
];

describe("LyricsSheet Component", () => {
  it("renders all lyric lines and highlights the active one", () => {
    const onSeek = vi.fn();
    render(
      <LyricsSheet lyrics={sampleLyrics} activeLineIndex={1} onSeek={onSeek} />
    );

    expect(screen.getByTestId("lyrics-sheet")).toBeInTheDocument();

    const line0 = screen.getByTestId("lyric-line-0");
    const line1 = screen.getByTestId("lyric-line-1");
    const line2 = screen.getByTestId("lyric-line-2");

    expect(line0).toHaveAttribute("data-active", "false");
    expect(line1).toHaveAttribute("data-active", "true");
    expect(line2).toHaveAttribute("data-active", "false");

    expect(line1).toHaveTextContent("City lights begin to meet");
  });

  it("calls onSeek with the exact line timestamp when clicked", () => {
    const onSeek = vi.fn();
    render(
      <LyricsSheet lyrics={sampleLyrics} activeLineIndex={0} onSeek={onSeek} />
    );

    const line2 = screen.getByTestId("lyric-line-2");
    fireEvent.click(line2);

    expect(onSeek).toHaveBeenCalledWith(8000);
  });

  it("renders empty state message when lyrics array is empty", () => {
    const onSeek = vi.fn();
    render(<LyricsSheet lyrics={[]} activeLineIndex={-1} onSeek={onSeek} />);

    expect(screen.getByTestId("lyrics-empty")).toBeInTheDocument();
    expect(screen.getByText("Lirik tidak tersedia")).toBeInTheDocument();
  });
});

describe("Lyrics Synchronization with Fake Timers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("updates active line as fake timer progresses", () => {
    let activeIdx = 0;
    const { rerender } = render(
      <LyricsSheet
        lyrics={sampleLyrics}
        activeLineIndex={activeIdx}
        onSeek={vi.fn()}
      />
    );

    expect(screen.getByTestId("lyric-line-0")).toHaveAttribute(
      "data-active",
      "true"
    );

    // Advance simulated time
    act(() => {
      vi.advanceTimersByTime(3500);
      activeIdx = 1;
    });

    rerender(
      <LyricsSheet
        lyrics={sampleLyrics}
        activeLineIndex={activeIdx}
        onSeek={vi.fn()}
      />
    );

    expect(screen.getByTestId("lyric-line-1")).toHaveAttribute(
      "data-active",
      "true"
    );
  });
});
