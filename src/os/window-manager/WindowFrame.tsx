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
            ? accentColor || "var(--linux-accent)"
            : "var(--linux-border)",
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
      className={`pointer-events-auto absolute flex flex-col rounded-md border bg-[var(--linux-surface)] overflow-hidden transition-shadow ${
        instance.isMaximized ? "rounded-none border-0" : ""
      } ${isFocused ? "shadow-2xl opacity-100" : "shadow-md opacity-95"}`}
    >
      {/* Linux / Hyprland Title Bar */}
      <div
        data-testid={`window-titlebar-${instance.id}`}
        className={`window-titlebar shrink-0 sticky top-0 z-20 flex h-8 w-full items-center justify-between border-b border-[var(--linux-border)] px-3 cursor-grab active:cursor-grabbing select-none transition-colors ${
          isFocused
            ? "bg-[var(--linux-surface-raised)] text-[var(--linux-text)]"
            : "bg-[var(--linux-surface)] text-[var(--linux-text-muted)]"
        }`}
        onDoubleClick={() => maximizeWindow(instance.id)}
      >
        {/* Left: App Icon, Title & Mode Tag */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <Icon
            className="h-3.5 w-3.5 shrink-0"
            style={{
              color: isFocused
                ? accentColor || "var(--linux-accent)"
                : "var(--linux-text-muted)",
            }}
          />
          <span className="font-semibold tracking-tight">
            {t(instance.titleKey)}
          </span>
          <span className="px-1.5 py-0.5 rounded-[4px] bg-[var(--linux-bg)] border border-[var(--linux-border)] text-[10px] font-mono text-[var(--linux-text-subtle)] uppercase">
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
            className="flex h-6 w-6 items-center justify-center rounded-[4px] bg-[var(--linux-surface)] hover:bg-[var(--linux-surface-hover)] border border-[var(--linux-border)] text-[var(--linux-text-muted)] hover:text-[var(--linux-text)] transition-colors linux-focus-ring"
            aria-label={t("common.minimize")}
            title={t("common.minimize")}
          >
            —
          </button>
          <button
            type="button"
            data-testid={`window-maximize-${instance.id}`}
            onClick={(e) => {
              e.stopPropagation();
              maximizeWindow(instance.id);
            }}
            className="flex h-6 w-6 items-center justify-center rounded-[4px] bg-[var(--linux-surface)] hover:bg-[var(--linux-surface-hover)] border border-[var(--linux-border)] text-[var(--linux-text-muted)] hover:text-[var(--linux-text)] transition-colors linux-focus-ring"
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
            className="flex h-6 w-6 items-center justify-center rounded-[4px] bg-[var(--linux-surface)] hover:bg-[var(--linux-danger)]/20 border border-[var(--linux-border)] hover:border-[var(--linux-danger)] text-[var(--linux-text-muted)] hover:text-[var(--linux-danger)] transition-colors linux-focus-ring"
            aria-label={t("common.close")}
            title={t("common.close")}
          >
            ×
          </button>
        </div>
      </div>

      {/* Window Body */}
      <div className="flex-1 min-h-0 w-full overflow-hidden flex flex-col bg-[var(--linux-surface)]">
        <Component />
      </div>
    </Rnd>
  );
}
