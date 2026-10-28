import { useState, useEffect } from "react";
import { LrcLine, currentLineIndex } from "@/lib/lrc-parser";
import { usePlayerStore } from "@/lib/stores/player-store";
import { audioEngine } from "@/lib/audio-engine";

export function useCurrentLyric(lines: LrcLine[]): {
  currentIndex: number;
  currentLine: LrcLine | null;
} {
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  useEffect(() => {
    if (!lines || lines.length === 0) return;

    const updateIndex = () => {
      const audioTime = audioEngine.audio?.currentTime;
      const positionMs =
        typeof audioTime === "number" && !isNaN(audioTime)
          ? audioTime * 1000
          : usePlayerStore.getState().positionMs;

      const idx = currentLineIndex(lines, positionMs, 200);
      setCurrentIndex(idx);
    };

    const animId = requestAnimationFrame(updateIndex);
    const interval = setInterval(updateIndex, 250);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(interval);
    };
  }, [lines, isPlaying]);

  const effectiveIndex = !lines || lines.length === 0 ? -1 : currentIndex;

  return {
    currentIndex: effectiveIndex,
    currentLine:
      effectiveIndex >= 0 && effectiveIndex < lines.length
        ? lines[effectiveIndex]
        : null,
  };
}
