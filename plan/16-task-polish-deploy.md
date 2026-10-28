# Task 16: Polish, SEO, dan deploy

[↑ Kembali ke Overview](./00-overview.md)

## Objective

Siap rilis di sramadhan.cv.

## Dependencies

- [Task 15: Layout mobile ala iOS](./15-task-mobile-ios.md)

## Implementation Guidance

- SEO:
  - Metadata (title, description, canonical `https://sramadhan.cv`) dan OG image.
  - Ringkasan profil semantik yang tersembunyi secara visual (bukan `display: none`) untuk crawler dan screen reader.
- Keamanan: header CSP dan header keamanan lain (`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`) di `next.config`.
- Audit a11y: fokus keyboard di window dan dock, label ARIA untuk tombol ikon, dan kontras warna accent.
- Audit performa:
  - Lazy load aplikasi.
  - Optimasi gambar wallpaper (format modern, ukuran sesuai layar).
  - Target Lighthouse ≥ 90 di desktop.
- `README` berisi:
  - Cara menambah wallpaper (`/public/wallpaper`), musik + `.lrc` (`/public/music`), project (`content/projects.ts`), dan knowledge chatbot (`content/chatbot/knowledge/`).
  - Daftar env beserta keterangannya.
- GitHub Actions menjalankan `npm run check` dan suite Playwright.
- Deploy ke Vercel, set env (`CHAT_API_BASE_URL`, `CHAT_API_KEY`, `CHAT_MODEL`, `CHAT_STREAM`, `GITHUB_TOKEN`), dan hubungkan domain sramadhan.cv.

## Test Requirements

- Seluruh `npm run check` dan suite Playwright (desktop + mobile) lulus di CI.

## Demo

sramadhan.cv live dengan semua aplikasi MVP 1.

## Definition of Done

- [ ] Metadata, OG image, dan ringkasan profil semantik
- [ ] Header CSP dan header keamanan
- [ ] Audit a11y selesai (fokus keyboard, ARIA, kontras)
- [ ] Audit performa selesai dengan Lighthouse ≥ 90 di desktop
- [ ] `README` lengkap (aset, konten, knowledge, env)
- [ ] GitHub Actions menjalankan `npm run check` dan Playwright
- [ ] Deploy Vercel dengan env terpasang
- [ ] Domain sramadhan.cv terhubung
- [ ] `npm run check` lulus

---

[← Sebelumnya](./15-task-mobile-ios.md) · [↑ Kembali ke Overview](./00-overview.md)
