"use client";

import { APP_LIST } from "@/os/window-manager/app-registry";
import { useWindowStore } from "@/lib/stores/window-store";
import { useSystemStore } from "@/lib/stores/system-store";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { useT } from "@/lib/i18n";
import { Lock } from "lucide-react";

export function Dock() {
  const t = useT();
  const lock = useSystemStore((state) => state.lock);
  const accentColor = useSettingsStore((state) => state.accentColor);
  const { windows, activeWindowId, openWindow, focusWindow, minimizeWindow } =
    useWindowStore();

  const handleAppClick = (appId: string) => {
    const target = windows[appId];
    if (!target || !target.isOpen) {
      openWindow(appId);
    } else if (target.isMinimized) {
      focusWindow(appId);
    } else if (activeWindowId === appId) {
      minimizeWindow(appId);
    } else {
      focusWindow(appId);
    }
  };

  return (
    <footer
      data-testid="dock-container"
      className="fixed bottom-2.5 left-1/2 -translate-x-1/2 z-50 pointer-events-auto select-none"
    >
      <div className="flex items-center gap-1 rounded-[var(--radius-lg)] border border-[var(--surface-border-strong)] bg-[var(--surface-default)] px-2 py-2" style={{ boxShadow: 'var(--shadow-modal)' }}>
        {APP_LIST.map((app) => {
          const Icon = app.icon;
          const isRunning = windows[app.id]?.isOpen;
          const isActive =
            activeWindowId === app.id &&
            isRunning &&
            !windows[app.id]?.isMinimized;

          return (
            <div
              key={app.id}
              className="group relative flex flex-col items-center"
            >
              {/* Compact Linux Panel Tooltip */}
              <div className="pointer-events-none absolute -top-8 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-100 rounded-[var(--radius-xs)] bg-[var(--card-bg)] border border-[var(--surface-border-strong)] px-2 py-0.5 text-[11px] font-semibold text-[var(--text-primary)] shadow-md whitespace-nowrap" style={{ fontFamily: 'var(--font-sans)' }}>
                {t(app.titleKey)}
              </div>

              {/* Taskbar Launcher Button */}
              <button
                type="button"
                data-testid={`dock-icon-${app.id}`}
                onClick={() => handleAppClick(app.id)}
                style={
                  isActive
                    ? {
                        borderColor: accentColor || "var(--linux-accent)",
                        backgroundColor: "rgba(var(--accent-rgb), 0.12)",
                      }
                    : {}
                }
                className={`relative flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border transition-all linux-focus-ring ${
                  isActive
                    ? "text-[var(--text-primary)] bg-[var(--card-bg)] border-[var(--accent)]"
                    : "bg-[var(--card-bg)] hover:bg-[var(--card-bg-hover)] border-[var(--surface-border-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
                aria-label={t(app.titleKey)}
              >
                <Icon
                  className="h-4.5 w-4.5"
                  style={
                    isActive
                      ? { color: accentColor || "var(--linux-accent)" }
                      : {}
                  }
                />
              </button>

              {/* Running App Indicator Bar / Dot */}
              <div className="mt-1 h-1 w-4 flex items-center justify-center">
                {isRunning && (
                  <span
                    data-testid={`dock-running-dot-${app.id}`}
                    style={{
                      backgroundColor: isActive
                        ? accentColor || "var(--linux-accent)"
                        : "var(--linux-text-muted)",
                    }}
                    className={`h-0.5 rounded-full transition-all ${
                      isActive ? "w-4" : "w-1.5"
                    }`}
                  />
                )}
              </div>
            </div>
          );
        })}

        {/* Separator */}
        <div className="h-6 w-px bg-[var(--linux-border)] mx-1 self-center" />

        {/* Linux Status Lock Action */}
        <div className="group relative flex flex-col items-center">
          <div className="pointer-events-none absolute -top-8 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-100 rounded-[4px] bg-[var(--linux-surface-raised)] border border-[var(--linux-border-strong)] px-2 py-0.5 text-[11px] font-mono text-[var(--linux-text)] shadow-md whitespace-nowrap">
            {t("dock.lock")}
          </div>

          <button
            type="button"
            data-testid="dock-icon-lock"
            onClick={lock}
            className="flex h-9 w-9 items-center justify-center rounded-[5px] bg-[var(--linux-surface-raised)] hover:bg-[var(--linux-danger)]/20 border border-[var(--linux-border)] hover:border-[var(--linux-danger)] text-[var(--linux-warning)] hover:text-[var(--linux-danger)] transition-colors linux-focus-ring"
            aria-label={t("dock.lock")}
          >
            <Lock className="h-4 w-4" />
          </button>
          <div className="mt-1 h-1 w-4" />
        </div>
      </div>
    </footer>
  );
}
