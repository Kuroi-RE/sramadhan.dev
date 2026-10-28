"use client";

import { useState, useEffect } from "react";
import { useSystemStore } from "@/lib/stores/system-store";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { useWindowStore } from "@/lib/stores/window-store";
import { APP_REGISTRY, APP_LIST } from "../window-manager/app-registry";
import { getActiveWallpaper } from "@/lib/manifests";
import { getSysmonMetrics } from "@/notch/adapters/sysmon";
import { useBattery } from "@/notch/adapters/battery";
import { Lock, Terminal, Cpu, Clock, Battery, Globe } from "lucide-react";
import { useT } from "@/lib/i18n";
import { WindowManager } from "../window-manager/WindowManager";
import { Dock } from "../dock/Dock";
import { IslandView } from "@/notch/IslandView";

interface DesktopScreenProps {
  children?: React.ReactNode;
}

export function DesktopScreen({ children }: DesktopScreenProps) {
  const lock = useSystemStore((state) => state.lock);
  const { wallpaperId, locale, setLocale, accentColor } = useSettingsStore();
  const { activeWindowId, openWindow } = useWindowStore();
  const t = useT();
  const wallpaper = getActiveWallpaper(wallpaperId);
  const battery = useBattery();

  const [timeStr, setTimeStr] = useState("12:00:00");
  const [sysmonStep, setSysmonStep] = useState(0);
  const [activeWorkspace, setActiveWorkspace] = useState(1);

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(
        d.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
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
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const sysmon = getSysmonMetrics(sysmonStep);
  const activeAppMeta = activeWindowId ? APP_REGISTRY[activeWindowId] : null;

  const backgroundStyle = wallpaper.path
    ? {
        backgroundImage: `url(${wallpaper.path})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {
        background:
          "linear-gradient(180deg, #0d1117 0%, #080b10 60%, #05070a 100%)",
      };

  const handleWorkspaceClick = (ws: number) => {
    setActiveWorkspace(ws);
    const app = APP_LIST[ws - 1];
    if (app) {
      openWindow(app.id);
    }
  };

  return (
    <div
      data-testid="desktop-screen"
      style={backgroundStyle}
      className="relative h-screen w-screen overflow-hidden select-none bg-[var(--linux-bg)] text-[var(--linux-text)]"
    >
      {/* Dark Contrast Overlay for Hyprland Readability */}
      <div className="absolute inset-0 bg-[#080b10]/65 pointer-events-none" />

      {/* Waybar Modular Top Status Bar */}
      <header
        data-testid="desktop-top-bar"
        className="absolute top-0 left-0 right-0 h-8 bg-[var(--linux-surface)]/95 border-b border-[var(--linux-border)] px-2.5 flex items-center justify-between z-20 text-[11px] font-mono"
      >
        {/* Left Modules: System Identity & Workspaces */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--linux-surface-raised)] border border-[var(--linux-border)]">
            <span
              className="font-bold"
              style={{ color: accentColor || "var(--linux-accent)" }}
            >
              &gt;
            </span>
            <span className="font-semibold tracking-tight text-[var(--linux-text)]">
              sramadhan
            </span>
          </div>

          <div
            className="hidden sm:flex items-center gap-0.5 px-1 py-0.5 rounded bg-[var(--linux-bg)] border border-[var(--linux-border)]"
            role="group"
            aria-label="Workspaces"
          >
            {[1, 2, 3, 4, 5].map((ws) => {
              const isActive = activeWorkspace === ws;
              return (
                <button
                  key={ws}
                  type="button"
                  onClick={() => handleWorkspaceClick(ws)}
                  aria-label={`Workspace ${ws}`}
                  style={
                    isActive
                      ? {
                          borderColor: accentColor || "var(--linux-accent)",
                          backgroundColor: "rgba(var(--accent-rgb), 0.15)",
                          color: "var(--linux-text)",
                        }
                      : {}
                  }
                  className={`h-5 w-5 rounded-[4px] flex items-center justify-center text-[10px] font-mono font-semibold border transition-colors linux-focus-ring ${
                    isActive
                      ? ""
                      : "border-transparent text-[var(--linux-text-muted)] hover:text-[var(--linux-text)] hover:bg-[var(--linux-surface-hover)]"
                  }`}
                >
                  {ws}
                </button>
              );
            })}
          </div>
        </div>

        {/* Center Module: Active Application / Wayland Session */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-0.5 rounded bg-[var(--linux-surface-raised)] border border-[var(--linux-border)] text-[var(--linux-text-muted)]">
          <Terminal
            className="h-3 w-3"
            style={{ color: accentColor || "var(--linux-accent)" }}
          />
          <span className="truncate max-w-[260px] text-[var(--linux-text)]">
            {activeAppMeta
              ? `${t(activeAppMeta.titleKey)} — sramadhan@wayland`
              : "sramadhan@wayland"}
          </span>
        </div>

        {/* Right Modules: CPU/RAM, Battery, Language, Clock, Lock */}
        <div className="flex items-center gap-1.5">
          {/* CPU & RAM */}
          <div className="hidden md:flex items-center gap-2 px-2 py-0.5 rounded bg-[var(--linux-surface-raised)] border border-[var(--linux-border)] text-[var(--linux-text-muted)]">
            <Cpu className="h-3 w-3 text-[var(--linux-success)]" />
            <span>CPU {sysmon.cpu}%</span>
            <span className="text-[var(--linux-border-strong)]">|</span>
            <span>RAM {sysmon.ram}%</span>
          </div>

          {/* Battery if available */}
          {battery.isSupported && battery.level !== null && (
            <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--linux-surface-raised)] border border-[var(--linux-border)] text-[var(--linux-text-muted)]">
              <Battery className="h-3 w-3 text-[var(--linux-success)]" />
              <span>{battery.level}%</span>
            </div>
          )}

          {/* Language Switcher */}
          <button
            type="button"
            onClick={() => setLocale(locale === "id" ? "en" : "id")}
            aria-label="Switch language"
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--linux-surface-raised)] hover:bg-[var(--linux-surface-hover)] border border-[var(--linux-border)] hover:border-[var(--linux-border-strong)] text-[var(--linux-text)] transition-colors linux-focus-ring uppercase"
          >
            <Globe className="h-3 w-3 text-[var(--linux-text-muted)]" />
            <span>{locale}</span>
          </button>

          {/* Time */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--linux-surface-raised)] border border-[var(--linux-border)] text-[var(--linux-text)]">
            <Clock
              className="h-3 w-3"
              style={{ color: accentColor || "var(--linux-accent)" }}
            />
            <span>{timeStr}</span>
          </div>

          {/* Lock Button */}
          <button
            type="button"
            data-testid="desktop-lock-button"
            onClick={lock}
            aria-label={t("system.lock")}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--linux-surface-raised)] hover:bg-[var(--linux-danger)]/20 border border-[var(--linux-border)] hover:border-[var(--linux-danger)] transition-colors text-[var(--linux-text-muted)] hover:text-[var(--linux-danger)] linux-focus-ring"
            title={t("system.lock")}
          >
            <Lock className="h-3 w-3" />
            <span>{t("system.lock")}</span>
          </button>
        </div>
      </header>

      {/* Main desktop workspace where windows live */}
      <main className="relative h-full w-full pt-8 pb-20">
        <WindowManager />
        {children}
      </main>

      {/* System Status Widget (Notch PioPio) */}
      <IslandView />

      {/* Linux Taskbar / Launcher Dock */}
      <Dock />
    </div>
  );
}
