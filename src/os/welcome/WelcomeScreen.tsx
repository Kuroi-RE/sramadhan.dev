"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { profile } from "../../../content/profile";
import { useSystemStore } from "@/lib/stores/system-store";
import { useT } from "@/lib/i18n";
import { getDefaultWallpaper } from "@/lib/manifests";

export function WelcomeScreen() {
  const setPhase = useSystemStore((state) => state.setPhase);
  const t = useT();
  const wallpaper = getDefaultWallpaper();

  useEffect(() => {
    let isMounted = true;
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const duration = reducedMotion ? 400 : 1800;

    const timer = setTimeout(() => {
      if (isMounted) {
        setPhase("desktop");
      }
    }, duration);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [setPhase]);

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
      data-testid="welcome-screen"
      style={backgroundStyle}
      className="fixed inset-0 z-30 flex flex-col items-center justify-center text-[var(--text-primary)] select-none overflow-hidden"
    >
      <div className="absolute inset-0 bg-[rgba(4,13,63,0.78)] backdrop-blur-[8px]" />

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-start max-w-md w-full mx-6 p-5 rounded-[var(--radius-lg)] bg-gradient-to-br from-[#0d8091] to-[#1ab8c7]"
        style={{ boxShadow: 'var(--shadow-card-big)' }}
      >
        <div className="w-full flex items-center justify-between pb-3 mb-4 border-b border-[rgba(255,255,255,0.15)] text-[11px] text-[rgba(255,255,255,0.9)]" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
          <span>[OK] session initialized</span>
          <span className="text-[rgba(255,255,255,0.8)]">wayland-0</span>
        </div>

        <div className="flex items-center gap-3.5 mb-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[rgba(255,255,255,0.15)] border border-[rgba(255,255,255,0.3)]">
            <span className="text-sm font-bold tracking-wider text-[#ffffff]" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
              {profile.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </span>
          </div>
          <div>
            <div className="text-[11px] text-[rgba(255,255,255,0.7)]" style={{ fontFamily: 'var(--font-sans)' }}>
              welcome, {profile.name}
            </div>
            <h1
              data-testid="welcome-message"
              className="text-xl md:text-2xl font-semibold tracking-tight text-[#ffffff]"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {t("system.welcome")}
            </h1>
          </div>
        </div>

        <p className="text-xs text-[rgba(255,255,255,0.7)]" style={{ fontFamily: 'var(--font-sans)' }}>
          {profile.role}
        </p>
      </motion.div>
    </div>
  );
}
