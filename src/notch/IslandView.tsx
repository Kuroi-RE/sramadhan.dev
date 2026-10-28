"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ISLAND_GEOMETRY } from "./geometry";
import { PandaMascot } from "./PandaMascot";
import { Spectrum } from "./Spectrum";
import { MetricRing } from "./MetricRing";
import { getSysmonMetrics } from "./adapters/sysmon";
import { useBattery } from "./adapters/battery";
import { usePlayerStore } from "@/lib/stores/player-store";
import { useWindowStore } from "@/lib/stores/window-store";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { useCurrentLyric } from "@/apps/music/lyrics/useCurrentLyric";
import { APP_LIST } from "@/os/window-manager/app-registry";
import { Play, Pause, SkipBack, SkipForward, Music } from "lucide-react";

export function IslandView() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [timeStr, setTimeStr] = useState("12:00");
  const [sysmonStep, setSysmonStep] = useState(0);

  const {
    isPlaying,
    queue,
    currentTrackIndex,
    lyrics,
    togglePlay,
    nextTrack,
    prevTrack,
  } = usePlayerStore();

  const openWindow = useWindowStore((state) => state.openWindow);
  const accentColor = useSettingsStore((state) => state.accentColor);
  const track = queue[currentTrackIndex] || null;
  const { currentLine } = useCurrentLyric(lyrics);
  const battery = useBattery();

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(
        d.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSysmonStep((s) => s + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const sysmon = getSysmonMetrics(sysmonStep);

  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div
      data-testid="island-container"
      className="fixed top-1 left-1/2 -translate-x-1/2 z-[9999] pointer-events-auto select-none"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      onClick={() => setIsExpanded((prev) => !prev)}
    >
      <motion.div
        data-testid="island-view"
        layout
        initial={false}
        animate={{
          width: isExpanded
            ? ISLAND_GEOMETRY.expanded.width
            : ISLAND_GEOMETRY.collapsed.width,
          height: isExpanded
            ? ISLAND_GEOMETRY.expanded.height
            : ISLAND_GEOMETRY.collapsed.height,
          borderRadius: isExpanded
            ? ISLAND_GEOMETRY.expanded.borderRadius
            : ISLAND_GEOMETRY.collapsed.borderRadius,
        }}
        transition={
          reducedMotion
            ? { duration: 0.01 }
            : { type: "spring", stiffness: 450, damping: 30 }
        }
        style={{
          borderColor: isExpanded
            ? accentColor || "var(--accent)"
            : "var(--surface-border-strong)",
          boxShadow: 'var(--shadow-card-big)',
        }}
        className="relative overflow-hidden bg-[var(--card-bg)] text-[var(--text-primary)] border flex flex-col justify-between"
      >
        {!isExpanded ? (
          /* COLLAPSED VIEW (Waybar / eww Status Module) */
          <motion.div
            key="collapsed"
            data-testid="notch-collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex h-full w-full items-center justify-between px-3"
          >
            <div className="flex items-center gap-2">
              <PandaMascot size={18} isSleeping={!isPlaying} />
              <span className="text-[12px] font-medium text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-jetbrains-mono)', fontVariantNumeric: 'tabular-nums' }}>
                {timeStr}
              </span>
            </div>

            <div className="flex items-center gap-2 max-w-[120px]">
              {track ? (
                <>
                  <span className="text-[12px] text-[var(--text-secondary)] truncate" style={{ fontFamily: 'var(--font-sans)' }}>
                    {track.title}
                  </span>
                  {isPlaying ? (
                    <Spectrum barCount={6} height={12} />
                  ) : (
                    <Music className="h-3 w-3 text-[var(--text-secondary)] shrink-0" />
                  )}
                </>
              ) : (
                <span className="text-[12px] text-[var(--text-secondary)] font-mono tracking-wide" style={{ fontFamily: 'var(--font-sans)' }}>
                  syswidget
                </span>
              )}
            </div>
          </motion.div>
        ) : (
          /* EXPANDED VIEW (eww System & Media Widget) */
          <motion.div
            key="expanded"
            data-testid="notch-expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex h-full w-full flex-col justify-between p-3"
          >
            {/* Top Row: System Rings & Music Controls */}
            <div className="flex items-center justify-between">
              {/* Left: Metric Rings */}
              <div className="flex items-center gap-3">
                <MetricRing
                  label="CPU"
                  value={sysmon.cpu}
                  color={accentColor || "#1ab8c7"}
                />
                <MetricRing label="RAM" value={sysmon.ram} color="#1ab8c7" />
                {battery.isSupported && battery.level !== null && (
                  <MetricRing
                    label={battery.charging ? "CHRG" : "BAT"}
                    value={battery.level}
                    color={battery.level > 20 ? "#7fe089" : "#f97d7d"}
                  />
                )}
              </div>

              {/* Right: Music Playback Controls & Mini Spectrum */}
              <div className="flex flex-col items-end gap-1.5">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    data-testid="notch-prev-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      prevTrack();
                    }}
                    className="p-1 rounded bg-[var(--linux-surface-raised)] border border-[var(--linux-border)] text-[var(--linux-text-muted)] hover:text-[var(--linux-text)] hover:border-[var(--linux-border-strong)] transition-colors linux-focus-ring"
                    aria-label="Previous track"
                  >
                    <SkipBack className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    data-testid="notch-play-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlay();
                    }}
                    style={{
                      borderColor: accentColor || "var(--linux-accent)",
                    }}
                    className="flex h-6 w-6 items-center justify-center rounded bg-[var(--linux-surface-raised)] border text-[var(--linux-text)] hover:bg-[var(--linux-surface-hover)] transition-colors linux-focus-ring"
                    aria-label="Play or pause"
                  >
                    {isPlaying ? (
                      <Pause className="h-3 w-3" />
                    ) : (
                      <Play className="h-3 w-3 ml-0.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    data-testid="notch-next-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      nextTrack();
                    }}
                    className="p-1 rounded bg-[var(--linux-surface-raised)] border border-[var(--linux-border)] text-[var(--linux-text-muted)] hover:text-[var(--linux-text)] hover:border-[var(--linux-border-strong)] transition-colors linux-focus-ring"
                    aria-label="Next track"
                  >
                    <SkipForward className="h-3 w-3" />
                  </button>
                </div>
                <Spectrum barCount={12} height={12} />
              </div>
            </div>

            {/* Middle Row: Active Song Title & Live Lyric Line */}
            <div className="my-auto text-center px-2 py-1 rounded bg-[var(--linux-bg)] border border-[var(--linux-border)]">
              <div className="text-xs font-mono font-semibold text-[var(--linux-text)] truncate">
                {track
                  ? `${track.title} · ${track.artist}`
                  : "No active audio stream"}
              </div>
              <div
                data-testid="notch-lyric-line"
                style={{ color: accentColor || "var(--linux-accent)" }}
                className="text-[11px] font-mono truncate min-h-[16px] mt-0.5"
              >
                {currentLine
                  ? currentLine.text
                  : track
                    ? "♪ ♪ ♪"
                    : "eww • system status widget"}
              </div>
            </div>

            {/* Bottom Row: App Shortcuts */}
            <div className="flex items-center justify-center gap-1.5 pt-1 border-t border-[var(--linux-border)]">
              {APP_LIST.map((app) => {
                const Icon = app.icon;
                return (
                  <button
                    key={app.id}
                    type="button"
                    data-testid={`notch-shortcut-${app.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      openWindow(app.id);
                      setIsExpanded(false);
                    }}
                    aria-label={app.id}
                    className="flex h-6 w-6 items-center justify-center rounded bg-[var(--linux-surface-raised)] border border-[var(--linux-border)] hover:border-[var(--linux-accent)] hover:bg-[var(--linux-surface-hover)] text-[var(--linux-text)] transition-colors linux-focus-ring"
                    title={app.id}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
