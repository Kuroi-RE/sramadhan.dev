"use client";

import { useEffect, useRef } from "react";
import { LrcLine } from "@/lib/lrc-parser";
import { useLyricPulse } from "./useLyricPulse";
import { useSettingsStore } from "@/lib/stores/settings-store";

interface LyricsSheetProps {
  lyrics: LrcLine[];
  activeLineIndex: number;
  onSeek: (timeMs: number) => void;
}

export function LyricsSheet({
  lyrics,
  activeLineIndex,
  onSeek,
}: LyricsSheetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLParagraphElement>(null);
  const isPulsing = useLyricPulse(activeLineIndex);
  const locale = useSettingsStore((state) => state.locale);

  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView?.({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "center",
      });
    }
  }, [activeLineIndex, reducedMotion]);

  if (!lyrics || lyrics.length === 0) {
    return (
      <div
        data-testid="lyrics-empty"
        className="flex h-full w-full flex-col items-center justify-center p-8 text-center text-sm text-neutral-500"
      >
        <p className="font-medium">
          {locale === "id" ? "Lirik tidak tersedia" : "Lyrics not available"}
        </p>
        <p className="text-xs text-neutral-600 mt-1">
          {locale === "id"
            ? "File .lrc untuk lagu ini belum ditambahkan."
            : "No .lrc file found for this track."}
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      data-testid="lyrics-sheet"
      className="h-full w-full overflow-y-auto px-6 py-28 text-left space-y-7 select-none scroll-smooth scrollbar-none"
    >
      {lyrics.map((line, idx) => {
        const isActive = idx === activeLineIndex;
        const isPast = idx < activeLineIndex;

        return (
          <p
            key={`${line.timeMs}-${idx}`}
            ref={isActive ? activeLineRef : null}
            data-testid={`lyric-line-${idx}`}
            data-active={isActive ? "true" : "false"}
            onClick={() => onSeek(line.timeMs)}
            className={`cursor-pointer transition-all duration-300 font-bold tracking-tight text-xl md:text-2xl ${
              isActive
                ? `text-white opacity-100 scale-[1.03] origin-left drop-shadow-md ${
                    isPulsing && !reducedMotion ? "text-amber-200" : ""
                  }`
                : isPast
                  ? "text-neutral-400 opacity-40 hover:opacity-80"
                  : "text-neutral-300 opacity-40 hover:opacity-80"
            } ${!reducedMotion && !isActive ? "blur-[1px] hover:blur-none" : ""}`}
          >
            {line.text}
          </p>
        );
      })}
    </div>
  );
}
