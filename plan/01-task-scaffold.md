# Task 1: Scaffold proyek dan pipeline kualitas

[↑ Kembali ke Overview](./00-overview.md)

## Objective

Proyek Next.js yang bisa jalan dan punya pipeline cek lengkap.

## Dependencies

Tidak ada.

## Implementation Guidance

- Jalankan `create-next-app` dengan TypeScript, App Router, Tailwind v4, dan ESLint (Node 24 + npm).
- Tambahkan Prettier, Vitest + React Testing Library + jsdom, dan Playwright.
- Buat script `check` yang menjalankan format check, lint, typecheck, test, dan build secara berurutan.
- Tambahkan `.env.example` berisi `CHAT_API_BASE_URL`, `CHAT_API_KEY`, `CHAT_MODEL`, `CHAT_STREAM`, dan `GITHUB_TOKEN` (tanpa nilai rahasia).
- Pasang font Inter / Plus Jakarta Sans lewat `@fontsource-variable`.
- Buat halaman `/` kosong berlatar hitam.

## Test Requirements

- Satu smoke test RTL yang me-render halaman utama.
- Satu Playwright test yang membuka `/` dan memastikan halaman termuat.

## Demo

`npm run dev` menampilkan layar hitam, dan `npm run check` lulus.

## Definition of Done

- [ ] Proyek Next.js (TS, App Router, Tailwind v4, ESLint) ter-scaffold
- [ ] Prettier, Vitest + RTL + jsdom, dan Playwright terkonfigurasi
- [ ] Script `check` (format check, lint, typecheck, test, build) tersedia
- [ ] `.env.example` di-commit tanpa nilai rahasia
- [ ] Font Inter / Plus Jakarta Sans terpasang
- [ ] Halaman `/` berlatar hitam
- [ ] Smoke test RTL dan Playwright lulus
- [ ] `npm run check` lulus

---

[Berikutnya →](./02-task-content-i18n.md)
