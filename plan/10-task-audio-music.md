# Task 10: Audio engine dan aplikasi Music

[↑ Kembali ke Overview](./00-overview.md)

## Objective

Musik bisa diputar dengan UI bergaya Apple Music.

## Dependencies

- [Task 3: Generator manifest aset](./03-task-asset-manifests.md)
- [Task 5: Window manager dan dock](./05-task-window-manager-dock.md)

## Implementation Guidance

- Buat `AudioEngine` singleton di `src/lib/audio-engine`:
  - Satu `HTMLAudioElement` untuk seluruh OS.
  - `AudioContext` + `AnalyserNode` dibuat saat unlock lockscreen (hasil Task 4), lalu dipakai juga oleh notch.
- Buat store player: queue, play/pause, next/prev, seek, volume, shuffle, dan repeat. Store menyimpan `positionMs`, `durationMs`, dan track aktif.
- UI bergaya Apple Music:
  - Sidebar library.
  - Grid album/lagu dari `music.json`.
  - Mini player di bawah.
  - Halaman Now Playing dengan latar blur dari cover album.
- Port `lrc-parser` beserta `currentLineIndex` (binary search, lead 200 ms) dan `lineTiming` dari PioPio ke `src/lib/lrc-parser`. Sumber lirik diganti dari LRCLIB menjadi fetch file `.lrc` lokal dari `/public/music`.

## Test Requirements

- Unit test parser LRC: multi timestamp dalam satu baris, tag `[offset:]`, dan baris kosong.
- Unit test `currentLineIndex` dan `lineTiming` (termasuk baris terakhir).
- Test store player dengan audio yang di-mock: play/pause, next/prev, shuffle, repeat, seek, dan volume.

## Demo

Memutar lagu dari library dan mengatur seek serta volume.

## Definition of Done

- [ ] `AudioEngine` singleton dengan `AnalyserNode` yang dibuat saat unlock
- [ ] Store player (queue, play/pause, next/prev, seek, volume, shuffle, repeat)
- [ ] UI library, grid album/lagu, mini player, dan Now Playing
- [ ] `lrc-parser`, `currentLineIndex`, dan `lineTiming` di-port dari PioPio
- [ ] Lirik dimuat dari `.lrc` lokal
- [ ] Unit test parser, timing, dan store player lulus
- [ ] `npm run check` lulus

---

[← Sebelumnya](./09-task-calendar.md) · [Berikutnya →](./11-task-better-lyrics.md)
