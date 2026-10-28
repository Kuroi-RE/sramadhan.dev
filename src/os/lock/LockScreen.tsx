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
      className="fixed inset-0 z-40 flex flex-col justify-between items-center text-[var(--text-primary)] p-8 select-none overflow-hidden cursor-pointer"
    >
      {/* Hyprlock dark overlay */}
      <div className="absolute inset-0 bg-[rgba(4,13,63,0.78)] backdrop-blur-[8px]" />

      {/* Top Clock and Date */}
      <div className="relative z-10 flex flex-col items-center mt-10 text-center pointer-events-none">
        <div className="midnight-badge mb-3 bg-[var(--info-cyan-tint)] text-[var(--info-cyan-bright)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--info-cyan-bright)] inline-block mr-2" />
          SESSION LOCKED // HYPRLOCK
        </div>
        <h1
          data-testid="lock-time"
          className="text-6xl md:text-7xl font-semibold tracking-tight text-[var(--text-primary)]"
          style={{ fontFamily: 'var(--font-jetbrains-mono)', fontVariantNumeric: 'tabular-nums' }}
        >
          {formattedTime}
        </h1>
        <p
          data-testid="lock-date"
          className="mt-2 text-xs md:text-sm uppercase tracking-widest text-[var(--text-secondary)]"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          {formattedDate}
        </p>
      </div>

      {/* Center User Profile and Enter-to-Unlock Action */}
      <div
        className="relative z-10 flex flex-col items-center max-w-sm w-full mb-10 p-6 rounded-[var(--radius-lg)] bg-[var(--surface-default)] border border-[var(--surface-border-strong)]"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: 'var(--shadow-modal)' }}
      >
        <div
          className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-[var(--radius-full)] border-2 bg-[var(--card-bg)] overflow-hidden"
          style={{ borderColor: accentColor || "var(--accent)" }}
        >
          <div className="text-lg font-bold text-[var(--text-primary)] tracking-widest" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
            {profile.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
        </div>

        <h2
          data-testid="lock-user-name"
          className="text-base font-semibold text-[var(--text-primary)] mb-0.5"
        >
          {profile.name}
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mb-5" style={{ fontFamily: 'var(--font-sans)' }}>
          {profile.role}
        </p>

        {/* Hyprlock Unlock Button - Pill Primary */}
        <button
          type="button"
          data-testid="lock-submit-button"
          onClick={handleUnlock}
          className="linux-focus-ring group relative w-full px-6 py-3 rounded-[var(--radius-full)] bg-[#ffffff] hover:bg-[#f0f0f0] text-[#040d3f] font-semibold transition-all duration-150"
        >
          <div className="flex items-center justify-center gap-2">
            <CornerDownLeft className="h-4 w-4" />
            <span className="text-sm" style={{ fontFamily: 'var(--font-sans)' }}>
              {locale === "id"
                ? "Tekan Enter atau Klik untuk Masuk"
                : "Press Enter or Click to Unlock"}
            </span>
          </div>
        </button>
      </div>

      {/* Bottom Hyprland indicator */}
      <div className="relative z-10 flex items-center gap-2 text-[11px] text-[var(--text-secondary)] mb-2 px-3 py-1 rounded-[var(--radius-sm)] bg-[var(--card-bg)] border border-[var(--surface-border-strong)] pointer-events-none" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
        <LockOpen className="h-3 w-3 text-[var(--positive)]" />
        <span>press Enter to start session</span>
      </div>
    </div>
  );
}
