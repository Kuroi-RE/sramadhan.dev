"use client";

import { useEffect, useState } from "react";
import { getSpectrumBars } from "./adapters/spectrum";
import { usePlayerStore } from "@/lib/stores/player-store";

interface SpectrumProps {
  barCount?: number;
  height?: number;
  className?: string;
}

export function Spectrum({
  barCount = 10,
  height = 18,
  className = "",
}: SpectrumProps) {
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const [activeBars, setActiveBars] = useState<number[]>(() =>
    new Array(barCount).fill(4)
  );

  useEffect(() => {
    if (!isPlaying) return;

    let animId: number;
    const tick = () => {
      setActiveBars(getSpectrumBars(barCount));
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isPlaying, barCount]);

  const bars = isPlaying ? activeBars : new Array(barCount).fill(4);

  return (
    <div
      data-testid="notch-spectrum"
      className={`flex items-end gap-[2px] h-[${height}px] ${className}`}
      style={{ height }}
    >
      {bars.map((barH, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-gradient-to-t from-blue-500 to-indigo-400 transition-all duration-75"
          style={{ height: `${Math.min(height, barH)}px` }}
        />
      ))}
    </div>
  );
}
