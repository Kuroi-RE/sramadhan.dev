# Task 12: Notch PioPio

[↑ Kembali ke Overview](./00-overview.md)

## Objective

Notch aktif di atas desktop.

## Dependencies

- [Task 11: Tampilan lirik Better Lyrics](./11-task-better-lyrics.md)

## Implementation Guidance

- Port dari PioPio (`src/components/island/`) ke `src/notch/`: `IslandView`, `geometry.ts` (mode dock `top` saja), `PandaMascot`, `Spectrum`, dan `spectrum-engine`.
- Buat adapter web di `src/notch/adapters/` untuk mengganti layanan Tauri:
  - `media`: membaca store player (track, status play, posisi).
  - `spectrum`: membaca data frekuensi dari `AnalyserNode` milik `AudioEngine`.
  - `sysmon`: simulasi CPU/RAM dengan random walk ber-seed (dekoratif, nilai 0–100).
  - `battery`: `navigator.getBattery` dengan feature detection. Kalau API tidak ada (Firefox, Safari), ring baterai disembunyikan.
- Collapsed: pill hitam berisi panda, jam, dan judul lagu yang sedang diputar.
- Expanded saat di-hover:
  - Ring CPU/RAM (simulasi) dan baterai.
  - Kontrol musik (prev, play/pause, next).
  - Lirik baris aktif.
  - Shortcut aplikasi yang membuka window lewat store window.
- Fitur Tauri-only tidak dibawa: notifikasi, drag notch, approvals agent, dan chat PioPio.
- Notch berada di atas semua window (z-index tertinggi) dan tidak menghalangi klik di luar bentuknya.

## Test Requirements

- Unit test adapter `sysmon`: nilai selalu dalam rentang 0–100 dan deterministik untuk seed yang sama.
- Unit test adapter `battery`: tanpa `navigator.getBattery`, ring baterai tersembunyi.
- RTL: hover membuka panel expanded.
- RTL: tombol play di notch mengubah state player.
- RTL: shortcut aplikasi membuka window yang sesuai.

## Demo

Lagu diputar dan notch menampilkan judul, spectrum, dan lirik.

## Definition of Done

- [ ] `IslandView`, `geometry.ts` (mode `top`), `PandaMascot`, `Spectrum`, dan `spectrum-engine` di-port
- [ ] Adapter `media`, `spectrum`, `sysmon`, dan `battery`
- [ ] Tampilan collapsed (panda, jam, judul lagu)
- [ ] Tampilan expanded (ring, kontrol musik, lirik, shortcut aplikasi)
- [ ] Ring baterai tersembunyi jika Battery API tidak didukung
- [ ] Fitur Tauri-only tidak disertakan
- [ ] Unit test adapter dan RTL notch lulus
- [ ] `npm run check` lulus

---

[← Sebelumnya](./11-task-better-lyrics.md) · [Berikutnya →](./13-task-chatbot-backend.md)
