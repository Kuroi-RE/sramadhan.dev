# Task 6: Aplikasi Pengaturan

[↑ Kembali ke Overview](./00-overview.md)

## Objective

Pengaturan sistem berfungsi.

## Dependencies

- [Task 5: Window manager dan dock](./05-task-window-manager-dock.md)

## Implementation Guidance

- Buat layout dengan sidebar berisi empat menu: Wallpaper, System Accent, Bahasa, About.
- Wallpaper: grid thumbnail dari `wallpapers.json` dengan tanda pada wallpaper yang aktif. Wallpaper hanya berasal dari `/public/wallpaper` (tidak ada upload).
- System Accent: 8 preset warna (gaya macOS) yang mengubah CSS variable `--accent` di `:root`. Tema dark saja.
- Bahasa: pilihan ID/EN yang mengubah `locale` di store `settings`.
- About: profil developer dari `content/profile.ts` (avatar, nama, role, bio, link sosial).
- Semua perubahan disimpan dan langsung berlaku di seluruh OS, termasuk lockscreen.

## Test Requirements

- Memilih wallpaper mengubah store dan latar desktop.
- Memilih accent mengubah store dan nilai `--accent` di `:root`.
- Mengganti bahasa mengubah teks UI.
- Nilai wallpaper, accent, dan bahasa bertahan setelah remount.

## Demo

Ganti wallpaper, accent, dan bahasa, lalu reload. Pilihan tetap tersimpan.

## Definition of Done

- [ ] Sidebar dengan empat menu
- [ ] Menu Wallpaper menampilkan grid dari manifest dan menandai yang aktif
- [ ] Menu System Accent dengan 8 preset yang mengubah `--accent`
- [ ] Menu Bahasa mengubah locale
- [ ] Menu About menampilkan profil developer
- [ ] Perubahan tersimpan dan berlaku di seluruh OS, termasuk lockscreen
- [ ] Test RTL untuk wallpaper, accent, bahasa, dan persistensi lulus
- [ ] `npm run check` lulus

---

[← Sebelumnya](./05-task-window-manager-dock.md) · [Berikutnya →](./07-task-terminal.md)
