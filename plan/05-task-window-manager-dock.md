# Task 5: Window manager dan dock

[↑ Kembali ke Overview](./00-overview.md)

## Objective

Aplikasi bisa dibuka sebagai window yang bisa diatur.

## Dependencies

- [Task 4: Boot → Lock → Welcome → Desktop](./04-task-boot-lock-welcome.md)

## Implementation Guidance

- Buat app registry berisi `id`, nama (i18n), ikon (`lucide-react`), ukuran default, dan komponen yang di-lazy-load lewat `next/dynamic`.
- Buat store window (zustand + persist): open, focus (z-order), minimize, maximize, close, serta posisi/ukuran yang disimpan.
- Buat komponen `Window` dengan `react-rnd`:
  - Title bar dengan traffic lights (close, minimize, maximize).
  - Posisi dan ukuran dibatasi tetap di dalam viewport.
  - Klik window menaikkannya ke depan.
- Buat dock dengan efek magnify bergaya Nectar (spring dari `motion`) dan titik indikator untuk aplikasi yang berjalan.
- Daftarkan aplikasi MVP 1 sebagai placeholder: Music, Pengaturan, Terminal, Kalender, dan Message. Notch bukan window, jadi tidak masuk dock dan dikerjakan di [Task 12](./12-task-notch-piopio.md).
- Tambahkan menu "Lock" (dari dock atau sudut layar) yang kembali ke lockscreen.

## Test Requirements

- Unit test reducer store window: focus menaikkan z-index, minimize lalu restore, maximize toggle, close menghapus window.
- RTL: klik ikon di dock membuka window, klik lagi pada aplikasi yang diminimize akan me-restore-nya.

## Demo

Buka beberapa window placeholder, lalu geser, resize, minimize, dan buka lagi dari dock.

## Definition of Done

- [ ] App registry dengan lazy load
- [ ] Store window (open, focus, minimize, maximize, close) dengan persist posisi/ukuran
- [ ] Komponen `Window` dengan drag, resize, traffic lights, dan batas viewport
- [ ] Dock dengan efek magnify dan indikator aplikasi berjalan
- [ ] Aplikasi MVP terdaftar sebagai placeholder
- [ ] Aksi "Lock" kembali ke lockscreen
- [ ] Unit test reducer dan RTL dock lulus
- [ ] `npm run check` lulus

---

[← Sebelumnya](./04-task-boot-lock-welcome.md) · [Berikutnya →](./06-task-settings.md)
