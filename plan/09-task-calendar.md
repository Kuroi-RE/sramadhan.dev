# Task 9: Kalender

[↑ Kembali ke Overview](./00-overview.md)

## Objective

Kalender project yang interaktif.

## Dependencies

- [Task 5: Window manager dan dock](./05-task-window-manager-dock.md)

## Implementation Guidance

- Grid bulan dengan Senin sebagai awal minggu. Nama bulan dan hari mengikuti locale (`Intl.DateTimeFormat`).
- Navigasi bulan sebelum/berikut dan tombol "Hari ini".
- Event diambil dari `content/projects.ts`. Tanggal yang punya project diberi titik berwarna accent.
- Hover atau fokus keyboard (desktop) dan tap (mobile) menampilkan card berisi:
  - Thumbnail project.
  - Nama project dan deskripsi (sesuai locale).
  - Tombol GitHub dan Demo (`rel="noopener noreferrer"`), disembunyikan jika link tidak ada.
- Kalau ada beberapa project di satu tanggal, card menampilkan daftar.
- Kalender default membuka bulan dari project terbaru, atau bulan berjalan jika belum ada project.

## Test Requirements

- Unit test pembuatan grid: tahun kabisat (Februari 29 hari) dan offset hari pertama dengan Senin sebagai awal minggu.
- RTL: hover tanggal dengan event memunculkan card berisi data yang benar.
- RTL: tanggal tanpa event tidak memunculkan card.
- RTL: tanggal dengan beberapa project menampilkan daftar.

## Demo

Hover tanggal 18 September untuk melihat card project.

## Definition of Done

- [ ] Grid bulan dengan awal minggu Senin dan nama sesuai locale
- [ ] Navigasi bulan dan tombol "Hari ini"
- [ ] Titik accent pada tanggal yang punya project
- [ ] Card project muncul saat hover, fokus keyboard, atau tap
- [ ] Dukungan beberapa project di satu tanggal
- [ ] Bulan default dari project terbaru
- [ ] Unit test grid dan RTL card lulus
- [ ] `npm run check` lulus

---

[← Sebelumnya](./08-task-github-api.md) · [Berikutnya →](./10-task-audio-music.md)
