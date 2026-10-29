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
          "linear-gradient(180deg, #141c4e 0%, #040d3f 60%, #030925 100%)",
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
      className="relative h-screen w-screen overflow-hidden select-none bg-[var(--page-bg)] text-[var(--text-primary)]"
    >
      {/* Dark Contrast Overlay for Hyprland Readability */}
      <div className="absolute inset-0 bg-[rgba(4,13,63,0.72)] pointer-events-none" />

      {/* Waybar Modular Top Status Bar */}
      <header
        data-testid="desktop-top-bar"
        className="absolute top-0 left-0 right-0 h-10 bg-[var(--surface-default)] px-6 flex items-center justify-between z-20 text-sm"
        style={{
          fontFamily: "var(--font-jetbrains-mono)",
          boxShadow: "var(--shadow-tile)",
        }}
      >
        {/* Left Modules: System Identity, Workspaces & Active Application Info */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--card-bg)] border border-[var(--surface-border-strong)]">
            <span
              className="font-bold"
              style={{ color: accentColor || "var(--accent)" }}
            >
              &gt;
            </span>
            <span className="font-semibold tracking-tight text-[var(--text-primary)]">
              sramadhan
            </span>
          </div>

          <div
            className="hidden sm:flex items-center gap-1 px-1.5 py-1 rounded-[var(--radius-sm)] bg-[var(--page-bg)] border border-[var(--surface-border-strong)]"
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
                          backgroundColor: "var(--card-bg)",
                          color: "var(--text-primary)",
                          borderColor: "var(--accent)",
                          borderBottomColor: "var(--accent)",
                          borderBottomWidth: "2px",
                        }
                      : {}
                  }
                  className={`h-6 w-6 rounded-[var(--radius-xs)] flex items-center justify-center text-xs font-semibold border transition-colors linux-focus-ring ${
                    isActive
                      ? ""
                      : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-bg-hover)]"
                  }`}
                >
                  {ws}
                </button>
              );
            })}
          </div>

          {/* Active Application / Wayland Session (Moved to left to prevent overlap with Notch PioPio) */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--card-bg)] border border-[var(--surface-border-strong)] text-[var(--text-secondary)]">
            <Terminal
              className="h-4 w-4"
              style={{ color: accentColor || "var(--accent)" }}
            />
            <span
              className="truncate max-w-xs text-[var(--text-primary)]"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {activeAppMeta
                ? `${t(activeAppMeta.titleKey)} // sramadhan@wayland`
                : "sramadhan@wayland"}
            </span>
          </div>
        </div>

        {/* Center space kept empty for Notch PioPio (IslandView) */}
        <div className="flex-1" aria-hidden="true" />

        {/* Right Modules: CPU/RAM, Battery, Language, Clock, Lock */}
        <div className="flex items-center gap-1.5">
          {/* CPU & RAM */}
          <div
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--card-bg)] border border-[var(--surface-border-strong)] text-[var(--text-secondary)]"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            <Cpu className="h-4 w-4 text-[var(--positive)]" />
            <span>CPU {sysmon.cpu}%</span>
            <span className="text-[var(--surface-border-strong)]">·</span>
            <span>RAM {sysmon.ram}%</span>
          </div>

          {/* Battery if available */}
          {battery.isSupported && battery.level !== null && (
            <div
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--card-bg)] border border-[var(--surface-border-strong)] text-[var(--text-secondary)]"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              <Battery className="h-4 w-4 text-[var(--positive)]" />
              <span>{battery.level}%</span>
            </div>
          )}

          {/* Language Switcher */}
          <button
            type="button"
            onClick={() => setLocale(locale === "id" ? "en" : "id")}
            aria-label="Switch language"
            className="flex items-center gap-1 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--card-bg)] hover:bg-[var(--card-bg-hover)] border border-[var(--surface-border-strong)] text-[var(--text-primary)] transition-colors linux-focus-ring uppercase text-xs font-semibold"
          >
            <Globe className="h-4 w-4 text-[var(--text-secondary)]" />
            <span>{locale}</span>
          </button>

          {/* Time */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--card-bg)] border border-[var(--surface-border-strong)] text-[var(--text-primary)]"
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <Clock
              className="h-4 w-4"
              style={{ color: accentColor || "var(--accent)" }}
            />
            <span>{timeStr}</span>
          </div>

          {/* Lock Button - Pill Action */}
          <button
            type="button"
            data-testid="desktop-lock-button"
            onClick={lock}
            aria-label={t("system.lock")}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-[var(--radius-full)] bg-[var(--negative-tint)] hover:bg-[var(--negative-tint)] border border-[var(--negative)] text-[var(--negative)] transition-all text-xs font-semibold linux-focus-ring"
            title={t("system.lock")}
          >
            <Lock className="h-4 w-4" />
            <span>{t("system.lock")}</span>
          </button>
        </div>
      </header>

      {/* Main desktop workspace where windows live */}
      <main className="relative h-full w-full pt-10 pb-20">
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
