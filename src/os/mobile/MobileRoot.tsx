"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { APP_LIST, APP_REGISTRY } from "@/os/window-manager/app-registry";
import { useWindowStore } from "@/lib/stores/window-store";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { useT } from "@/lib/i18n";
import { getActiveWallpaper } from "@/lib/manifests";
import { IslandView } from "@/notch/IslandView";
import { useBattery } from "@/notch/adapters/battery";
import { Wifi, Battery, X } from "lucide-react";

const BANNER_STORAGE_KEY = "dismissed_desktop_banner";

export function MobileRoot() {
  const t = useT();
  const wallpaperId = useSettingsStore((state) => state.wallpaperId);
  const locale = useSettingsStore((state) => state.locale);
  const wallpaper = getActiveWallpaper(wallpaperId);

  const { activeWindowId, openWindow, closeWindow } = useWindowStore();
  const battery = useBattery();

  const [currentTime, setCurrentTime] = useState("12:00");
  const [showBanner, setShowBanner] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(BANNER_STORAGE_KEY) !== "true";
    }
    return true;
  });

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTime(
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

  const handleDismissBanner = () => {
    setShowBanner(false);
    try {
      localStorage.setItem(BANNER_STORAGE_KEY, "true");
    } catch {
      // ignore
    }
  };

  const activeAppMeta = activeWindowId ? APP_REGISTRY[activeWindowId] : null;
  const ActiveComponent = activeAppMeta?.component;

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

  const dockApps = APP_LIST.slice(0, 4);

  return (
    <div
      data-testid="mobile-root"
      style={backgroundStyle}
      className="relative h-screen w-screen overflow-hidden select-none bg-[var(--linux-bg)] text-[var(--linux-text)] flex flex-col justify-between"
    >
      {/* Hyprland dark contrast overlay */}
      <div className="absolute inset-0 bg-[#080b10]/70 pointer-events-none" />

      {/* Minimal Linux Status Bar */}
      <header
        data-testid="mobile-status-bar"
        className="h-9 px-4 border-b border-[var(--linux-border)] bg-[var(--linux-surface)]/95 flex items-center justify-between text-xs font-mono text-[var(--linux-text)] z-20 shrink-0"
      >
        <div className="flex items-center gap-2">
          <span className="text-[var(--linux-accent)] font-bold">&gt;</span>
          <span data-testid="mobile-clock">{currentTime}</span>
        </div>
        <div className="flex items-center gap-2 text-[var(--linux-text-muted)]">
          <Wifi className="h-3 w-3 text-[var(--linux-accent)]" />
          <span
            data-testid="mobile-battery-level"
            className="text-[10px] font-mono"
          >
            {battery.level}%
          </span>
          <Battery className="h-3.5 w-3.5 text-[var(--linux-success)]" />
        </div>
      </header>

      {/* System Status Widget at top */}
      <div className="relative z-30 flex justify-center mt-2">
        <IslandView />
      </div>

      {/* Best Viewed on Desktop Banner */}
      {showBanner && (
        <div
          data-testid="desktop-banner"
          className="mx-4 mt-3 flex items-center justify-between p-2.5 rounded-md bg-[var(--linux-surface)]/95 border border-[var(--linux-border-strong)] text-xs font-mono text-[var(--linux-text-muted)] z-20"
        >
          <span>
            {locale === "id"
              ? "[info] Pengalaman terbaik dibuka di komputer / desktop."
              : "[info] Best experienced on desktop / PC browser."}
          </span>
          <button
            type="button"
            data-testid="dismiss-banner-btn"
            onClick={handleDismissBanner}
            className="p-1 rounded-[4px] hover:bg-[var(--linux-surface-hover)] text-[var(--linux-text-muted)] hover:text-[var(--linux-text)] transition-colors"
            aria-label="Close banner"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Main Home Screen App Tile Grid */}
      <main className="relative flex-1 px-5 py-6 grid grid-cols-4 gap-y-5 gap-x-3 items-start content-start z-10">
        {APP_LIST.map((app) => {
          const Icon = app.icon;
          return (
            <button
              key={app.id}
              type="button"
              data-testid={`mobile-app-icon-${app.id}`}
              onClick={() => openWindow(app.id)}
              className="flex flex-col items-center gap-1.5 group outline-none"
            >
              <div className="h-13 w-13 rounded-md bg-[var(--linux-surface)]/95 border border-[var(--linux-border-strong)] group-hover:border-[var(--linux-accent)] flex items-center justify-center group-active:scale-95 transition-all">
                <Icon className="h-6 w-6 text-[var(--linux-accent)]" />
              </div>
              <span className="text-[11px] font-mono text-[var(--linux-text)] truncate max-w-[68px]">
                {t(app.titleKey)}
              </span>
            </button>
          );
        })}
      </main>

      {/* Linux Bottom Panel Launcher */}
      <footer
        data-testid="mobile-dock"
        className="p-3 flex justify-center z-10 shrink-0"
      >
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-md bg-[var(--linux-surface)]/95 border border-[var(--linux-border-strong)]">
          {dockApps.map((app) => {
            const Icon = app.icon;
            return (
              <button
                key={app.id}
                type="button"
                data-testid={`mobile-dock-icon-${app.id}`}
                onClick={() => openWindow(app.id)}
                className="h-10 w-10 rounded-[5px] bg-[var(--linux-surface-raised)] border border-[var(--linux-border)] hover:border-[var(--linux-accent)] flex items-center justify-center active:scale-95 transition-all"
                aria-label={t(app.titleKey)}
              >
                <Icon className="h-5 w-5 text-[var(--linux-text)]" />
              </button>
            );
          })}
        </div>
      </footer>

      {/* Fullscreen Mobile App View with Linux Window Header */}
      <AnimatePresence>
        {activeWindowId && ActiveComponent && (
          <motion.div
            key={activeWindowId}
            data-testid={`mobile-fullscreen-app-${activeWindowId}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed inset-0 z-40 bg-[var(--linux-surface)] flex flex-col overflow-hidden"
          >
            {/* Linux Window-Style Top Header */}
            <div className="h-10 flex items-center justify-between px-3.5 border-b border-[var(--linux-border)] bg-[var(--linux-bg)] text-xs font-mono text-[var(--linux-text)] shrink-0">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-[2px] bg-[var(--linux-accent)]" />
                <span className="font-semibold">
                  {t(activeAppMeta.titleKey)}
                </span>
                <span className="text-[10px] text-[var(--linux-text-subtle)]">
                  [tile]
                </span>
              </div>
              <button
                type="button"
                data-testid="mobile-app-close-btn"
                onClick={() => closeWindow(activeWindowId)}
                className="flex h-6 w-6 items-center justify-center rounded-[4px] bg-[var(--linux-surface-raised)] border border-[var(--linux-border)] hover:border-[var(--linux-danger)] text-[var(--linux-text-muted)] hover:text-[var(--linux-danger)]"
                aria-label="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* App Body */}
            <div className="flex-1 overflow-hidden">
              <ActiveComponent />
            </div>

            {/* Compact Bottom Action Bar (Click / Tap to close app) */}
            <div
              data-testid="mobile-home-indicator"
              onClick={() => closeWindow(activeWindowId)}
              className="h-7 w-full border-t border-[var(--linux-border)] bg-[var(--linux-bg)] flex items-center justify-center gap-2 cursor-pointer shrink-0 active:opacity-70 text-[10px] font-mono text-[var(--linux-text-muted)]"
            >
              <div className="h-1 w-16 rounded-none bg-[var(--linux-accent)]/70" />
              <span>close workspace</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
