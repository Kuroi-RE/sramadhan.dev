"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const mql1 = window.matchMedia("(max-width: 768px)");
  const mql2 = window.matchMedia("(pointer: coarse)");

  mql1.addEventListener("change", callback);
  mql2.addEventListener("change", callback);

  return () => {
    mql1.removeEventListener("change", callback);
    mql2.removeEventListener("change", callback);
  };
}

function getSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(max-width: 768px)").matches ||
    window.matchMedia("(pointer: coarse)").matches
  );
}

function getServerSnapshot(): boolean {
  return false;
}

export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
