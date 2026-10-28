import { WallpaperItem, MusicTrackItem } from "./types/manifests";
import fallbackWallpapers from "../generated/wallpapers.json";
import fallbackMusic from "../generated/music.json";

export const defaultWallpapers: WallpaperItem[] =
  fallbackWallpapers as WallpaperItem[];
export const defaultMusicTracks: MusicTrackItem[] =
  fallbackMusic as MusicTrackItem[];

export function getDefaultWallpaper(): WallpaperItem {
  return (
    defaultWallpapers[0] || {
      id: "default-gradient",
      path: "",
      label: "Default Dark Mesh",
    }
  );
}

export function getActiveWallpaper(wallpaperId?: string): WallpaperItem {
  if (!wallpaperId || wallpaperId === "default") {
    return getDefaultWallpaper();
  }
  const found = defaultWallpapers.find((w) => w.id === wallpaperId);
  return found || getDefaultWallpaper();
}
