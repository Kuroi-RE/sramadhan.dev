"use client";

import { useEffect, useState } from "react";
import { useSystemStore } from "@/lib/stores/system-store";
import { useT } from "@/lib/i18n";
import { getDefaultWallpaper } from "@/lib/manifests";

export function BootScreen() {
  const finishBoot = useSystemStore((state) => state.finishBoot);
  const t = useT();
  const [progress, setProgress] = useState(10);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    let isMounted = true;
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const hasBooted =
      typeof window !== "undefined" &&
      sessionStorage.getItem("has_booted_session") === "true";

    // Fast-boot if already booted in session or reduced-motion requested
    if (hasBooted || reducedMotion) {
      const timer = setTimeout(
        () => {
          if (isMounted) finishBoot();
        },
        hasBooted ? 120 : 300
      );
      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    }

    // Real preload tasks with timeout guarantee
    const preloadTasks: Promise<unknown>[] = [];

    // Task 1: preload wallpaper image
    const wp = getDefaultWallpaper();
    if (wp && wp.path) {
      const imgTask = new Promise((resolve) => {
        const img = new Image();
        img.src = wp.path;
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
      });
      preloadTasks.push(imgTask);
    }

    // Task 2: preload font if FontFace API is available
    if (typeof document !== "undefined" && "fonts" in document) {
      preloadTasks.push(document.fonts.ready);
    }

    let completedTasks = 0;
    const totalCount = Math.max(preloadTasks.length + 2, 3);

    const updateProgress = () => {
      completedTasks++;
      if (isMounted) {
        const pct = Math.min(
          Math.round((completedTasks / totalCount) * 100),
          90
        );
        setProgress(pct);
      }
    };

    preloadTasks.forEach((p) => {
      p.then(updateProgress).catch(updateProgress);
    });

    const step1 = setTimeout(() => {
      if (isMounted) {
        setStatusMessage(t("system.loadingAssets"));
        setProgress((prev) => Math.max(prev, 50));
      }
    }, 400);

    const step2 = setTimeout(() => {
      if (isMounted) {
        setStatusMessage(t("system.ready"));
        setProgress(100);
      }
    }, 900);

    const finishTimeout = setTimeout(() => {
      if (isMounted) {
        finishBoot();
      }
    }, 1200);

    return () => {
      isMounted = false;
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(finishTimeout);
    };
  }, [finishBoot, t]);

  return (
    <div
      data-testid="boot-screen"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--linux-bg)] text-[var(--linux-text)] select-none"
    >
      <div className="flex flex-col items-center max-w-xs w-full px-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-md bg-[var(--linux-surface)] border border-[var(--linux-border-strong)] mb-6">
          <span className="text-xl font-mono font-bold tracking-wider text-[var(--linux-accent)]">
            SR
          </span>
        </div>

        <div className="w-full flex items-center justify-between text-[10px] font-mono text-[var(--linux-text-subtle)] mb-1.5">
          <span>systemd-boot // hyprland</span>
          <span>{progress}%</span>
        </div>

        <div className="w-full bg-[var(--linux-surface-raised)] border border-[var(--linux-border)] rounded-[2px] h-1.5 overflow-hidden mb-3">
          <div
            data-testid="boot-progress-bar"
            className="bg-[var(--linux-accent)] h-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p
          data-testid="boot-status"
          className="text-xs font-mono text-[var(--linux-text-muted)] tracking-wide"
        >
          {statusMessage || t("system.booting")}
        </p>
      </div>
    </div>
  );
}
