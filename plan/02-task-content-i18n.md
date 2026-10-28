# Task 2: Lapisan konten dan i18n

[↑ Kembali ke Overview](./00-overview.md)

## Objective

Semua konten bertipe dan bilingual, dengan bahasa yang bisa diganti.

## Dependencies

- [Task 1: Scaffold proyek dan pipeline kualitas](./01-task-scaffold.md)

## Implementation Guidance

- Buat skema zod untuk:
  - `profile` (nama, role, tagline `{id,en}`, bio `{id,en}`, avatar, username GitHub).
  - `socials` (Threads, Instagram, LinkedIn).
  - `projects` (tanggal ISO, thumbnail, nama dan deskripsi `{id,en}`, link GitHub, link demo).
  - `system` (password lockscreen, hint `{id,en}`).
- Isi semua file di `content/` dengan placeholder.
- Buat kamus UI bertipe di `content/i18n/id.ts` dan `content/i18n/en.ts`.
- Buat store `settings` (zustand + persist) berisi `locale`, plus helper `t()` untuk kamus UI dan `useLocalized()` untuk field konten `{ id, en }`.
- Buat halaman sementara yang menampilkan nama dan tagline dengan toggle ID/EN. Halaman ini nanti diganti oleh desktop.

## Test Requirements

- Validasi skema zod untuk semua file konten.
- `t()` dan `useLocalized()` mengembalikan teks sesuai locale aktif.
- Kunci kamus ID dan EN identik (dicek otomatis di test).

## Demo

Toggle bahasa mengganti teks profil.

## Definition of Done

- [ ] Skema zod untuk profile, socials, projects, dan system
- [ ] Konten placeholder di `content/` lolos validasi
- [ ] Kamus `content/i18n/{id,en}.ts` bertipe
- [ ] Store `settings` dengan `locale` yang tersimpan di `localStorage`
- [ ] Helper `t()` dan `useLocalized()` tersedia
- [ ] Halaman sementara dengan toggle ID/EN berfungsi
- [ ] Test skema, test i18n, dan test kesamaan kunci kamus lulus
- [ ] `npm run check` lulus

---

[← Sebelumnya](./01-task-scaffold.md) · [Berikutnya →](./03-task-asset-manifests.md)
