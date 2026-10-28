import { create } from "zustand";

export type SystemPhase = "boot" | "lock" | "welcome" | "desktop";

export interface SystemState {
  phase: SystemPhase;
  hasBootedSession: boolean;
  setPhase: (phase: SystemPhase) => void;
  finishBoot: () => void;
  unlock: () => void;
  lock: () => void;
  resetToBoot: () => void;
}

export const useSystemStore = create<SystemState>()((set) => ({
  phase: "boot",
  hasBootedSession: false,
  setPhase: (phase) => set({ phase }),
  finishBoot: () => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("has_booted_session", "true");
      } catch {
        // sessionStorage might be disabled or unavailable
      }
    }
    set({ phase: "lock", hasBootedSession: true });
  },
  unlock: () => set({ phase: "welcome" }),
  lock: () => set({ phase: "lock" }),
  resetToBoot: () => set({ phase: "boot" }),
}));
