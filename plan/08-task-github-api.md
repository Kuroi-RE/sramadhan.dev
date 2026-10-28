# Task 8: `/api/github` + perintah `github`

[↑ Kembali ke Overview](./00-overview.md)

## Objective

Stats GitHub tampil di terminal.

## Dependencies

- [Task 7: Terminal (perintah lokal)](./07-task-terminal.md)

## Implementation Guidance

- Buat Route Handler `src/app/api/github/route.ts` yang mengambil data dari GitHub REST API:
  - `GET /users/{u}` untuk followers dan jumlah repo publik.
  - `GET /users/{u}/repos?per_page=100` untuk total stars dan 5 bahasa teratas.
  - Username diambil dari `content/profile.ts`.
- Cache dengan `revalidate: 3600` (1 jam).
- Kirim header `Authorization` dengan `GITHUB_TOKEN` jika tersedia. Token tidak pernah dikirim ke client.
- Normalisasi response dengan zod menjadi `{ profileUrl, followers, publicRepos, totalStars, topLanguages }`.
- Error di-handle dengan baik: rate limit (403) dan error upstream (5xx) dipetakan ke response error yang aman.
- Perintah `github` di terminal menampilkan link profil dan stats, dengan loading spinner gaya teks dan pesan error yang ramah. Link profil tetap ditampilkan walau stats gagal dimuat.

## Test Requirements

- Route di-test dengan fetch yang di-mock: sukses, 403 rate limit, dan 500.
- Perhitungan total stars dan bahasa teratas diuji.
- Test render perintah `github`: loading, sukses, dan error.

## Demo

`github` di terminal menampilkan stats asli.

## Definition of Done

- [ ] Route `/api/github` dengan cache 1 jam
- [ ] `GITHUB_TOKEN` opsional dipakai di server saja
- [ ] Response dinormalisasi dengan zod
- [ ] Error 403 dan 5xx ditangani dengan aman
- [ ] Perintah `github` dengan loading, stats, dan fallback error
- [ ] Test route dan test perintah lulus
- [ ] `npm run check` lulus

---

[← Sebelumnya](./07-task-terminal.md) · [Berikutnya →](./09-task-calendar.md)
