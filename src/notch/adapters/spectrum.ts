import { audioEngine } from "@/lib/audio-engine";
import { usePlayerStore } from "@/lib/stores/player-store";

export function getSpectrumBars(barCount = 12): number[] {
  const isPlaying = usePlayerStore.getState().isPlaying;
  if (!isPlaying) {
    return new Array(barCount).fill(4);
  }

  const rawData = audioEngine.getFrequencyData();
  if (!rawData || rawData.length === 0) {
    return new Array(barCount).fill(12);
  }

  const step = Math.floor(rawData.length / barCount) || 1;
  const bars: number[] = [];

  for (let i = 0; i < barCount; i++) {
    const rawVal = rawData[i * step] || 0;
    // Scale 0-255 to bar height in px (e.g., 4px - 28px)
    const height = Math.max(4, Math.round((rawVal / 255) * 28));
    bars.push(height);
  }

  return bars;
}
