export const id = {
  common: {
    close: "Tutup",
    minimize: "Kecilkan",
    maximize: "Perbesar",
    restore: "Pulihkan",
    loading: "Memuat...",
    save: "Simpan",
    cancel: "Batal",
  },
  system: {
    osName: "SatriaOS",
    booting: "Memulai sistem...",
    loadingAssets: "Memuat aset & komponen...",
    ready: "Sistem siap",
    unlockPrompt: "Masukkan kata sandi",
    unlockButton: "Buka",
    wrongPassword: "Kata sandi salah. Silakan coba lagi.",
    welcome: "Selamat datang, Satria Ramadhan",
    lock: "Kunci Layar",
    pressEnter: "Tekan Enter untuk membuka",
  },
  dock: {
    music: "Musik",
    settings: "Pengaturan",
    terminal: "Terminal",
    calendar: "Kalender",
    message: "Pesan",
    lock: "Kunci",
  },
  settings: {
    title: "Pengaturan",
    general: "Umum",
    appearance: "Tampilan",
    wallpaper: "Wallpaper",
    accentColor: "Warna Aksen",
    language: "Bahasa",
    languageSelect: "Pilih Bahasa",
    about: "Tentang",
    version: "Versi 1.0.0",
  },
  terminal: {
    title: "Terminal",
    welcome: "Ketik 'help' untuk daftar perintah yang tersedia.",
  },
  calendar: {
    title: "Kalender Proyek",
    viewProject: "Lihat Proyek",
    demo: "Demo",
    github: "GitHub",
  },
  music: {
    title: "Musik",
    nowPlaying: "Sedang Diputar",
    noTrack: "Tidak ada lagu yang dipilih",
  },
  message: {
    title: "Pesan & Tanya AI",
    placeholder: "Tanyakan apa saja tentang Satria...",
    send: "Kirim",
  },
};

export type TranslationKeys = typeof id;
