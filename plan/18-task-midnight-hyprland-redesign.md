# Task 18: Redesign UI Hyprland Linux Berbasis Design System `design.md` (Midnight Navy)

[↑ Kembali ke Overview](./00-overview.md) · [← Sebelumnya](./17-task-hyprland-linux-design.md)

> **Design Read (`antislop` Part 3):**
> Reading this as: **Interactive Linux Hyprland Desktop OS Portfolio (`sramadhan.cv`)** for **recruiters, engineers, and collaborators**, in a **Midnight Navy Hyprland (Waybar + Tiling/Floating WM + Midnight Surface Hierarchy)** visual language, dial **ENERGY 2 / RHYTHM 2 / MOTION 2**.

---

## 1. Tujuan & Konteks Kolaborasi UI/UX + Frontend

Mengadaptasi design system dari [`design.md`](../design.md) (**Midnight Banking Dashboard** token system) ke dalam arsitektur **Linux Hyprland Reference UI** pada `sramadhan.cv` dengan menerapkan filter kualitas **`antislop` + `antislop-ui` (Mode 1: DURING)** serta playbook **`ui-taste` (`new-work`, `operate`, `craft`)**.

### Prinsip Sintesis: `design.md` × Linux Hyprland
1. **Identitas Tetap Linux Hyprland OS**: Struktur aplikasi tetap berupa sistem operasi desktop Linux berbasis Wayland/Hyprland (Boot `systemd-boot` -> Lockscreen `Hyprlock` -> Welcome Session -> Desktop `Waybar` + `WindowManager` + `IslandView` eww widget + `Dock` taskbar + 5 aplikasi internal + Mobile view).
2. **Visual World & Surface Stepping dari `design.md`**:
   - Mengganti palet abu-hitam generik (`#080b10` / `#0d1117`) menjadi **Midnight Navy Surface Hierarchy** (`#040D3F` Page Canvas -> `#141C4E` Surface Default / Bar / Frame -> `#1D2552` Card & Tile Fill -> `#243066` Card Hover).
   - Mematuhi aturan `design.md` (*Do & Don't #1 & #7*): pemisahan antar-area utama bertumpu pada **langkah kedalaman warna latar (`#040D3F` -> `#141C4E` -> `#1D2552`)**, bukan garis border kasar di setiap elemen internal. Border hanya dipakai sebagai aksen fokus window aktif Hyprland (`--info-cyan` / `--accent`) atau divider tipis (`#DEE2E6` dengan opasitas rendah `rgba(222, 226, 230, 0.08)`).
3. **Tipografi Presisi (`design.md` Typography)**:
   - **UI & Body Font**: Mempertahankan `Plus Jakarta Sans` (`@fontsource-variable/plus-jakarta-sans` yang sudah terpasang, tanpa menggantinya ke `Inter`) untuk keterbacaan label, navigasi, isi pesan, dan judul kartu.
   - **Monospace & Tabular Font**: `JetBrains Mono` (`font-variant-numeric: tabular-nums`) untuk jam Waybar, metrik CPU/RAM/Battery, prompt & output Terminal, durasi lagu Music, tanggal Kalender, dan badge sistem.
4. **Gradien & Elevasi Terkontrol (`design.md` + `antislop` R-01, R-12, R-13)**:
   - Gradien `135deg` dari `design.md` (`--card-turquoise`, `--card-pink`, `--card-purple`, `--product-yellow`, `--product-pink-soft`, `--product-cyan-soft`) **hanya** digunakan pada kartu entitas utama (maksimal 3 gradien dalam 1 viewport sesuai `design.md` Don't #3), seperti kartu profil utama di Settings/Welcome, kartu highlight proyek di Calendar, atau kartu Now Playing di Music.
   - Baris daftar (track list Music, riwayat Terminal, bubble chat Message, sel Calendar) **wajib** memakai warna solid `--card-bg` (`#1D2552`) dan `--card-bg-hover` (`#243066`) dengan `Tile Shadow`.
5. **Kepatuhan Penuh pada Test & Fungsionalitas**:
   - Seluruh `data-testid`, state Zustand (`system-store`, `window-store`, `settings-store`, `player-store`), shortcut keyboard, drag/resize `react-rnd`, dan alur E2E Playwright tidak boleh rusak.

---

## 2. Buildable Direction Contract (`ui-taste` & `antislop`)

| Dimensi | Spesifikasi Kontrak |
| :--- | :--- |
| **Thesis** | Menyajikan portofolio engineer dalam shell Linux Hyprland yang tenang, presisi, dan berwibawa menggunakan kedalaman warna Midnight Navy (`#040D3F` -> `#141C4E` -> `#1D2552`), menghindari kesan "template dashboard AI" maupun tiruan macOS/iOS. |
| **Visual World** | Palet Midnight Navy (`#040D3F`, `#141C4E`, `#1D2552`, `#243066`), teks putih murni (`#FFFFFF`) khusus judul/nilai primer & abu-perak (`#B9BBC7`) untuk body sekunder, status semantik Mint (`#7FE089`), Coral (`#F97D7D`), dan Cyan (`#0D8091` / `#1AB8C7`), dipadukan dengan tipografi `Plus Jakarta Sans` + `JetBrains Mono`. |
| **Story** | Pengunjung membuka sesi Wayland/Hyprland milik Satria Ramadhan, mengeksplorasi proyek nyata di Kalender, membaca profil/statistik GitHub nyata di Terminal & Pengaturan, mendengarkan musik dengan lirik tersinkron, dan berdiskusi dengan asisten RAG. |
| **First Viewport** | Layar Boot/Lock/Desktop berlatar `#040D3F` dengan top bar Waybar `#141C4E`, widget status `IslandView` terpusat, area kerja jendela dengan fokus jelas, serta launcher dock bawah yang ringkas. |
| **Authority** | **Replace visual tokens & surface treatment** berdasarkan `design.md`, **Preserve** arsitektur Hyprland OS, struktur window manager, state, dan seluruh `data-testid`. |
| **Liveliness Dials** | **ENERGY 2** (kontras permukaan Midnight Navy + aksen gradien terkurasi pada focal point) / **RHYTHM 2** (komposisi bervariasi per aplikasi: grid kalender, split-pane player, tabular terminal, kartu profil) / **MOTION 2** (transisi spring terukur pada widget/window dan feedback hover `#243066`, patuh `prefers-reduced-motion`). |

---

## 3. Catatan Alasan Keputusan Desain (`antislop` R-31 — Keystone Rule)

Setiap keputusan visual utama memiliki alasan satu kalimat yang terdokumentasi:

1. **Mengapa Palet Midnight Navy (`#040D3F` -> `#141C4E` -> `#1D2552` -> `#243066`)?**
   Memberikan hierarki kedalaman ruang (z-depth) antara canvas desktop, chrome window/bar, kartu konten, dan state interaktif melalui langkah luminansi warna tanpa bergantung pada garis border ramai (`design.md` Do #1 & Don't #7, `antislop` R-01/R-29).
2. **Mengapa Tipografi `Plus Jakarta Sans` + `JetBrains Mono`?**
   `Plus Jakarta Sans` mempertahankan karakter identitas portofolio Satria Ramadhan sekaligus menjamin keterbacaan optimal pada teks antarmuka padat (bukan default AI `Inter`), sedangkan `JetBrains Mono` memastikan kesejajaran digit (`tabular-nums`) pada jam Waybar, metrik CPU/RAM, durasi audio, dan statistik GitHub (`design.md` Do #6, `antislop` R-06).
3. **Mengapa Skala Radius Bertingkat (`6px`, `8px`, `12px`, `16px`, `9999px`)?**
   Membedakan fungsi elemen secara visual: `6px` untuk status badge mikro, `8px` untuk kontrol window/aksen kecil, `12px` untuk tile/row dan frame window, `16px` untuk kartu utama bergradien, dan `9999px` khusus tombol aksi pill, avatar lingkaran, serta track progress bar (`design.md` Border Radius, `antislop` R-11).
4. **Mengapa Gradien 135° Dibatasi Maksimal 3 per Viewport?**
   Menjaga agar gradien (`--card-turquoise`, `--card-pink`, `--card-purple`) tetap menjadi penarik perhatian utama (focal point) pada entitas primer dan tidak berubah menjadi dekorasi latar tanpa makna (`design.md` Do #2 & Don't #3, `antislop` R-01).
5. **Mengapa Sistem Elevasi Dua Tingkat (`Tile Shadow` vs `Card Shadow Big`)?**
   Memisahkan elemen daftar datar yang hanya membutuhkan bayangan tipis (`0 2px 4px rgba(0,0,0,0.10)`) dari window aktif atau kartu hero yang membutuhkan ambient glow gelap (`0 0 60px rgba(0,4,26,0.60)`) (`design.md` Do #8, `antislop` R-12/R-13).
6. **Mengapa Menghapus Seluruh Karakter Em Dash (`—`) pada Teks UI?**
   Mematuhi aturan mutlak `antislop` R-02 agar teks antarmuka, judul bar, dan tombol kontrol terasa alami serta konsisten menggunakan pemisah teknis Linux (`//`, `:`, `·`, atau `-`).

---

## 4. Audit Kepatuhan `antislop` & Resolusi Konflik (`R-37`)

Sebelum implementasi, berikut hasil audit terhadap kode saat ini dan pemetaan `design.md`:

| Rule | Temuan pada Kode Saat Ini / `design.md` | Tindakan pada Rencana Redesign |
| :--- | :--- | :--- |
| **R-02 (Hard Gate: Em Dash `—`)** | Karakter `—` ditemukan di `DesktopScreen.tsx` (`— sramadhan@wayland`), `WindowFrame.tsx` (tombol minimize `—`), `IslandView.tsx` (`track.title — track.artist`), `TerminalApp.tsx` (`bash — guest`, `Version 1.0.0 — Hyprland`), dan `MessageApp.tsx` (`#assistant — Satria's Assistant`). | Ganti semua `—` di teks UI dengan `//` atau `·`, dan ganti label tombol minimize `—` dengan simbol minus `-` (atau ikon `Minus` dengan `aria-label` tetap utuh). |
| **R-01 & R-29 (Color & Gradients)** | `Spectrum.tsx` dan `command-registry.tsx` masih menggunakan hardcoded Tailwind `from-blue-500 to-indigo-400`, `text-blue-400`, `text-neutral-*`. | Ganti seluruh warna hardcoded dengan CSS variables dari `design.md` (`--info-cyan`, `--positive`, `--negative`, `--text-primary`, `--text-secondary`). |
| **R-06 (Typography)** | Proyek saat ini sudah memuat `@fontsource-variable/plus-jakarta-sans` dengan fallback monospace sistem. `design.md` telah disesuaikan untuk memakai `Plus Jakarta Sans` + `JetBrains Mono`. | Pertahankan `Plus Jakarta Sans Variable` di `layout.tsx` dan `globals.css` (tidak diganti ke `Inter`), serta tambahkan `JetBrains Mono` untuk elemen tabular/monospace (`--font-mono`). |
| **R-10 (Glassmorphism Dose Cap)** | Blur dipakai di beberapa overlay sekaligus (`LockScreen`, `WelcomeScreen`, `MusicApp`, `CalendarApp`). | Batasi `backdrop-filter: blur` maksimal pada 1–2 elemen overlay aktif (LockScreen overlay dan modal bottom-sheet mobile). Panel Waybar, Dock, dan Window menggunakan surface solid `#141C4E` / `#1D2552`. |
| **R-11 (Border Radius Hierarchy)** | `design.md` melarang radius `<= 4px` (Don't #9) namun mencegah semua elemen menjadi pill (R-11). | Terapkan skala radius `design.md`: `6px` (`xs` chip/badge), `8px` (`sm` tombol kontrol bar/aksen), `12px` (`DEFAULT` window frame, tile, row), `16px` (`lg` kartu hero/profil), `9999px` (`full` tombol pill aksi primer, avatar, progress track). |
| **R-17 & R-38 (Real Data Only)** | `design.md` berasal dari referensi dashboard perbankan (`$3,689.12`). | **Jangan pernah** menyalin teks angka perbankan fiktif dari `design.md`. Gunakan hanya data portofolio nyata Satria Ramadhan (`content/profile.ts`, `content/projects.ts`, `/api/github`, `/public/music`). |
| **R-25 (WCAG AA Contrast)** | `--text-tertiary` (`#6A7178`) di atas `--card-bg` (`#1D2552`) memiliki rasio kontras ~2.8:1 (di bawah 4.5:1 untuk teks bacaan). | Gunakan `--text-primary` (`#FFFFFF`, rasio >13:1) untuk judul/nilai utama dan `--text-secondary` (`#B9BBC7`, rasio >7.5:1) untuk seluruh teks body, subtitle, dan metadata yang harus dibaca. Gunakan `#6A7178` **hanya** untuk state `disabled` sesuai spesifikasi `design.md`. |

---

## 5. Spesifikasi Token Desain (`src/app/globals.css`)

Pemetaan lengkap token dari `design.md` yang diintegrasikan dengan alias `--linux-*` agar kompatibel penuh dengan komponen yang ada:

```css
:root {
  /* 1. Page & Surfaces (design.md) */
  --page-bg: #040d3f;
  --surface-default: #141c4e;
  --card-bg: #1d2552;
  --card-bg-hover: #243066;

  /* 2. Foreground & Text (design.md) */
  --text-primary: #ffffff;
  --text-secondary: #b9bbc7;
  --text-tertiary: #6a7178; /* Khusus state disabled */
  --neutral-divider: #dee2e6;
  --neutral-badge: #adb5bd;
  --surface-divider: rgba(222, 226, 230, 0.1);
  --surface-border-strong: rgba(222, 226, 230, 0.2);

  /* 3. Status & Accents (design.md) */
  --positive: #7fe089;
  --positive-tint: rgba(127, 224, 137, 0.15);
  --negative: #f97d7d;
  --negative-tint: rgba(249, 125, 125, 0.15);
  --info-cyan: #0d8091;
  --info-cyan-bright: #1ab8c7;
  --info-cyan-tint: rgba(13, 128, 145, 0.2);

  /* 4. Named 135deg Gradients (design.md - Max 3 per viewport) */
  --card-turquoise: linear-gradient(135deg, #0d8091 0%, #1ab8c7 100%);
  --card-pink: linear-gradient(135deg, #b53d7f 0%, #e45d9a 100%);
  --card-purple: linear-gradient(135deg, #5a2d8a 0%, #8b4fbf 100%);
  --product-yellow: linear-gradient(135deg, #d4a017 0%, #f2c94c 100%);
  --product-pink-soft: linear-gradient(135deg, #e64980 0%, #ff6b9d 100%);
  --product-cyan-soft: linear-gradient(135deg, #2d7dd2 0%, #4fa8e8 100%);

  /* 5. Elevation Shadows (design.md) */
  --shadow-tile: 0 2px 4px 0 rgba(0, 0, 0, 0.10);
  --shadow-card-big: 0 0 60px 0 rgba(0, 4, 26, 0.60);
  --shadow-modal: 0 8px 32px 0 rgba(0, 0, 0, 0.30);

  /* 6. Spacing Scale (Base 8px - design.md) */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 20px;
  --space-2xl: 24px;
  --space-3xl: 32px;

  /* 7. Border Radius Scale (design.md - No <=4px radii) */
  --radius-xs: 6px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  /* 8. Dynamic System Accent & Hyprland Alias Mapping */
  --accent: #1ab8c7;
  --accent-rgb: 26, 184, 199;
  --linux-bg: var(--page-bg);
  --linux-surface: var(--surface-default);
  --linux-surface-raised: var(--card-bg);
  --linux-surface-hover: var(--card-bg-hover);
  --linux-border: var(--surface-divider);
  --linux-border-strong: var(--surface-border-strong);
  --linux-text: var(--text-primary);
  --linux-text-muted: var(--text-secondary);
  --linux-text-subtle: var(--text-secondary);
  --linux-accent: var(--accent);
  --linux-accent-strong: var(--info-cyan);
  --linux-success: var(--positive);
  --linux-warning: #f2c94c;
  --linux-danger: var(--negative);
}
```

### Skala Tipografi (`design.md`)
- **Display**: `Plus Jakarta Sans` 32px (`2rem`), `700` bold, line-height `1.2` -> Jam Lockscreen & Hero angka utama.
- **H1 / Page Title**: `Plus Jakarta Sans` 22px (`1.375rem`), `700` bold, line-height `1.25` -> Judul halaman aplikasi, nilai KPI GitHub, judul lagu aktif.
- **H2 / Section Title**: `Plus Jakarta Sans` 16px (`1rem`), `600` semibold, line-height `1.3` -> Header bagian ("Appearance", "Perpustakaan Musik", "Detail Proyek").
- **Card Title**: `Plus Jakarta Sans` 16px (`1rem`), `600` semibold, line-height `1.3` -> Nama profil pada kartu gradien, nama proyek di Kalender.
- **Body**: `Plus Jakarta Sans` 14px (`0.875rem`), `500` medium, line-height `1.4` -> Nama track, link navigasi, label tombol, isi pesan chat.
- **Body Subtle**: `Plus Jakarta Sans` 13px (`0.8125rem`), `500` medium, line-height `1.4` -> Bio singkat, deskripsi pengaturan, link sekunder.
- **Caption**: `Plus Jakarta Sans` 12px (`0.75rem`), `400` regular, line-height `1.4` -> Subtitle artis, label KPI, tanggal, persentase delta.
- **Micro**: `Plus Jakarta Sans` 11px (`0.6875rem`), `600` semibold, line-height `1.3` -> Status badge (`6px` radius), chip workspace.
- **Mono Numeric**: `JetBrains Mono` 14px (`0.875rem`), `500` medium, line-height `1.4`, `tabular-nums` -> Baris Terminal, waktu, persentase CPU/RAM, durasi audio.

---

## 6. Rencana Perubahan Per Komponen (Component-by-Component Plan)

### A. Fondasi, Font, & Preset Aksen
#### [MODIFY] `src/app/layout.tsx`
- Pertahankan `@fontsource-variable/plus-jakarta-sans` (tidak diubah ke `Inter`), dan tambahkan `JetBrains Mono` (`--font-jetbrains-mono`) untuk elemen monospace/tabular.
- Set background utama pada `<html>` dan `<body>` ke `var(--page-bg)` (`#040D3F`).

#### [MODIFY] `src/app/globals.css`
- Implementasikan seluruh variabel CSS `design.md` di atas.
- Tambahkan helper class berdasarkan komponen `design.md`:
  - `.midnight-tile`: `background: var(--card-bg); border-radius: var(--radius-md); box-shadow: var(--shadow-tile);`
  - `.midnight-tile-hover:hover`: `background: var(--card-bg-hover);`
  - `.midnight-hero-card`: `border-radius: var(--radius-lg); padding: var(--space-xl); box-shadow: var(--shadow-card-big);`
  - `.midnight-pill-primary`: `border-radius: var(--radius-full); background: #FFFFFF; color: #040D3F; font-weight: 600; font-size: 13px;`
  - `.midnight-pill-toggle`: `border-radius: var(--radius-full); background: var(--card-bg); color: var(--text-primary);`
  - `.midnight-badge`: `border-radius: var(--radius-xs); padding: 4px 8px; font-size: 11px; font-weight: 600;`
  - `.tabular-mono`: `font-family: var(--font-jetbrains-mono), monospace; font-variant-numeric: tabular-nums;`

#### [MODIFY] `src/lib/stores/settings-store.ts`
- Selaraskan `ACCENT_PRESETS` dengan palet `design.md`:
  - `cyan`: `"Turquoise"` (`#1AB8C7`, rgb `26, 184, 199`) — default baru yang selaras dengan `--card-turquoise` & `--info-cyan`.
  - `pink`: `"Rose Pink"` (`#E45D9A`, rgb `228, 93, 154`) — selaras dengan `--card-pink`.
  - `purple`: `"Royal Purple"` (`#8B4FBF`, rgb `139, 79, 191`) — selaras dengan `--card-purple`.
  - `green`: `"Mint Positive"` (`#7FE089`, rgb `127, 224, 137`) — selaras dengan `--positive`.
  - `yellow`: `"Gold Warm"` (`#F2C94C`, rgb `242, 201, 76`) — selaras dengan `--product-yellow`.
  - `red`: `"Coral Alert"` (`#F97D7D`, rgb `249, 125, 125`) — selaras dengan `--negative`.
  - `blue`: `"Soft Sky"` (`#4FA8E8`, rgb `79, 168, 232`) — selaras dengan `--product-cyan-soft`.
  - `graphite`: `"Cool Silver"` (`#B9BBC7`, rgb `185, 187, 199`) — selaras dengan `--text-secondary`.

---

### B. OS Lifecycle Screens (`Boot`, `Lock`, `Welcome`)
#### [MODIFY] `src/os/boot/BootScreen.tsx`
- **Background**: `--page-bg` (`#040D3F`).
- **Logo Tile**: `56x56` dengan radius `16px` (`--radius-lg`), latar `--card-turquoise` gradient, shadow `--shadow-card-big`, menampilkan monogram `"SR"` dalam `JetBrains Mono` putih bold.
- **Progress Bar (`design.md` Progress Bar)**: tinggi `4px`, radius `full` (`9999px`), track `--card-bg-hover` (`#243066`), fill `--positive` (`#7FE089`).
- **Teks Status**: `JetBrains Mono` 12px (`--text-secondary`), persentase menggunakan `tabular-nums`.

#### [MODIFY] `src/os/lock/LockScreen.tsx`
- **Overlay**: Lapisan Midnight Navy `rgba(4, 13, 63, 0.78)` dengan `backdrop-filter: blur(8px)` (1 dari 2 elemen blur yang diizinkan sesuai R-10).
- **Status Chip Atas**: Menggunakan `.midnight-badge` (radius `6px`, `11px` semibold) dengan varian **Info** (`#0D8091` 20% fill, teks `#1AB8C7`).
- **Jam & Tanggal**: Jam ukuran Display (`JetBrains Mono` bold, `#FFFFFF`, `tabular-nums`), tanggal menggunakan `--text-secondary` (`#B9BBC7`).
- **Kartu Profil Unlock**:
  - Latar `--surface-default` (`#141C4E`), padding `24px` (`--space-2xl`), radius `16px` (`--radius-lg`), shadow `--shadow-modal`, tanpa border kasar.
  - **Avatar (`design.md` Avatar)**: lingkaran `40x40` (`radius-full`), latar `--card-bg` (`#1D2552`), inisial `"SR"` `Plus Jakarta Sans` 14px semibold `#FFFFFF`.
  - **Tombol Unlock (`design.md` Pill Action Button - Primary on Dark)**: bentuk pill penuh (`radius-full`), latar putih `#FFFFFF`, teks `#040D3F` (`Plus Jakarta Sans` 13px semibold, padding `10px 20px`), hover sedikit meredup/mengangkat.

#### [MODIFY] `src/os/welcome/WelcomeScreen.tsx`
- **Kartu Sesi Startup (`design.md` Gradient Account Card Anatomy)**:
  - Menggunakan gradien `--card-turquoise` (`linear-gradient(135deg, #0D8091 0%, #1AB8C7 100%)`), radius `16px`, padding `20px`, shadow `--shadow-card-big`.
  - Baris atas: badge status `[OK] session initialized` di kiri dan chip `wayland-0` di kanan (`white/80%`).
  - Baris utama: Avatar lingkaran `40x40` (`--card-bg`), judul sambutan `#FFFFFF` (`Plus Jakarta Sans` 22px bold), serta role & nomor sesi `•••• 0001` dalam `JetBrains Mono` 14px medium.

---

### C. Desktop Shell: Waybar, Window Manager, Island Widget, & Dock
#### [MODIFY] `src/os/desktop/DesktopScreen.tsx`
- **Canvas & Overlay**: Latar dasar `--page-bg` (`#040D3F`). Jika wallpaper aktif, lapisi dengan overlay `rgba(4, 13, 63, 0.72)` agar kontras surface tetap terjaga.
- **Waybar Top Bar (`design.md` Header Bar Anatomy + Hyprland Modules)**:
  - Tinggi `40px` (proporsional untuk window manager desktop), latar `--surface-default` (`#141C4E`), padding horizontal `24px` (`--space-2xl`), shadow `--shadow-tile`, tanpa garis border kasar.
  - **Kiri**: Wordmark `> sramadhan` (`Plus Jakarta Sans` 14px bold `#FFFFFF`) + grup tombol Workspace `1 2 3 4 5` di dalam container `--page-bg` (`radius: 8px`). Tombol workspace aktif memakai `--card-bg` (`#1D2552`) dengan indikator bawah `--accent`; tidak aktif memakai teks `--text-secondary` (`#B9BBC7`). Di samping workspace, modul informasi sesi/aplikasi aktif (`Terminal` icon + `${t(activeAppMeta.titleKey)} // sramadhan@wayland`) ditempatkan di sisi kiri agar tidak bertabrakan dengan Notch PioPio di area tengah.
  - **Tengah**: Dikosongkan khusus untuk widget status sistem Notch PioPio (`IslandView`), sehingga widget tidak lagi menutupi informasi bar mana pun.
  - **Kanan**:
    - Chip metrik CPU & RAM (`JetBrains Mono` 12px `tabular-nums`, ikon CPU berwarna `--positive` `#7FE089`).
    - Chip Baterai (jika didukung, warna `--positive`).
    - Tombol Bahasa (`ID`/`EN`) dengan latar `--card-bg`, hover `--card-bg-hover`, radius `8px`.
    - Jam sistem (`JetBrains Mono` 12px `tabular-nums`, `#FFFFFF`).
    - Tombol Lock berbentuk Pill Action kompak (`radius-full`, latar `--negative-tint`, teks `--negative` `#F97D7D`).

#### [MODIFY] `src/os/window-manager/WindowFrame.tsx`
- **Container Window**:
  - Latar `--surface-default` (`#141C4E`), radius `12px` (`--radius-md`, `design.md` Don't #9 melarang radius `<=4px`).
  - Saat fokus (`isFocused`): shadow `--shadow-card-big` (`0 0 60px 0 rgba(0, 4, 26, 0.60)`) dan border `1px solid var(--accent)`.
  - Saat tidak fokus: shadow `--shadow-tile` dan border `1px solid rgba(222, 226, 230, 0.08)`.
- **Title Bar Hyprland**:
  - Tinggi `38px`, latar `--card-bg` (`#1D2552`) saat fokus dan `--surface-default` (`#141C4E`) saat tidak fokus, padding horizontal `16px`.
  - **Kiri**: Ikon aplikasi (`16x16`), judul aplikasi (`Plus Jakarta Sans` 13px semibold `#FFFFFF`), dan Status Badge (`radius: 6px`, `11px` semibold, varian Info/Neutral) bertuliskan `FLOATING` atau `FULLSCREEN`.
  - **Kanan (Kontrol Window)**: Tombol berukuran `26x26` dengan radius `8px` (`--radius-sm`), latar `--surface-default`, hover `--card-bg-hover`.
    - Minimize: simbol `-` (menggantikan em dash `—` untuk patuh R-02).
    - Maximize: simbol `□`.
    - Close: simbol `×` dengan hover latar `--negative-tint` dan teks `--negative` (`#F97D7D`).

#### [MODIFY] `src/notch/geometry.ts`, `src/notch/IslandView.tsx`, `src/notch/MetricRing.tsx`, & `src/notch/Spectrum.tsx`
- **`geometry.ts`**: Perbarui `borderRadius` collapsed menjadi `12` (`--radius-md`) dan expanded menjadi `16` (`--radius-lg`) agar selaras dengan skala `design.md`.
- **`IslandView.tsx`**:
  - Latar `--card-bg` (`#1D2552`), saat expanded menggunakan `--shadow-card-big`.
  - Hapus em dash `—` pada judul lagu (`${track.title} · ${track.artist}`).
  - Baris lirik aktif menggunakan `--positive` (`#7FE089`) atau `--accent`, di dalam container `--surface-default` (`#141C4E`, radius `12px`).
  - Tombol kontrol media memakai pill/circle button sesuai anatomi `design.md` (Play/Pause: latar `#FFFFFF` dengan ikon `#040D3F`).
- **`MetricRing.tsx`**: Gunakan `--positive` (`#7FE089`) untuk CPU, `--info-cyan-bright` (`#1AB8C7`) untuk RAM, dan `--text-secondary` (`#B9BBC7`) untuk label.
- **`Spectrum.tsx`**: Ganti hardcoded `from-blue-500 to-indigo-400` dengan warna solid/gradien dari token (`--info-cyan` ke `--positive`).

#### [MODIFY] `src/os/dock/Dock.tsx`
- **Container Taskbar**: Latar `--surface-default` (`#141C4E`), padding `8px 12px`, radius `16px` (`--radius-lg`), shadow `--shadow-modal`, pemisahan melalui kontras surface terhadap `#040D3F`.
- **Item Aplikasi**: Ukuran `40x40`, radius `12px` (`--radius-md`), latar `--card-bg` (`#1D2552`), hover `--card-bg-hover` (`#243066`).
- **Indikator Berjalan**: Titik/bar di bawah ikon (`height: 4px`, radius `full`, warna `--positive` `#7FE089` saat aktif, `--text-secondary` saat berjalan di latar).
- **Tooltip**: Radius `6px` (`--radius-xs`), latar `--card-bg`, teks `Plus Jakarta Sans` 11px semibold `#FFFFFF`, shadow `--shadow-tile`.

---

### D. Aplikasi Internal (`Terminal`, `Settings`, `Music`, `Calendar`, `Message`)

#### 1. Terminal (`src/apps/terminal/TerminalApp.tsx`, `command-registry.tsx`, `commands/GitHubOutput.tsx`)
- **Surface**: Area baca utama menggunakan `--page-bg` (`#040D3F`) untuk kontras maksimal teks terminal; sub-header menggunakan `--surface-default` (`#141C4E`).
- **Kepatuhan R-02**: Ganti `bash — guest@sramadhan.cv` menjadi `bash // guest@sramadhan.cv` dan `Version 1.0.0 — Hyprland/Wayland` menjadi `Version 1.0.0 // Hyprland/Wayland`.
- **Tipografi**: Seluruh prompt, input, dan statistik menggunakan `JetBrains Mono` (`tabular-nums`).
- **Komponen `GitHubOutput.tsx` (`design.md` KPI Tile Anatomy)**:
  - Tampilkan statistik `Followers`, `Public Repos`, dan `Total Stars` sebagai **KPI Tiles** (`--card-bg` `#1D2552`, padding `16px`, radius `12px`, gap `8px`, shadow `--shadow-tile`).
  - Setiap KPI Tile menampilkan label (`Plus Jakarta Sans` 12px medium `--text-secondary`) dan nilai utama (`JetBrains Mono` 22px bold `#FFFFFF` `tabular-nums`), serta badge bahasa teratas menggunakan `.midnight-badge` (`radius: 6px`).
  - Ganti semua warna hardcoded (`text-blue-400`, `text-neutral-*`, `text-red-400`) di `command-registry.tsx` dan `GitHubOutput.tsx` dengan variabel `--accent`, `--text-primary`, `--text-secondary`, `--positive`, dan `--negative`.

#### 2. Settings (`src/apps/settings/SettingsApp.tsx`)
- **Layout**: Sidebar kiri (`w-52`) berlatar `--page-bg` (`#040D3F`), area konten utama berlatar `--surface-default` (`#141C4E`) dengan padding `24px` (`--space-2xl`).
- **Navigasi Sidebar**: Item menggunakan radius `12px` (`--radius-md`), item aktif berlatar `--card-bg` (`#1D2552`), hover `--card-bg-hover` (`#243066`), teks aktif `#FFFFFF`, teks pasif `--text-secondary` (`#B9BBC7`).
- **Kartu Wallpaper & Aksen**: Menggunakan `.midnight-tile` (`#1D2552`, radius `12px`, padding `12px`, hover `#243066`). Pilihan aktif ditandai dengan badge centang `--positive` (`#7FE089`).
- **Section About (`design.md` Gradient Account Card Anatomy)**:
  - Kartu profil utama Satria Ramadhan menggunakan `--card-purple` (`linear-gradient(135deg, #5A2D8A 0%, #8B4FBF 100%)`), radius `16px`, padding `20px`, shadow `--shadow-card-big`.
  - Tautan sosial (`LinkedIn`, `Instagram`, `Threads`, `GitHub`) dirender sebagai baris tile `--card-bg` (`#1D2552`, radius `12px`, padding `16px`, hover `#243066`) dengan tombol pill kecil `"View"` (`radius-full`, putih `#FFFFFF`, teks `#040D3F`, padding `6px 12px`) di sisi kanan sesuai anatomi **Goal / Product Card** `design.md`.

#### 3. Music (`src/apps/music/MusicApp.tsx` & `src/apps/music/lyrics/LyricsSheet.tsx`)
- **Sidebar & Main**: Sidebar berlatar `--page-bg` (`#040D3F`), area utama berlatar `--surface-default` (`#141C4E`).
- **Featured Now Playing Banner (Library Header)**: Kartu highlight lagu aktif di atas daftar lagu menggunakan `--card-pink` (`linear-gradient(135deg, #B53D7F 0%, #E45D9A 100%)`), radius `16px`, padding `20px`, shadow `--shadow-card-big` (1 gradien di viewport ini).
- **Track List (`design.md` Transaction Row Anatomy)**:
  - Setiap lagu ditampilkan sebagai baris/tile dengan latar `--card-bg` (`#1D2552`), hover `--card-bg-hover` (`#243066`), padding `16px`, radius `12px`, margin antar-baris `8px`, shadow `--shadow-tile` (**tanpa gradien pada baris list** sesuai `design.md` Do #2).
  - Kiri: Cover art `40x40` (`radius: 8px`) + indikator lingkaran `32x32` bertinta `--positive-tint` (`#7FE08920`) saat sedang diputar.
  - Tengah: Judul lagu (`Plus Jakarta Sans` 14px semibold `#FFFFFF`) + Nama artis (`Plus Jakarta Sans` 12px regular `--text-secondary`).
  - Kanan: Album badge & status putar dalam `JetBrains Mono` (`tabular-nums`).
- **Player Bar Bawah**:
  - Latar `--page-bg` (`#040D3F`), tinggi `80px`, padding horizontal `24px`.
  - Tombol Play/Pause utama memakai **Primary Pill/Circle on Dark** (`#FFFFFF` fill, `#040D3F` icon).
  - Seekbar & Volume bar memakai spesifikasi **Progress Bar `design.md`**: tinggi `4px`, radius `full`, track `#243066`, fill `--positive` (`#7FE089`) atau `--accent`. Waktu `positionMs` dan `durationMs` memakai `JetBrains Mono` 12px `tabular-nums`.
- **`LyricsSheet.tsx`**: Ganti kelas `text-neutral-*` dan `text-amber-200` dengan `--text-primary` (`#FFFFFF`) untuk baris aktif, `--positive` (`#7FE089`) saat pulse, dan `--text-secondary` (`#B9BBC7`) dengan opasitas terukur untuk baris pasif.

#### 4. Calendar (`src/apps/calendar/CalendarApp.tsx`)
- **Header Kalender**: Judul bulan `Plus Jakarta Sans` 16px semibold `#FFFFFF`. Tombol navigasi (`Hari Ini / Today`, `<`, `>`) menggunakan **Pill Action Button** (`radius-full`, varian Toggle Active `#1D2552` untuk `Today` dan surface button `8px` radius untuk panah).
- **Grid Tanggal**:
  - Sel tanggal bulan aktif menggunakan `--card-bg` (`#1D2552`), hover `--card-bg-hover` (`#243066`), radius `12px` (`--radius-md`), padding `12px`, shadow `--shadow-tile`.
  - Angka tanggal memakai `JetBrains Mono` 14px medium (`tabular-nums`).
  - Tanggal yang memiliki proyek ditandai dengan **Status Badge** (`--positive-tint` fill, dot & teks `--positive` `#7FE089`).
- **Side Panel Detail Proyek (`design.md` Goal / Product Card Anatomy)**:
  - Kartu proyek yang dipilih menggunakan gradien `--product-cyan-soft` (`linear-gradient(135deg, #2D7DD2 0%, #4FA8E8 100%)`) atau `--card-turquoise` untuk proyek utama, radius `16px`, padding `20px`, shadow `--shadow-card-big`.
  - Tombol link `GitHub` dan `Demo` menggunakan **Pill Action Button** (`radius-full`, latar `#FFFFFF`, teks `#040D3F`, `Plus Jakarta Sans` 13px semibold).

#### 5. Message (`src/apps/message/MessageApp.tsx`)
- **Sidebar Channel**: Latar `--page-bg` (`#040D3F`), kartu asisten aktif menggunakan `--card-bg` (`#1D2552`), radius `12px`, dengan avatar lingkaran `40x40` dan dot status `--positive` (`#7FE089`).
- **Header Thread**: Latar `--surface-default` (`#141C4E`), hapus em dash `—` (`#assistant // Satria's Assistant (AI)`), tampilkan badge status `RAG Ready` dengan `.midnight-badge` varian **Success** (`--positive` 15% fill, teks `#7FE089`).
- **Chat Bubbles**:
  - Pesan Asisten: latar `--card-bg` (`#1D2552`), teks `#FFFFFF` & `--text-secondary`, radius `12px`, padding `16px`, shadow `--shadow-tile`.
  - Pesan User: latar `--info-cyan` (`#0D8091`), teks `#FFFFFF`, radius `12px`, padding `16px`, shadow `--shadow-tile`.
- **Suggested Prompts & Input Bar**:
  - Tombol prompt saran menggunakan **Pill Action Button** (`radius-full`, latar `--card-bg` `#1D2552`, hover `--card-bg-hover` `#243066`, teks `--text-secondary` hover `#FFFFFF`, tanpa ikon Sparkles dekoratif untuk mematuhi `antislop` R-04!).
  - Input chat berlatar `--card-bg` (`#1D2552`), radius `full` (`9999px`), tombol Kirim (`Send`) menggunakan pill putih `#FFFFFF` dengan ikon `#040D3F`, dan tombol Stop menggunakan `--negative` (`#F97D7D`).

---

### E. Mobile Layout (`src/os/mobile/MobileRoot.tsx`)
- **Canvas & Overlay**: Latar `--page-bg` (`#040D3F`) dengan overlay Midnight Navy `rgba(4, 13, 63, 0.78)`.
- **Status Bar**: Tinggi `40px`, latar `--surface-default` (`#141C4E`), jam dan persentase baterai menggunakan `JetBrains Mono` (`tabular-nums`), ikon baterai berwarna `--positive` (`#7FE089`).
- **Desktop Advisory Banner**: Tile `--card-bg` (`#1D2552`), radius `12px`, padding `12px 16px`, shadow `--shadow-tile`, teks `--text-secondary`.
- **App Tile Grid**: Ikon aplikasi berukuran `56x56` dengan radius `16px` (`--radius-lg`), latar `--card-bg` (`#1D2552`), active/hover `--card-bg-hover` (`#243066`), shadow `--shadow-tile`, label aplikasi `Plus Jakarta Sans` 12px medium `#FFFFFF`.
- **Mobile Dock**: Container berlatar `--surface-default` (`#141C4E`), radius `16px`, padding `12px`, tombol aplikasi `44x44` (memenuhi minimum tap target `44px` sesuai `antislop` R-03) dengan radius `12px` dan latar `--card-bg`.
- **Fullscreen App View**: Header berlatar `--surface-default` (`#141C4E`), status badge `[TILE]` (`radius: 6px`), tombol close `×` (`radius: 8px`), dan home indicator bar bawah dengan pill track `4px` (`radius-full`, warna `--accent`).

---

## 7. Urutan Implementasi untuk Frontend

1. **Tahap 1 — Fondasi Design System & Font (`layout.tsx`, `globals.css`, `settings-store.ts`)**
   - Pertahankan font `Plus Jakarta Sans` (`@fontsource-variable/plus-jakarta-sans`) + tambahkan `JetBrains Mono`, tulis ulang variabel CSS di `globals.css` sesuai token `design.md`, dan perbarui preset aksen di `settings-store.ts`.
2. **Tahap 2 — OS Entry Flow (`BootScreen.tsx`, `LockScreen.tsx`, `WelcomeScreen.tsx`)**
   - Terapkan kanvas `#040D3F`, progress bar `4px` `#7FE089`, kartu profil `#141C4E`, tombol unlock pill putih, dan kartu sambutan bergradien `--card-turquoise`.
3. **Tahap 3 — Desktop Shell & Window Manager (`DesktopScreen.tsx`, `WindowFrame.tsx`, `Dock.tsx`, `notch/*`)**
   - Restyle Waybar (`#141C4E`), WindowFrame (`12px` radius, `--shadow-card-big` saat fokus, hapus em dash `—`), `IslandView` & `Spectrum` (token warna `design.md`), serta `Dock` (`16px` container, `12px` icon tile).
4. **Tahap 4 — Aplikasi Internal (`Terminal`, `Settings`, `Music`, `Calendar`, `Message`)**
   - Terapkan KPI Tile di Terminal GitHub, Gradient Profile Card di Settings, Transaction Row anatomy di Music track list, Goal/Product Card di Calendar, serta bebas-Sparkles & em-dash di Message.
5. **Tahap 5 — Mobile Layout (`MobileRoot.tsx`)**
   - Selaraskan permukaan `#040D3F` / `#141C4E` / `#1D2552`, radius `12px–16px`, dan ukuran tap target `>= 44px`.
6. **Tahap 6 — Verifikasi & Delivery Gate (`antislop` R-35 & `ui-taste` `craft`)**
   - Jalankan pengujian otomatis dan inspeksi visual di seluruh ukuran viewport.

---

## 8. Rencana Verifikasi & Delivery Gate Checklist

### Pengujian Otomatis
```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

### Checklist Delivery Gate (`antislop` + `antislop-ui` + `ui-taste`)
- [ ] **R-01 / R-29 (Palette & Gradients)**: Seluruh warna bersumber dari token Midnight Navy `design.md`; maksimal 3 gradien per viewport; baris daftar/transaksi tidak memakai gradien.
- [ ] **R-02 (No Em Dash)**: Selesai melakukan grep `—` pada `src/` untuk memastikan 0 karakter em dash pada teks UI yang dirender.
- [ ] **R-03 (Mobile Responsiveness)**: Tap target pada mobile dock dan kontrol minimal `44px` atau nyaman disentuh, tanpa horizontal overflow pada `390x844`.
- [ ] **R-04 (Relevant Icons)**: Ikon `Sparkles` dekoratif pada suggested prompt `MessageApp` dihapus/diganti indikator relevan.
- [ ] **R-06 (Typography)**: `Plus Jakarta Sans` tetap dipertahankan untuk hierarki teks UI (tidak diubah ke `Inter`) dan `JetBrains Mono` (`tabular-nums`) untuk angka/jam/metrik/terminal.
- [ ] **R-10 / R-12 / R-13 (Dose Caps)**: Blur maksimal pada 1–2 overlay; `--shadow-card-big` khusus pada window fokus & kartu gradien utama; lainnya menggunakan `--shadow-tile`.
- [ ] **R-11 (Border Radius Hierarchy)**: Tidak ada radius `<= 4px` (kecuali elemen mikro internal) dan tidak semua elemen berbentuk pill (`6px` badge, `8px` kontrol kecil, `12px` tile/window, `16px` kartu utama, `9999px` tombol pill aksi/avatar/progress bar).
- [ ] **R-25 (WCAG AA Contrast)**: Seluruh teks bacaan menggunakan `#FFFFFF` atau `#B9BBC7` di atas `#040D3F` / `#141C4E` / `#1D2552` (rasio kontras > 7.5:1). `#6A7178` hanya untuk state `disabled`.
- [ ] **R-26 / R-27 / R-32 (States & Keyboard)**: Empty, loading, dan error state tersedia dan jelas di Music, Calendar, Terminal GitHub, dan Message; fokus keyboard terlihat jelas (`outline: 1px solid var(--accent)`).
- [ ] **R-35 (E2E & Build Evidence)**: Seluruh unit test Vitest, E2E Playwright (`os-flow`, `drag-window`, `window-controls-fixed`, `mobile-ios`), dan `next build` lulus tanpa error.

---

[← Sebelumnya](./17-task-hyprland-linux-design.md) · [↑ Kembali ke Overview](./00-overview.md)
