# Task 13: Backend chatbot (RAG dan rules)

[↑ Kembali ke Overview](./00-overview.md)

## Objective

`/api/chat` yang aman dan mendukung streaming.

## Dependencies

- [Task 2: Lapisan konten dan i18n](./02-task-content-i18n.md)

## Implementation Guidance

- Knowledge base:
  - `scripts/build-knowledge.mjs` memecah `content/*` (profil, projects, sosial) dan `content/chatbot/knowledge/*.md` menjadi chunk.
  - Chunk diindeks dengan MiniSearch (BM25) lalu diserialisasi ke `knowledge-index.json`.
  - Script dijalankan di `predev` dan `prebuild`. File hasil generate masuk `.gitignore`.
- Rules (`content/chatbot/rules.md`):
  - Persona: asisten Satria Ramadhan.
  - Cakupan topik: profil, skill, project, dan kontak.
  - Menjawab dalam bahasa yang dipakai pengguna (ID/EN).
  - Menolak topik di luar cakupan dengan sopan.
  - Tidak mengarang. Jika data tidak ada di konteks, arahkan ke kontak/sosial Satria.
- Config (`content/chatbot/config.ts`): model fallback, temperature, topK, maxContextChars, dan maxTokens.
- Route Handler `src/app/api/chat/route.ts`:
  - Validasi body dengan zod: maksimal 20 pesan, 2.000 karakter per pesan, role hanya `user`/`assistant`.
  - Rate limit sederhana per IP (best-effort, bisa diganti Upstash nanti).
  - Ambil top-K chunk berdasarkan pesan terakhir pengguna, potong sesuai `maxContextChars`.
  - Susun system prompt (rules + context).
  - POST ke `{CHAT_API_BASE_URL}/v1/chat/completions` dengan `Authorization: Bearer ${CHAT_API_KEY}`, model dari `CHAT_MODEL`, dan `max_tokens` dari config.
  - Stream SSE dari upstream diteruskan ke client. Kalau `CHAT_STREAM=false`, pakai respons JSON biasa.
  - Timeout (AbortController) dan error upstream dipetakan ke pesan aman tanpa membocorkan detail upstream atau key.

## Test Requirements

- Unit test retrieval: pertanyaan tentang project X mengembalikan chunk project X.
- Unit test prompt builder: rules dan konteks tersusun benar dan dipotong sesuai `maxContextChars`.
- Route di-test dengan upstream yang di-mock:
  - Streaming diteruskan dengan benar.
  - Upstream 401 menghasilkan error yang aman.
  - Timeout menghasilkan error yang aman.
  - Input terlalu panjang atau terlalu banyak pesan menghasilkan 400.
  - Rate limit terlampaui menghasilkan 429.
- Test memastikan `CHAT_API_KEY` tidak pernah muncul di response.

## Demo

`curl` ke `/api/chat` mengembalikan jawaban streaming berdasarkan konten.

## Definition of Done

- [ ] `scripts/build-knowledge.mjs` menghasilkan `knowledge-index.json` di `predev`/`prebuild`
- [ ] `content/chatbot/rules.md` dan `content/chatbot/config.ts` tersedia
- [ ] Route `/api/chat` dengan validasi zod dan rate limit
- [ ] Retrieval BM25 top-K dan prompt builder
- [ ] Proxy ke `{CHAT_API_BASE_URL}/v1/chat/completions` dengan key server-only
- [ ] Streaming SSE dan mode non-stream (`CHAT_STREAM=false`)
- [ ] Timeout dan error upstream dipetakan ke pesan aman
- [ ] Test retrieval, prompt builder, dan route lulus
- [ ] `npm run check` lulus

---

[← Sebelumnya](./12-task-notch-piopio.md) · [Berikutnya →](./14-task-message-app.md)
