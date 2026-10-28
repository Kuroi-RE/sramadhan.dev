"use client";

import { useState } from "react";
import { usePlayerStore } from "@/lib/stores/player-store";
import { defaultMusicTracks } from "@/lib/manifests";
import { MusicTrackItem } from "@/lib/types/manifests";
import { LyricsSheet } from "./lyrics/LyricsSheet";
import { useCurrentLyric } from "./lyrics/useCurrentLyric";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Repeat1,
  Music,
  Disc3,
  ListMusic,
  Radio,
  Quote,
} from "lucide-react";

type MusicView = "library" | "now-playing";
type NowPlayingMode = "cover" | "lyrics";

function formatTime(ms: number): string {
  if (isNaN(ms) || ms < 0) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function MusicApp() {
  const [currentView, setCurrentView] = useState<MusicView>("library");
  const [nowPlayingMode, setNowPlayingMode] =
    useState<NowPlayingMode>("lyrics");
  const {
    queue,
    currentTrackIndex,
    isPlaying,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    positionMs,
    durationMs,
    lyrics,
    playTrack,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
  } = usePlayerStore();

  const track = queue[currentTrackIndex] || null;
  const { currentIndex: currentLyricIdx } = useCurrentLyric(lyrics);

  const handleTrackClick = (t: MusicTrackItem) => {
    playTrack(t);
  };

  return (
    <div
      data-testid="music-app"
      className="flex h-full w-full select-none flex-col bg-[var(--linux-surface)] text-[var(--linux-text)] overflow-hidden relative"
    >
      <div className="flex flex-1 overflow-hidden">
        {/* Linux Music Player Sidebar */}
        <aside className="w-48 border-r border-[var(--linux-border)] bg-[var(--linux-bg)] p-2.5 flex flex-col gap-1 shrink-0 z-10">
          <div className="px-2.5 py-2 border-b border-[var(--linux-border)] mb-1 text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--linux-text-muted)] flex items-center gap-2">
            <Radio className="h-3.5 w-3.5 text-[var(--linux-accent)]" />
            <span>Music Player</span>
          </div>

          <button
            type="button"
            data-testid="music-nav-library"
            onClick={() => setCurrentView("library")}
            className={`linux-focus-ring flex items-center gap-2.5 rounded-[5px] px-2.5 py-2 text-xs font-medium transition-colors text-left border ${
              currentView === "library"
                ? "bg-[var(--linux-surface-raised)] text-[var(--linux-accent)] border-[var(--linux-accent)]/50 font-semibold"
                : "border-transparent text-[var(--linux-text-muted)] hover:bg-[var(--linux-surface-hover)] hover:text-[var(--linux-text)]"
            }`}
          >
            <ListMusic className="h-3.5 w-3.5" />
            <span>Semua Lagu</span>
          </button>

          <button
            type="button"
            data-testid="music-nav-nowplaying"
            onClick={() => setCurrentView("now-playing")}
            className={`linux-focus-ring flex items-center gap-2.5 rounded-[5px] px-2.5 py-2 text-xs font-medium transition-colors text-left border ${
              currentView === "now-playing"
                ? "bg-[var(--linux-surface-raised)] text-[var(--linux-accent)] border-[var(--linux-accent)]/50 font-semibold"
                : "border-transparent text-[var(--linux-text-muted)] hover:bg-[var(--linux-surface-hover)] hover:text-[var(--linux-text)]"
            }`}
          >
            <Disc3 className="h-3.5 w-3.5" />
            <span>Now Playing</span>
          </button>
        </aside>

        {/* Main Content View */}
        <main className="flex-1 overflow-hidden relative">
          {currentView === "library" ? (
            <div className="h-full overflow-y-auto p-6 space-y-5">
              <div className="border-b border-[var(--linux-border)] pb-3">
                <div className="linux-mono-label mb-0.5">mpd // pipewire</div>
                <h2 className="text-lg font-bold tracking-tight">
                  Perpustakaan Musik
                </h2>
                <p className="text-xs text-[var(--linux-text-muted)] mt-0.5">
                  Audio lokal dan lirik tersinkron (.lrc) dari folder{" "}
                  <span className="font-mono text-[var(--linux-text)]">
                    /public/music
                  </span>
                  .
                </p>
              </div>

              {defaultMusicTracks.length === 0 ? (
                <div
                  data-testid="music-empty-state"
                  className="flex flex-col items-center justify-center rounded-md border border-dashed border-[var(--linux-border-strong)] bg-[var(--linux-bg)] p-12 text-center"
                >
                  <Music className="h-10 w-10 text-[var(--linux-text-subtle)] mb-3" />
                  <h3 className="text-sm font-semibold text-[var(--linux-text)]">
                    Belum Ada Lagu
                  </h3>
                  <p className="text-xs text-[var(--linux-text-muted)] max-w-sm mt-1 leading-relaxed">
                    Letakkan file audio{" "}
                    <span className="text-[var(--linux-text)] font-mono">
                      .mp3
                    </span>{" "}
                    dan file lirik{" "}
                    <span className="text-[var(--linux-text)] font-mono">
                      .lrc
                    </span>{" "}
                    dengan nama yang sama di folder{" "}
                    <span className="text-[var(--linux-text)] font-mono">
                      public/music/
                    </span>
                    .
                  </p>
                </div>
              ) : (
                <div
                  data-testid="music-track-list"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5"
                >
                  {defaultMusicTracks.map((t) => {
                    const isCurrent = track?.id === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        data-testid={`track-item-${t.id}`}
                        onClick={() => handleTrackClick(t)}
                        className={`linux-focus-ring flex items-center gap-3 p-2.5 rounded-md border text-left transition-colors ${
                          isCurrent
                            ? "border-[var(--linux-accent)] bg-[var(--linux-surface-raised)]"
                            : "border-[var(--linux-border)] bg-[var(--linux-bg)] hover:bg-[var(--linux-surface-hover)]"
                        }`}
                      >
                        <div className="h-11 w-11 rounded-[4px] bg-[var(--linux-surface-raised)] flex items-center justify-center shrink-0 overflow-hidden border border-[var(--linux-border)]">
                          {t.coverPath ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={t.coverPath}
                              alt={t.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Music className="h-4 w-4 text-[var(--linux-text-subtle)]" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-[var(--linux-text)] truncate">
                            {t.title}
                          </h4>
                          <p className="text-[11px] text-[var(--linux-text-muted)] truncate mt-0.5">
                            {t.artist}
                          </p>
                          <span className="text-[10px] font-mono text-[var(--linux-text-subtle)]">
                            {t.album}
                          </span>
                        </div>

                        {isCurrent && isPlaying ? (
                          <span className="flex h-2 w-2 rounded-full bg-[var(--linux-accent)] animate-pulse" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Now Playing View with Blurred Album Background and Better Lyrics */
            <div
              data-testid="now-playing-view"
              className="relative h-full w-full overflow-hidden flex flex-col"
            >
              {/* Blurred Cover Backdrop */}
              {track?.coverPath && (
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-20 filter blur-3xl scale-125 pointer-events-none"
                  style={{ backgroundImage: `url(${track.coverPath})` }}
                />
              )}
              <div className="absolute inset-0 bg-[var(--linux-bg)]/60 pointer-events-none" />

              {/* View Mode Toggle Header */}
              <div className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-[var(--linux-border)] bg-[var(--linux-surface)]/80">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-[4px] bg-[var(--linux-surface-raised)] flex items-center justify-center overflow-hidden border border-[var(--linux-border)]">
                    {track?.coverPath ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={track.coverPath}
                        alt={track.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Music className="h-4 w-4 text-[var(--linux-text-muted)]" />
                    )}
                  </div>
                  <div>
                    <h3
                      data-testid="now-playing-title"
                      className="text-xs font-bold text-[var(--linux-text)] truncate"
                    >
                      {track ? track.title : "Tidak ada lagu"}
                    </h3>
                    <p
                      data-testid="now-playing-artist"
                      className="text-[11px] font-mono text-[var(--linux-text-muted)] truncate"
                    >
                      {track ? track.artist : "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-[var(--linux-bg)] border border-[var(--linux-border)] rounded-[5px] p-0.5">
                  <button
                    type="button"
                    data-testid="toggle-lyrics-view"
                    onClick={() => setNowPlayingMode("lyrics")}
                    className={`px-2.5 py-1 rounded-[4px] text-xs font-mono transition-colors ${
                      nowPlayingMode === "lyrics"
                        ? "bg-[var(--linux-surface-raised)] text-[var(--linux-accent)] border border-[var(--linux-accent)]/40"
                        : "text-[var(--linux-text-muted)] hover:text-[var(--linux-text)]"
                    }`}
                  >
                    Lirik
                  </button>
                  <button
                    type="button"
                    data-testid="toggle-cover-view"
                    onClick={() => setNowPlayingMode("cover")}
                    className={`px-2.5 py-1 rounded-[4px] text-xs font-mono transition-colors ${
                      nowPlayingMode === "cover"
                        ? "bg-[var(--linux-surface-raised)] text-[var(--linux-accent)] border border-[var(--linux-accent)]/40"
                        : "text-[var(--linux-text-muted)] hover:text-[var(--linux-text)]"
                    }`}
                  >
                    Cover
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="relative z-10 flex-1 overflow-hidden">
                {nowPlayingMode === "lyrics" ? (
                  <LyricsSheet
                    lyrics={lyrics}
                    activeLineIndex={currentLyricIdx}
                    onSeek={seek}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <div className="h-56 w-56 rounded-md bg-[var(--linux-surface-raised)] overflow-hidden border border-[var(--linux-border-strong)] flex items-center justify-center">
                      {track?.coverPath ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={track.coverPath}
                          alt={track.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Music className="h-16 w-16 text-[var(--linux-text-subtle)]" />
                      )}
                    </div>
                    <div className="mt-5">
                      <h4 className="text-lg font-bold text-[var(--linux-text)]">
                        {track ? track.title : "Tidak ada lagu"}
                      </h4>
                      <p className="text-xs font-mono text-[var(--linux-text-muted)] mt-1">
                        {track ? track.artist : ""}
                      </p>
                      <p className="text-[11px] font-mono text-[var(--linux-text-subtle)] mt-0.5">
                        {track ? track.album : ""}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Linux Music Player Bottom Bar */}
      <footer
        data-testid="music-player-bar"
        className="h-20 border-t border-[var(--linux-border)] bg-[var(--linux-bg)] px-5 flex items-center justify-between shrink-0 z-20"
      >
        {/* Left: Active Track Meta */}
        <div className="flex items-center gap-3 w-1/4 min-w-[160px]">
          <div className="h-10 w-10 rounded-[4px] bg-[var(--linux-surface-raised)] flex items-center justify-center shrink-0 overflow-hidden border border-[var(--linux-border)]">
            {track?.coverPath ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={track.coverPath}
                alt={track.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <Music className="h-4 w-4 text-[var(--linux-text-subtle)]" />
            )}
          </div>
          <div className="min-w-0">
            <h4
              data-testid="player-track-title"
              className="text-xs font-semibold text-[var(--linux-text)] truncate"
            >
              {track ? track.title : "Tidak ada lagu"}
            </h4>
            <p
              data-testid="player-track-artist"
              className="text-[11px] font-mono text-[var(--linux-text-muted)] truncate"
            >
              {track ? track.artist : "Music Player"}
            </p>
          </div>
        </div>

        {/* Center: Playback Controls & Progress Seekbar */}
        <div className="flex flex-col items-center gap-1.5 w-2/4 max-w-lg">
          <div className="flex items-center gap-3">
            <button
              type="button"
              data-testid="player-shuffle-btn"
              onClick={toggleShuffle}
              className={`p-1.5 rounded-[4px] border transition-colors ${
                isShuffle
                  ? "text-[var(--linux-accent)] border-[var(--linux-accent)]/50 bg-[var(--linux-surface-raised)]"
                  : "border-transparent text-[var(--linux-text-muted)] hover:text-[var(--linux-text)] hover:bg-[var(--linux-surface-hover)]"
              }`}
              title="Shuffle"
            >
              <Shuffle className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              data-testid="player-prev-btn"
              onClick={prevTrack}
              className="p-1.5 rounded-[4px] text-[var(--linux-text-muted)] hover:text-[var(--linux-text)] hover:bg-[var(--linux-surface-hover)] transition-colors"
              title="Previous"
            >
              <SkipBack className="h-4 w-4" />
            </button>

            <button
              type="button"
              data-testid="player-play-btn"
              onClick={togglePlay}
              className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--linux-surface-raised)] border border-[var(--linux-accent)] text-[var(--linux-accent)] hover:bg-[var(--linux-accent)] hover:text-[#080b10] transition-colors"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="h-3.5 w-3.5 fill-current" />
              ) : (
                <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
              )}
            </button>

            <button
              type="button"
              data-testid="player-next-btn"
              onClick={nextTrack}
              className="p-1.5 rounded-[4px] text-[var(--linux-text-muted)] hover:text-[var(--linux-text)] hover:bg-[var(--linux-surface-hover)] transition-colors"
              title="Next"
            >
              <SkipForward className="h-4 w-4" />
            </button>

            <button
              type="button"
              data-testid="player-repeat-btn"
              onClick={cycleRepeat}
              className={`p-1.5 rounded-[4px] border transition-colors ${
                repeatMode !== "off"
                  ? "text-[var(--linux-accent)] border-[var(--linux-accent)]/50 bg-[var(--linux-surface-raised)]"
                  : "border-transparent text-[var(--linux-text-muted)] hover:text-[var(--linux-text)] hover:bg-[var(--linux-surface-hover)]"
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === "one" ? (
                <Repeat1 className="h-3.5 w-3.5" />
              ) : (
                <Repeat className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          {/* Seekbar */}
          <div className="flex items-center gap-2 w-full text-[10px] text-[var(--linux-text-muted)] font-mono">
            <span>{formatTime(positionMs)}</span>
            <input
              data-testid="player-seekbar"
              type="range"
              min={0}
              max={durationMs || 100}
              value={positionMs}
              onChange={(e) => seek(Number(e.target.value))}
              className="flex-1 h-1 bg-[var(--linux-surface-raised)] rounded-none appearance-none cursor-pointer accent-[var(--linux-accent)]"
            />
            <span>{formatTime(durationMs)}</span>
          </div>
        </div>

        {/* Right: Volume & Quick Lyrics Controls */}
        <div className="flex items-center justify-end gap-2.5 w-1/4 min-w-[120px]">
          <button
            type="button"
            data-testid="player-quick-lyrics-btn"
            onClick={() => {
              setCurrentView("now-playing");
              setNowPlayingMode("lyrics");
            }}
            className={`p-1.5 rounded-[4px] border transition-colors ${
              currentView === "now-playing" && nowPlayingMode === "lyrics"
                ? "text-[var(--linux-accent)] border-[var(--linux-accent)]/50 bg-[var(--linux-surface-raised)]"
                : "border-transparent text-[var(--linux-text-muted)] hover:text-[var(--linux-text)]"
            }`}
            title="Lyrics"
          >
            <Quote className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            data-testid="player-mute-btn"
            onClick={toggleMute}
            className="text-[var(--linux-text-muted)] hover:text-[var(--linux-text)] transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4 text-[var(--linux-danger)]" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>

          <input
            data-testid="player-volume-slider"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-16 h-1 bg-[var(--linux-surface-raised)] rounded-none appearance-none cursor-pointer accent-[var(--linux-accent)]"
          />
        </div>
      </footer>
    </div>
  );
}
