# Task 4: Boot → Lock → Welcome → Desktop

[↑ Kembali ke Overview](./00-overview.md)

## Objective

Alur masuk OS lengkap.

## Dependencies

- [Task 3: Generator manifest aset](./03-task-asset-manifests.md)

## Implementation Guidance

- Buat state machine `systemPhase` (`boot | lock | welcome | desktop`) di store.
- Preloader dengan progress nyata: manifest, wallpaper aktif, font, dan ikon dimuat lewat `Promise.allSettled`, dengan timeout supaya tidak macet. Tampilkan logo teks "SR" dan progress bar.
- Lockscreen:
  - Jam dan tanggal besar sesuai locale.
  - Wallpaper aktif dengan blur.
  - Avatar dan nama dari `content/profile.ts`.
  - Input password dari `content/system.ts`, dengan animasi shake saat salah.
  - Hint muncul setelah satu kali salah.
  - Saat password benar, `AudioContext` diinisialisasi (memenuhi kebijakan autoplay browser).
- Welcome: animasi "Selamat datang / Welcome" sekitar 2 detik.
- Desktop: kosong dengan wallpaper.
- Settings disimpan di `localStorage`. Boot dipercepat jika masih di sesi yang sama (`sessionStorage`).
- Dukung `prefers-reduced-motion` dengan menyederhanakan semua animasi.

## Test Requirements

- Unit test transisi state machine (termasuk `desktop → lock`).
- RTL: password salah memicu shake dan menampilkan hint, password benar pindah ke welcome.
- Playwright untuk seluruh alur boot → lock → welcome → desktop.

## Demo

Buka situs → boot → masukkan password → welcome → desktop.

## Definition of Done

- [ ] State machine `systemPhase` dengan transisi yang benar
- [ ] Preloader dengan progress nyata dan timeout
- [ ] Lockscreen: jam/tanggal sesuai locale, wallpaper blur, avatar, password, shake, hint
- [ ] `AudioContext` diinisialisasi saat unlock
- [ ] Animasi welcome
- [ ] Desktop kosong dengan wallpaper
- [ ] Boot cepat dalam sesi yang sama
- [ ] Dukungan `prefers-reduced-motion`
- [ ] Unit test, RTL, dan Playwright lulus
- [ ] `npm run check` lulus

---

[← Sebelumnya](./03-task-asset-manifests.md) · [Berikutnya →](./05-task-window-manager-dock.md)
