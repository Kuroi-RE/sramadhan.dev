"use client";

import { useSyncExternalStore } from "react";
import { useSystemStore } from "@/lib/stores/system-store";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { BootScreen } from "./boot/BootScreen";
import { LockScreen } from "./lock/LockScreen";
import { WelcomeScreen } from "./welcome/WelcomeScreen";
import { DesktopScreen } from "./desktop/DesktopScreen";
import { MobileRoot } from "./mobile/MobileRoot";

function subscribe() {
  return () => {};
}

interface OSRootProps {
  children?: React.ReactNode;
}

export function OSRoot({ children }: OSRootProps) {
  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
  const phase = useSystemStore((state) => state.phase);
  const isMobile = useIsMobile();

  if (!isClient) {
    return (
      <main
        data-testid="os-loading"
        className="flex min-h-screen w-full flex-col items-center justify-center bg-black text-white"
      />
    );
  }

  return (
    <div
      data-testid="os-root"
      className="relative h-screen w-screen overflow-hidden bg-black"
    >
      {phase === "boot" && <BootScreen />}
      {phase === "lock" && <LockScreen />}
      {phase === "welcome" && <WelcomeScreen />}
      {phase === "desktop" &&
        (isMobile ? <MobileRoot /> : <DesktopScreen>{children}</DesktopScreen>)}
    </div>
  );
}
