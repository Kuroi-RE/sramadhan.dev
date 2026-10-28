"use client";

import { Rnd } from "react-rnd";
import { WindowInstance, AppMetadata } from "./types";
import { useWindowStore } from "@/lib/stores/window-store";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { useT } from "@/lib/i18n";

interface WindowFrameProps {
  instance: WindowInstance;
  metadata: AppMetadata;
}

export function WindowFrame({ instance, metadata }: WindowFrameProps) {
  const t = useT();
  const {
    focusWindow,
    minimizeWindow,
    maximizeWindow,
    closeWindow,
    updateBounds,
    activeWindowId,
  } = useWindowStore();
  const accentColor = useSettingsStore((state) => state.accentColor);
  const isFocused = activeWindowId === instance.id;

  if (!instance.isOpen || instance.isMinimized) {
    return null;
  }

  const Component = metadata.component;
  const Icon = metadata.icon;

  const rndPosition = instance.isMaximized
    ? { x: 0, y: 0 }
    : { x: instance.bounds.x, y: instance.bounds.y };

  const rndSize = instance.isMaximized
    ? { width: "100%", height: "100%" }
    : { width: instance.bounds.width, height: instance.bounds.height };

  return (
    <Rnd
      data-testid={`window-${instance.id}`}
      bounds="parent"
      position={rndPosition}
      size={rndSize}
      minWidth={metadata.minWidth}
      minHeight={metadata.minHeight}
      dragHandleClassName="window-titlebar"
      disableDragging={instance.isMaximized}
      enableResizing={!instance.isMaximized}
      style={{
        zIndex: instance.zIndex,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderColor: instance.isMaximized
          ? "transparent"
          : isFocused
            ? accentColor || "var(--accent)"
            : "rgba(222, 226, 230, 0.08)",
        borderWidth: "1px",
        boxShadow: isFocused ? "var(--shadow-card-big)" : "var(--shadow-tile)",
      }}
      onMouseDown={() => focusWindow(instance.id)}
      onDragStop={(_e, d) => {
        if (!instance.isMaximized) {
          updateBounds(instance.id, {
            ...instance.bounds,
            x: d.x,
            y: d.y,
          });
        }
      }}
      onResizeStop={(_e, _dir, ref, _delta, pos) => {
        if (!instance.isMaximized) {
          updateBounds(instance.id, {
            x: pos.x,
            y: pos.y,
            width: parseInt(ref.style.width, 10),
            height: parseInt(ref.style.height, 10),
          });
        }
      }}
      className={`pointer-events-auto absolute flex flex-col rounded-[var(--radius-md)] bg-[var(--surface-default)] overflow-hidden transition-all ${
        instance.isMaximized ? "rounded-none border-0" : ""
      } ${isFocused ? "opacity-100" : "opacity-95"}`}
    >
      {/* Linux / Hyprland Title Bar */}
      <div
        data-testid={`window-titlebar-${instance.id}`}
        className={`window-titlebar shrink-0 sticky top-0 z-20 flex h-9 w-full items-center justify-between border-b px-4 cursor-grab active:cursor-grabbing select-none transition-colors ${
          isFocused
            ? "bg-[var(--card-bg)] text-[var(--text-primary)] border-[var(--surface-border-strong)]"
            : "bg-[var(--surface-default)] text-[var(--text-secondary)] border-[rgba(222, 226, 230, 0.08)]"
        }`}
        onDoubleClick={() => maximizeWindow(instance.id)}
      >
        {/* Left: App Icon, Title & Mode Tag */}
        <div className="flex items-center gap-2 text-sm" style={{ fontFamily: 'var(--font-sans)' }}>
          <Icon
            className="h-4 w-4 shrink-0"
            style={{
              color: isFocused
                ? accentColor || "var(--accent)"
                : "var(--text-secondary)",
            }}
          />
          <span className="font-semibold tracking-tight">
            {t(instance.titleKey)}
          </span>
          <span className="px-2 py-0.5 rounded-[var(--radius-xs)] bg-[var(--page-bg)] border border-[var(--surface-border-strong)] text-[10px] font-semibold text-[var(--text-secondary)] uppercase" style={{ fontFamily: 'var(--font-sans)' }}>
            {instance.isMaximized ? "fullscreen" : "floating"}
          </span>
        </div>

        {/* Right: Neutral Linux Window Controls (—, □, ×) */}
        <div className="flex items-center gap-1 font-mono text-xs">
          <button
            type="button"
            data-testid={`window-minimize-${instance.id}`}
            onClick={(e) => {
              e.stopPropagation();
              minimizeWindow(instance.id);
            }}
            className="flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--surface-default)] hover:bg-[var(--card-bg-hover)] border border-[var(--surface-border-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors linux-focus-ring"
            aria-label={t("common.minimize")}
            title={t("common.minimize")}
          >
            −
          </button>
          <button
            type="button"
            data-testid={`window-maximize-${instance.id}`}
            onClick={(e) => {
              e.stopPropagation();
              maximizeWindow(instance.id);
            }}
            className="flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--surface-default)] hover:bg-[var(--card-bg-hover)] border border-[var(--surface-border-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors linux-focus-ring"
            aria-label={t("common.maximize")}
            title={t("common.maximize")}
          >
            □
          </button>
          <button
            type="button"
            data-testid={`window-close-${instance.id}`}
            onClick={(e) => {
              e.stopPropagation();
              closeWindow(instance.id);
            }}
            className="flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--surface-default)] hover:bg-[var(--negative-tint)] border border-[var(--surface-border-strong)] hover:border-[var(--negative)] text-[var(--text-secondary)] hover:text-[var(--negative)] transition-colors linux-focus-ring"
            aria-label={t("common.close")}
            title={t("common.close")}
          >
            ×
          </button>
        </div>
      </div>

      {/* Window Body */}
      <div className="flex-1 min-h-0 w-full overflow-hidden flex flex-col bg-[var(--surface-default)]">
        <Component />
      </div>
    </Rnd>
  );
}
