import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { WindowBounds, WindowInstance } from "@/os/window-manager/types";
import { APP_REGISTRY } from "@/os/window-manager/app-registry";

export interface WindowStoreState {
  windows: Record<string, WindowInstance>;
  activeWindowId: string | null;
  maxZIndex: number;

  openWindow: (appId: string) => void;
  focusWindow: (appId: string) => void;
  minimizeWindow: (appId: string) => void;
  maximizeWindow: (appId: string) => void;
  closeWindow: (appId: string) => void;
  updateBounds: (appId: string, bounds: WindowBounds) => void;
  resetWindows: () => void;
}

export const useWindowStore = create<WindowStoreState>()(
  persist(
    (set, get) => ({
      windows: {},
      activeWindowId: null,
      maxZIndex: 10,

      openWindow: (appId: string) => {
        const { windows, maxZIndex } = get();
        const nextZ = maxZIndex + 1;
        const appMeta = APP_REGISTRY[appId];

        if (!appMeta) return;

        const existing = windows[appId];
        if (existing) {
          set({
            windows: {
              ...windows,
              [appId]: {
                ...existing,
                isOpen: true,
                isMinimized: false,
                zIndex: nextZ,
              },
            },
            activeWindowId: appId,
            maxZIndex: nextZ,
          });
        } else {
          set({
            windows: {
              ...windows,
              [appId]: {
                id: appId,
                titleKey: appMeta.titleKey,
                isOpen: true,
                isMinimized: false,
                isMaximized: false,
                zIndex: nextZ,
                bounds: { ...appMeta.defaultBounds },
              },
            },
            activeWindowId: appId,
            maxZIndex: nextZ,
          });
        }
      },

      focusWindow: (appId: string) => {
        const { windows, activeWindowId, maxZIndex } = get();
        const target = windows[appId];
        if (!target || !target.isOpen) return;

        if (activeWindowId === appId && !target.isMinimized) return;

        const nextZ = maxZIndex + 1;
        set({
          windows: {
            ...windows,
            [appId]: {
              ...target,
              isMinimized: false,
              zIndex: nextZ,
            },
          },
          activeWindowId: appId,
          maxZIndex: nextZ,
        });
      },

      minimizeWindow: (appId: string) => {
        const { windows, activeWindowId } = get();
        const target = windows[appId];
        if (!target) return;

        const nextWindows = {
          ...windows,
          [appId]: {
            ...target,
            isMinimized: true,
          },
        };

        let nextActive: string | null = activeWindowId;
        if (activeWindowId === appId) {
          // Find next top-most open, unminimized window
          const candidates = Object.values(nextWindows)
            .filter((w) => w.isOpen && !w.isMinimized && w.id !== appId)
            .sort((a, b) => b.zIndex - a.zIndex);

          nextActive = candidates.length > 0 ? candidates[0].id : null;
        }

        set({
          windows: nextWindows,
          activeWindowId: nextActive,
        });
      },

      maximizeWindow: (appId: string) => {
        const { windows } = get();
        const target = windows[appId];
        if (!target) return;

        if (target.isMaximized) {
          // Restore to pre-maximized bounds
          set({
            windows: {
              ...windows,
              [appId]: {
                ...target,
                isMaximized: false,
                bounds: target.preMaximizedBounds || target.bounds,
              },
            },
          });
        } else {
          // Maximize
          set({
            windows: {
              ...windows,
              [appId]: {
                ...target,
                isMaximized: true,
                preMaximizedBounds: { ...target.bounds },
              },
            },
          });
        }
      },

      closeWindow: (appId: string) => {
        const { windows, activeWindowId } = get();
        const target = windows[appId];
        if (!target) return;

        const nextWindows = {
          ...windows,
          [appId]: {
            ...target,
            isOpen: false,
            isMinimized: false,
            isMaximized: false,
          },
        };

        let nextActive: string | null = activeWindowId;
        if (activeWindowId === appId) {
          const candidates = Object.values(nextWindows)
            .filter((w) => w.isOpen && !w.isMinimized && w.id !== appId)
            .sort((a, b) => b.zIndex - a.zIndex);

          nextActive = candidates.length > 0 ? candidates[0].id : null;
        }

        set({
          windows: nextWindows,
          activeWindowId: nextActive,
        });
      },

      updateBounds: (appId: string, bounds: WindowBounds) => {
        const { windows } = get();
        const target = windows[appId];
        if (!target) return;

        set({
          windows: {
            ...windows,
            [appId]: {
              ...target,
              bounds,
            },
          },
        });
      },

      resetWindows: () => {
        set({ windows: {}, activeWindowId: null, maxZIndex: 10 });
      },
    }),
    {
      name: "sramadhan-window-state",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
