import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Locale = "id" | "en";

export interface AccentPreset {
  id: string;
  name: string;
  color: string;
  rgb: string;
}

export const ACCENT_PRESETS: AccentPreset[] = [
  { id: "cyan", name: "Cyan", color: "#7dd3fc", rgb: "125, 211, 252" },
  { id: "blue", name: "Blue", color: "#38bdf8", rgb: "56, 189, 248" },
  { id: "purple", name: "Purple", color: "#a855f7", rgb: "168, 85, 247" },
  { id: "green", name: "Green", color: "#7ee787", rgb: "126, 231, 135" },
  { id: "yellow", name: "Amber", color: "#f2cc60", rgb: "242, 204, 96" },
  { id: "red", name: "Coral", color: "#ff7b72", rgb: "255, 123, 114" },
  { id: "pink", name: "Magenta", color: "#f472b6", rgb: "244, 114, 182" },
  { id: "graphite", name: "Slate", color: "#8b949e", rgb: "139, 148, 158" },
];

export function applyAccentToCss(colorHex: string) {
  if (typeof document === "undefined") return;
  const preset = ACCENT_PRESETS.find((p) => p.color === colorHex);
  document.documentElement.style.setProperty("--accent", colorHex);
  document.documentElement.style.setProperty("--linux-accent", colorHex);
  if (preset) {
    document.documentElement.style.setProperty("--accent-rgb", preset.rgb);
  }
}

export interface SettingsState {
  locale: Locale;
  accentColor: string;
  wallpaperId: string;
  setLocale: (locale: Locale) => void;
  setAccentColor: (color: string) => void;
  setWallpaperId: (id: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      locale: "id",
      accentColor: "#7dd3fc",
      wallpaperId: "default",
      setLocale: (locale) => set({ locale }),
      setAccentColor: (accentColor) => {
        applyAccentToCss(accentColor);
        set({ accentColor });
      },
      setWallpaperId: (wallpaperId) => set({ wallpaperId }),
    }),
    {
      name: "sramadhan-settings",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.accentColor) {
          applyAccentToCss(state.accentColor);
        }
      },
    }
  )
);
