# Task 15: Layout mobile ala iOS

[↑ Kembali ke Overview](./00-overview.md)

## Objective

Pengalaman mobile yang layak.

## Dependencies

- [Task 6: Aplikasi Pengaturan](./06-task-settings.md)
- [Task 7: Terminal](./07-task-terminal.md)
- [Task 8: `/api/github` + perintah `github`](./08-task-github-api.md)
- [Task 9: Kalender](./09-task-calendar.md)
- [Task 10: Audio engine dan aplikasi Music](./10-task-audio-music.md)
- [Task 11: Tampilan lirik Better Lyrics](./11-task-better-lyrics.md)
- [Task 12: Notch PioPio](./12-task-notch-piopio.md)
- [Task 13: Backend chatbot](./13-task-chatbot-backend.md)
- [Task 14: Aplikasi Message](./14-task-message-app.md)

## Implementation Guidance

- Deteksi mobile lewat `matchMedia('(max-width: 768px), (pointer: coarse)')`.
- Boot, lockscreen, dan welcome tetap dipakai (layout disesuaikan untuk layar kecil).
- Home screen di `src/os/mobile/`:
  - Status bar (jam, ikon baterai jika Battery API ada).
  - Notch collapsed di atas, tap untuk expand.
  - Grid ikon aplikasi.
  - Dock berisi 4 aplikasi.
- Aplikasi dibuka fullscreen dengan transisi zoom dari ikon, dan ditutup lewat home indicator atau swipe ke atas.
- Kalender memakai tap dan bottom sheet untuk card project.
- Banner kecil "Best viewed on desktop / Lebih baik dibuka di desktop" yang bisa ditutup. Status tutup disimpan di `localStorage`.
- Semua komponen aplikasi dari task sebelumnya dipakai ulang tanpa duplikasi logika.

## Test Requirements

- Playwright dengan viewport iPhone:
  - Unlock lockscreen.
  - Membuka Terminal dan menjalankan `help`.
  - Menutup aplikasi lewat home indicator.
  - Menutup banner dan memastikan banner tidak muncul lagi setelah reload.

## Demo

Buka di HP atau devtools mobile.

## Definition of Done

- [ ] Deteksi mobile dengan `matchMedia`
- [ ] Boot, lockscreen, dan welcome responsif
- [ ] Home screen: status bar, notch (tap untuk expand), grid ikon, dock 4 aplikasi
- [ ] Aplikasi fullscreen dengan transisi zoom dan gesture tutup
- [ ] Kalender dengan tap dan bottom sheet
- [ ] Banner "Best viewed on desktop" yang bisa ditutup dan tersimpan
- [ ] Komponen aplikasi dipakai ulang
- [ ] Playwright mobile lulus
- [ ] `npm run check` lulus

---

[← Sebelumnya](./14-task-message-app.md) · [Berikutnya →](./16-task-polish-deploy.md)
