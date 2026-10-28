# Task 17: Redesign UI Bergaya Hyprland Linux

[↑ Kembali ke Overview](./00-overview.md)

## Tujuan

Mengubah visual `sramadhan.cv` agar menyerupai desktop Linux bergaya Hyprland:

- Gelap
- Minimal
- Tegas dan jelas
- Menggunakan panel modular seperti Waybar
- Mengurangi elemen visual bergaya macOS/iOS
- Mempertahankan seluruh fungsi OS, window manager, dock, aplikasi, dan mobile layout

Fokus utama adalah perubahan visual dan pengalaman antarmuka. Logika aplikasi, state Zustand, API, audio engine, dan alur utama tetap dipertahankan.

## Kondisi Saat Ini

Bagian yang sudah mendukung arah Hyprland:

- `DesktopScreen` sudah memiliki top bar dengan workspace, status sistem, waktu, dan lock button.
- `LockScreen` sudah memiliki beberapa elemen bergaya Hyprlock.
- `TerminalApp` sudah memakai font monospace dan prompt Linux.
- `WindowManager` sudah mendukung drag, resize, z-index, minimize, maximize, dan close.
- Sistem accent sudah menggunakan CSS variables.
- Semua aplikasi sudah terdaftar melalui `APP_REGISTRY`.

Bagian yang masih terasa seperti macOS/iOS:

- Window menggunakan traffic light merah, kuning, hijau.
- Dock masih menggunakan magnification seperti macOS.
- Music menggunakan label dan struktur Apple Music.
- Message menggunakan istilah dan visual iMessage.
- Mobile menggunakan status bar, dock, dan home indicator bergaya iOS.
- Banyak komponen memakai rounded card besar, blur, gradient, dan shadow yang terlalu dominan.
- Warna accent biru belum diterapkan secara konsisten ke seluruh shell.

## Arah Visual

### Palet warna

Gunakan token CSS terpusat di `src/app/globals.css`:

```css
--linux-bg: #080b10;
--linux-surface: #0d1117;
--linux-surface-raised: #131a22;
--linux-surface-hover: #1a232d;
--linux-border: #26313a;
--linux-border-strong: #3a4854;

--linux-text: #e6edf3;
--linux-text-muted: #8b949e;
--linux-text-subtle: #6e7681;

--linux-accent: #7dd3fc;
--linux-accent-strong: #38bdf8;
--linux-success: #7ee787;
--linux-warning: #f2cc60;
--linux-danger: #ff7b72;
```

Prinsip warna:

- Background hampir hitam dengan sedikit warna biru/abu.
- Surface menggunakan warna solid atau transparansi sangat tipis.
- Border 1px dipakai untuk memisahkan panel.
- Accent digunakan untuk fokus, workspace aktif, link, tombol utama, dan indikator.
- Hindari penggunaan gradient terang sebagai elemen utama.
- Hindari glow besar yang membuat UI terlihat seperti gaming dashboard.

### Tipografi

- Pertahankan `Plus Jakarta Sans` untuk konten utama.
- Gunakan system monospace untuk:
  - Top bar
  - Workspace
  - Status sistem
  - Terminal
  - Label window mode
  - Metadata waktu
- Gunakan ukuran font kecil dan padat untuk chrome UI.
- Terapkan hierarki kontras yang jelas antara judul, label, dan metadata.

### Bentuk komponen

- Radius utama antara `4px–8px`.
- Panel besar dapat menggunakan radius `8px–10px`.
- Kurangi penggunaan rounded pill.
- Gunakan padding yang konsisten dan lebih rapat.
- Gunakan border dan spacing sebagai pembeda utama, bukan shadow besar.
- Shadow hanya digunakan untuk window aktif dan overlay penting.

## Tahap Implementasi

### 1. Membuat sistem token desain

File utama:

- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/lib/stores/settings-store.ts`

Perubahan:

- Tambahkan token warna Linux/Hyprland.
- Tambahkan utility class atau CSS class bersama untuk:
  - panel
  - panel aktif
  - panel hover
  - label monospace
  - status chip
  - focus ring
- Pastikan accent dari Settings tetap dapat mengubah warna utama.
- Ubah default accent menjadi warna yang lebih dekat dengan Hyprland, misalnya cyan atau purple.
- Pastikan semua komponen menggunakan token, bukan hardcoded `blue-*`, `neutral-*`, atau `white/*` secara berlebihan.

### 2. Mendesain ulang desktop shell

File:

- `src/os/desktop/DesktopScreen.tsx`
- `src/notch/IslandView.tsx`

Perubahan pada top bar:

- Tinggi sekitar 30–36px.
- Gunakan panel horizontal modular dengan border tipis.
- Bagian kiri:
  - simbol `>`
  - nama sistem atau `sramadhan`
  - workspace `1 2 3 4 5`
- Workspace aktif diberi accent bar atau background accent transparan.
- Bagian tengah:
  - nama aplikasi aktif
  - format seperti `sramadhan@wayland`
- Bagian kanan:
  - status CPU/RAM
  - baterai jika tersedia
  - waktu
  - bahasa
  - tombol lock

Perubahan pada background:

- Wallpaper tetap didukung.
- Tambahkan overlay gelap agar teks dan panel tetap jelas.
- Gunakan satu lapisan gradient gelap hanya sebagai overlay kontras.
- Jangan menjadikan wallpaper terlalu terang atau dominan.

Perubahan pada `IslandView`:

- Pertahankan fungsi musik, lirik, metric ring, dan shortcut.
- Ubah istilah “Dynamic Island” menjadi system status widget.
- Gunakan visual seperti modul Waybar/eww.
- Kurangi radius dan blur berlebihan.
- Gunakan border accent ketika widget aktif.
- Hindari tampilan yang terlalu menyerupai fitur iPhone.

### 3. Mendesain ulang window manager

File:

- `src/os/window-manager/WindowFrame.tsx`
- `src/os/window-manager/WindowManager.tsx`
- `src/os/window-manager/types.ts`

Perubahan window frame:

- Hapus traffic light merah, kuning, hijau.
- Gunakan title bar Linux:
  - ikon aplikasi
  - judul aplikasi
  - tag `floating` atau `fullscreen`
  - tombol minimize, maximize, close di sisi kanan
- Gunakan simbol kontrol yang lebih netral:
  - `—`
  - `□`
  - `×`
- Window aktif:
  - border 1px menggunakan accent
  - shadow tipis
  - opacity penuh
- Window tidak aktif:
  - border lebih redup
  - opacity sedikit lebih rendah
  - tanpa glow besar
- Radius window sekitar `6px–8px`.
- Double click title bar tetap dapat digunakan untuk maximize.
- Drag, resize, z-index, minimize, dan close tetap dipertahankan.

Pastikan seluruh `data-testid` yang dipakai oleh Playwright tetap sama.

### 4. Mendesain ulang dock menjadi launcher/taskbar Linux

File:

- `src/os/dock/Dock.tsx`

Perubahan:

- Hilangkan efek magnification ala macOS.
- Gunakan launcher/taskbar horizontal yang lebih padat.
- Posisi dapat tetap di bawah agar tidak mengubah layout secara drastis.
- Ikon aplikasi:
  - ukuran konsisten
  - background panel solid/transparan tipis
  - active state menggunakan accent underline atau border
- Indikator aplikasi berjalan menggunakan garis atau titik accent kecil.
- Tooltip tetap dipertahankan tetapi dengan gaya panel kecil.
- Tombol lock menggunakan gaya status action Linux.
- Animasi cukup berupa opacity, translate kecil, atau scale ringan.

### 5. Mendesain ulang boot, lockscreen, dan welcome screen

File:

- `src/os/boot/BootScreen.tsx`
- `src/os/lock/LockScreen.tsx`
- `src/os/welcome/WelcomeScreen.tsx`

#### Boot screen

Gunakan suasana boot Linux:

- Logo kecil dan sederhana.
- Status seperti:
  - `initializing session`
  - `loading assets`
  - `starting desktop`
- Progress bar tipis, bukan rounded besar.
- Font monospace untuk status.
- Background gelap tanpa gradient terang.

#### Lockscreen

Gunakan konsep Hyprlock:

- Wallpaper gelap dengan overlay.
- Jam besar tetapi tidak bergaya iOS.
- Username dan role ditampilkan sebagai metadata.
- Tombol unlock berbentuk rectangular panel.
- Tampilkan hint keyboard seperti `press Enter to start session`.
- Focus state harus terlihat jelas.
- Interaksi klik dan Enter tetap sama.

#### Welcome screen

Ubah menjadi session startup:

- Teks utama tetap bilingual melalui `useT`.
- Gunakan panel dengan border accent.
- Tampilkan status seperti:
  - `session initialized`
  - `welcome, Satria Ramadhan`
- Transisi tetap mendukung `prefers-reduced-motion`.

### 6. Menyesuaikan aplikasi internal

#### Terminal

File:

- `src/apps/terminal/TerminalApp.tsx`

Perubahan:

- Pertahankan struktur terminal saat ini.
- Gunakan background `--linux-bg`.
- Gunakan warna prompt berdasarkan accent atau success.
- Tambahkan header terminal minimal dengan status session.
- Gunakan selection color accent.
- Hindari warna biru hardcoded jika tidak diperlukan.

#### Settings

File:

- `src/apps/settings/SettingsApp.tsx`

Perubahan:

- Pertahankan sidebar, tetapi ubah menjadi control center Linux.
- Gunakan navigation item berbentuk rectangular.
- Section aktif memiliki border kiri atau accent bar.
- Wallpaper preview dibuat lebih sederhana.
- Accent selector memakai nama warna dan preview ringkas.
- Card About dibuat sebagai panel informasi sistem.
- Gunakan istilah seperti `Appearance`, `System Accent`, `Session`, dan `Profile`.
- Semua label tetap memakai i18n.

#### Music

File:

- `src/apps/music/MusicApp.tsx`

Perubahan:

- Hapus label “Apple Music”.
- Ganti dengan nama aplikasi generik seperti `Music Player`.
- Sidebar dan player bar mengikuti panel Linux.
- Gunakan accent sistem, bukan warna merah sebagai default.
- Track list memakai row yang lebih padat.
- Kontrol media memiliki border dan hover state sederhana.
- Lyrics tetap dipertahankan dengan fokus pada keterbacaan.

#### Calendar

File:

- `src/apps/calendar/CalendarApp.tsx`

Perubahan:

- Gunakan grid dengan border tipis dan warna surface.
- Tandai tanggal proyek menggunakan accent.
- Project detail dibuat sebagai side panel Linux.
- Hover, focus, click, dan bottom sheet mobile tetap dipertahankan.
- Kurangi rounded card dan shadow.

#### Message

File:

- `src/apps/message/MessageApp.tsx`

Perubahan:

- Hapus istilah “iMessage Style”.
- Gunakan tampilan chat terminal/desktop messenger Linux.
- Bubble user dan assistant tetap dibedakan dengan warna surface dan accent.
- Header menampilkan status koneksi dan model secara ringkas.
- Suggested prompt tetap dipertahankan.
- Streaming, retry, stop, session storage, dan markdown tetap dipertahankan.

### 7. Menyesuaikan mobile layout

File:

- `src/os/mobile/MobileRoot.tsx`

Mobile tetap responsif, tetapi menggunakan token dan visual Linux yang sama.

Perubahan:

- Kurangi elemen iOS seperti Dynamic Island, home indicator besar, dan dock berbentuk iOS.
- Gunakan status bar minimal berbasis panel.
- Grid aplikasi menggunakan tile gelap dengan border tipis.
- Mobile app header menggunakan gaya window Linux.
- Tombol close dibuat sebagai kontrol window biasa.
- Banner desktop tetap ada, tetapi memakai panel kecil dan tidak terlalu rounded.
- Fullscreen app tetap dipertahankan agar fungsi mobile tidak berubah.

### 8. Konsistensi state dan accessibility

File yang terkait:

- `src/lib/stores/settings-store.ts`
- `src/lib/stores/window-store.ts`
- seluruh komponen UI

Checklist:

- Accent color tersimpan dan diterapkan setelah reload.
- Window state tetap tersimpan.
- Focus keyboard terlihat pada workspace, dock, window controls, settings navigation, terminal input, dan chat input.
- Semua tombol icon memiliki `aria-label`.
- Kontras teks utama memenuhi standar keterbacaan.
- `prefers-reduced-motion` tetap didukung.
- Semua hover state memiliki alternatif focus state.

## Urutan Pengerjaan

1. Audit visual dan daftar hardcoded color.
2. Tambahkan token desain Linux di `globals.css`.
3. Restyle desktop background dan top bar.
4. Restyle `WindowFrame`.
5. Restyle Dock.
6. Restyle boot, lockscreen, dan welcome screen.
7. Restyle `IslandView`.
8. Restyle Terminal, Settings, Music, Calendar, dan Message.
9. Restyle mobile layout.
10. Jalankan audit responsive dan accessibility.
11. Jalankan seluruh test dan build.

## File Utama yang Diperkirakan Berubah

- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/os/desktop/DesktopScreen.tsx`
- `src/os/dock/Dock.tsx`
- `src/os/window-manager/WindowFrame.tsx`
- `src/os/window-manager/WindowManager.tsx`
- `src/os/boot/BootScreen.tsx`
- `src/os/lock/LockScreen.tsx`
- `src/os/welcome/WelcomeScreen.tsx`
- `src/os/mobile/MobileRoot.tsx`
- `src/notch/IslandView.tsx`
- `src/apps/terminal/TerminalApp.tsx`
- `src/apps/settings/SettingsApp.tsx`
- `src/apps/music/MusicApp.tsx`
- `src/apps/calendar/CalendarApp.tsx`
- `src/apps/message/MessageApp.tsx`
- `src/lib/stores/settings-store.ts`

## Validasi

Jalankan dari root proyek:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

Atau jalankan seluruh pemeriksaan:

```bash
npm run check
```

Validasi manual:

- Desktop 1440×900.
- Desktop 1024×768.
- Mobile 390×844.
- Boot → lockscreen → welcome → desktop.
- Membuka, memindahkan, resize, minimize, maximize, dan close window.
- Mengubah accent color.
- Mengubah wallpaper.
- Membuka Terminal, Music, Settings, Calendar, dan Message.
- Mengunci desktop kembali.
- Memeriksa tampilan dengan `prefers-reduced-motion`.
- Memastikan tidak ada elemen traffic light macOS atau visual iOS yang dominan.

## Definition of Done

- [ ] Seluruh desktop shell menggunakan dark Linux/Hyprland visual language.
- [ ] Top bar terlihat seperti panel Waybar modular.
- [ ] Window tidak lagi menggunakan traffic light macOS.
- [ ] Dock berubah menjadi launcher/taskbar bergaya Linux.
- [ ] Boot dan lockscreen memiliki nuansa Hyprlock.
- [ ] Terminal, Settings, Music, Calendar, dan Message konsisten secara visual.
- [ ] `IslandView` tetap berfungsi tetapi tampil sebagai system status widget.
- [ ] Mobile menggunakan token dan gaya Linux yang sama.
- [ ] Tidak ada perubahan pada fungsi utama aplikasi.
- [ ] Fokus keyboard dan kontras warna telah diaudit.
- [ ] `npm run check` lulus.
- [ ] Test Playwright desktop dan mobile tetap lulus.

---

[← Sebelumnya](./16-task-polish-deploy.md) · [↑ Kembali ke Overview](./00-overview.md)
