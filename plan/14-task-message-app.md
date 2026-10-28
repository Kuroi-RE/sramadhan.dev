# Task 14: Aplikasi Message

[↑ Kembali ke Overview](./00-overview.md)

## Objective

UI chat bergaya iMessage yang terhubung ke `/api/chat`.

## Dependencies

- [Task 5: Window manager dan dock](./05-task-window-manager-dock.md)
- [Task 13: Backend chatbot (RAG dan rules)](./13-task-chatbot-backend.md)

## Implementation Guidance

- Layout bergaya iMessage:
  - Daftar percakapan dengan satu thread "Satria's Assistant".
  - Bubble chat (pengguna di kanan dengan warna accent, asisten di kiri).
  - Indikator mengetik saat menunggu token pertama.
- Teks jawaban di-render bertahap dari stream dengan `react-markdown` + `remark-gfm` (sanitized, tanpa raw HTML). Link eksternal memakai `rel="noopener noreferrer"`.
- Tombol suggested prompts (bilingual) untuk memulai percakapan.
- Tombol stop untuk membatalkan stream (AbortController).
- Tombol retry saat terjadi error.
- Riwayat percakapan disimpan di `sessionStorage`.
- Batas input sesuai validasi backend (2.000 karakter) ditampilkan di UI.

## Test Requirements

- RTL dengan stream yang di-mock: teks muncul bertahap.
- RTL: error dari `/api/chat` menampilkan tombol retry, dan retry mengirim ulang pesan.
- RTL: klik suggested prompt mengirim pesan.
- RTL: tombol stop menghentikan stream.

## Demo

Bertanya "Project apa saja yang pernah dibuat Satria?" mendapat jawaban dari knowledge base.

## Definition of Done

- [ ] Layout iMessage dengan thread "Satria's Assistant", bubble, dan indikator mengetik
- [ ] Render markdown bertahap dari stream (sanitized)
- [ ] Suggested prompts bilingual
- [ ] Tombol stop dan retry
- [ ] Riwayat tersimpan di `sessionStorage`
- [ ] Batas karakter input ditampilkan
- [ ] Test RTL Message lulus
- [ ] `npm run check` lulus

---

[← Sebelumnya](./13-task-chatbot-backend.md) · [Berikutnya →](./15-task-mobile-ios.md)
