export interface WallpaperItem {
  id: string;
  path: string;
  label: string;
}

export interface MusicTrackItem {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // seconds
  audioPath: string;
  lrcPath?: string;
  coverPath?: string;
}
