# Task 11: Tampilan lirik Better Lyrics

[↑ Kembali ke Overview](./00-overview.md)

## Objective

Lirik tersinkron yang halus.

## Dependencies

- [Task 10: Audio engine dan aplikasi Music](./10-task-audio-music.md)

## Implementation Guidance

- Port `LyricsSheet`, `better-lyrics`, dan `useLyricPulse` dari PioPio (`src/components/island/`) ke tab Lyrics di halaman Now Playing.
- Port `useCurrentLyric` (tick 250 ms dari anchor posisi) supaya baris aktif tetap sinkron di antara update posisi audio.
- Baris aktif disorot dan di-scroll otomatis dengan animasi spring. Baris lain di-blur dan diredupkan.
- Mengklik sebuah baris akan seek ke timestamp baris itu.
- Kalau `.lrc` tidak ada, tampilkan state "Lirik tidak tersedia / Lyrics not available".
- Hormati `prefers-reduced-motion` (scroll tanpa animasi, tanpa blur bergerak).

## Test Requirements

- RTL dengan waktu yang di-mock (fake timers): baris aktif berganti sesuai posisi.
- RTL: klik baris memanggil seek dengan timestamp yang benar.
- RTL: track tanpa `.lrc` menampilkan state "Lirik tidak tersedia".

## Demo

Lirik bergerak mengikuti lagu.

## Definition of Done

- [ ] `LyricsSheet`, `better-lyrics`, `useLyricPulse`, dan `useCurrentLyric` di-port
- [ ] Baris aktif disorot dan di-scroll otomatis dengan spring
- [ ] Baris non-aktif di-blur dan diredupkan
- [ ] Klik baris melakukan seek
- [ ] State "Lirik tidak tersedia" saat `.lrc` tidak ada
- [ ] Dukungan `prefers-reduced-motion`
- [ ] Test RTL lirik lulus
- [ ] `npm run check` lulus

---

[← Sebelumnya](./10-task-audio-music.md) · [Berikutnya →](./12-task-notch-piopio.md)
