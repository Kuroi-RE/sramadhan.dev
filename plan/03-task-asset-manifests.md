# Task 3: Generator manifest aset

[↑ Kembali ke Overview](./00-overview.md)

## Objective

Daftar wallpaper dan musik dibuat otomatis dari `/public`.

## Dependencies

- [Task 2: Lapisan konten dan i18n](./02-task-content-i18n.md)

## Implementation Guidance

- Buat `scripts/generate-manifests.mjs` dan jalankan di `predev` dan `prebuild`.
- Script memindai `public/wallpaper` (jpg/png/webp/avif) menjadi `wallpapers.json` berisi `id`, `path`, dan `label` (dari nama file).
- Script memindai `public/music` menjadi `music.json`:
  - Judul, artis, album, dan durasi dibaca dari tag ID3 dengan `music-metadata`.
  - Cover embedded diekstrak ke `public/music/covers/`.
  - File `.lrc` dipasangkan berdasarkan nama file yang sama dengan audio.
  - Kalau tag ID3 kosong, data diambil dari nama file.
- Manifest yang dihasilkan (dan folder `covers/`) masuk `.gitignore`.
- Desktop sementara menampilkan wallpaper default dari manifest sebagai latar.

## Test Requirements

- Fixture folder sementara berisi gambar, mp3 kecil ber-tag, mp3 tanpa tag, dan `.lrc` tanpa pasangan audio.
- Hasil manifest diuji: wallpaper terdaftar, metadata ID3 terbaca, fallback nama file berjalan, `.lrc` tanpa pasangan diabaikan, dan cover terekstrak.

## Demo

Menaruh file baru di folder lalu menjalankan `npm run dev` membuatnya langsung muncul di manifest. Halaman menampilkan wallpaper default sebagai latar.

## Definition of Done

- [ ] `scripts/generate-manifests.mjs` berjalan di `predev` dan `prebuild`
- [ ] `wallpapers.json` dihasilkan dari `public/wallpaper`
- [ ] `music.json` dihasilkan dari `public/music` dengan metadata ID3 dan fallback nama file
- [ ] Cover embedded diekstrak ke `public/music/covers/`
- [ ] `.lrc` dipasangkan berdasarkan nama file
- [ ] Manifest hasil generate masuk `.gitignore`
- [ ] Halaman menampilkan wallpaper default
- [ ] Test berbasis fixture lulus
- [ ] `npm run check` lulus

---

[← Sebelumnya](./02-task-content-i18n.md) · [Berikutnya →](./04-task-boot-lock-welcome.md)
