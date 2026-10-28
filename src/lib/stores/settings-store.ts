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
  { id: "cyan", name: "Turquoise", color: "#1ab8c7", rgb: "26, 184, 199" },
  { id: "pink", name: "Rose Pink", color: "#e45d9a", rgb: "228, 93, 154" },
  { id: "purple", name: "Royal Purple", color: "#8b4fbf", rgb: "139, 79, 191" },
  { id: "green", name: "Mint Positive", color: "#7fe089", rgb: "127, 224, 137" },
  { id: "yellow", name: "Gold Warm", color: "#f2c94c", rgb: "242, 201, 76" },
  { id: "red", name: "Coral Alert", color: "#f97d7d", rgb: "249, 125, 125" },
  { id: "blue", name: "Soft Sky", color: "#4fa8e8", rgb: "79, 168, 232" },
  { id: "graphite", name: "Cool Silver", color: "#b9bbc7", rgb: "185, 187, 199" },
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
      accentColor: "#1ab8c7",
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
