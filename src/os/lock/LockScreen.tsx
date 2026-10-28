"use client";

import { useState, useEffect, useCallback } from "react";
import { profile } from "../../../content/profile";
import { useSystemStore } from "@/lib/stores/system-store";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { getActiveWallpaper } from "@/lib/manifests";
import { initAudioContext } from "@/lib/audio-context";
import { ArrowRight, LockOpen, CornerDownLeft } from "lucide-react";

export function LockScreen() {
  const unlock = useSystemStore((state) => state.unlock);
  const locale = useSettingsStore((state) => state.locale);
  const wallpaperId = useSettingsStore((state) => state.wallpaperId);
  const accentColor = useSettingsStore((state) => state.accentColor);
  const wallpaper = getActiveWallpaper(wallpaperId);

  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleUnlock = useCallback(() => {
    initAudioContext();
    unlock();
  }, [unlock]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleUnlock();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUnlock]);

  const formattedTime = currentTime
    ? new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(currentTime)
    : "12:00";

  const formattedDate = currentTime
    ? new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }).format(currentTime)
    : "";

  const backgroundStyle = wallpaper.path
    ? {
        backgroundImage: `url(${wallpaper.path})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {
        background:
          "radial-gradient(circle at 50% 30%, #1e1b4b 0%, #09090b 70%, #000000 100%)",
      };

  return (
    <div
      data-testid="lock-screen"
      style={backgroundStyle}
      onClick={handleUnlock}
      className="fixed inset-0 z-40 flex flex-col justify-between items-center text-[var(--linux-text)] p-8 select-none overflow-hidden cursor-pointer"
    >
      {/* Hyprlock dark overlay */}
      <div className="absolute inset-0 bg-[#080b10]/70 backdrop-blur-[6px]" />

      {/* Top Clock and Date */}
      <div className="relative z-10 flex flex-col items-center mt-10 text-center pointer-events-none">
        <div className="linux-status-chip mb-3 border border-[var(--linux-border)] bg-[var(--linux-surface)]/80">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--linux-accent)]" />
          <span>SESSION LOCKED // HYPRLOCK</span>
        </div>
        <h1
          data-testid="lock-time"
          className="text-6xl md:text-7xl font-mono font-semibold tracking-tight text-[var(--linux-text)]"
        >
          {formattedTime}
        </h1>
        <p
          data-testid="lock-date"
          className="mt-2 text-xs md:text-sm font-mono uppercase tracking-widest text-[var(--linux-text-muted)]"
        >
          {formattedDate}
        </p>
      </div>

      {/* Center User Profile and Enter-to-Unlock Action */}
      <div
        className="relative z-10 flex flex-col items-center max-w-sm w-full mb-10 p-6 rounded-md bg-[var(--linux-surface)]/90 border border-[var(--linux-border-strong)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-md border bg-[var(--linux-surface-raised)] overflow-hidden"
          style={{ borderColor: accentColor || "var(--linux-accent)" }}
        >
          <div className="text-lg font-mono font-bold text-[var(--linux-accent)] tracking-widest">
            {profile.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
        </div>

        <h2
          data-testid="lock-user-name"
          className="text-base font-semibold text-[var(--linux-text)] mb-0.5"
        >
          {profile.name}
        </h2>
        <p className="text-xs text-[var(--linux-text-muted)] mb-5 font-mono">
          {profile.role}
        </p>

        {/* Hyprlock Enter-to-Unlock Button */}
        <button
          type="button"
          data-testid="lock-submit-button"
          onClick={handleUnlock}
          className="linux-focus-ring group relative w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-md bg-[var(--linux-surface-raised)] hover:bg-[var(--linux-surface-hover)] border border-[var(--linux-accent)]/60 hover:border-[var(--linux-accent)] transition-colors duration-150"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-[4px] bg-[var(--linux-accent)]/15 text-[var(--linux-accent)] font-mono text-xs">
              <CornerDownLeft className="h-3 w-3" />
            </div>
            <span className="text-xs font-mono font-medium tracking-wide text-[var(--linux-text)]">
              {locale === "id"
                ? "Tekan Enter atau Klik untuk Masuk"
                : "Press Enter or Click to Unlock"}
            </span>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-[var(--linux-accent)] group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Bottom Hyprland indicator */}
      <div className="relative z-10 flex items-center gap-2 text-[11px] font-mono text-[var(--linux-text-muted)] mb-2 px-3 py-1 rounded-[5px] bg-[var(--linux-surface)]/90 border border-[var(--linux-border)] pointer-events-none">
        <LockOpen className="h-3 w-3 text-[var(--linux-success)]" />
        <span>press Enter to start session</span>
      </div>
    </div>
  );
}
