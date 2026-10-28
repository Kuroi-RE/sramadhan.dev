# Task 7: Terminal (perintah lokal)

[↑ Kembali ke Overview](./00-overview.md)

## Objective

Terminal interaktif.

## Dependencies

- [Task 5: Window manager dan dock](./05-task-window-manager-dock.md)

## Implementation Guidance

- Buat command registry dengan bentuk `{ name, aliases, description (i18n), run(args, ctx) }`. Output perintah berupa React node.
- Implementasikan perintah:
  - `help`: menampilkan semua perintah beserta deskripsinya.
  - `about`: informasi Satria Ramadhan dari `content/profile.ts`.
  - `sosial` (alias `social`): link Threads, Instagram, dan LinkedIn dari `content/socials.ts`, dengan `rel="noopener noreferrer"`.
  - `clear`: membersihkan riwayat output.
- Riwayat perintah bisa dinavigasi dengan ↑/↓.
- Tab completion untuk nama perintah.
- Pesan yang jelas untuk perintah tidak dikenal (menyarankan `help`).
- Prompt `guest@sramadhan.cv:~$`.
- Perintah `github` dikerjakan di [Task 8](./08-task-github-api.md).

## Test Requirements

- Unit test parser perintah (spasi berlebih, argumen, alias).
- Unit test setiap perintah (`help`, `about`, `sosial`/`social`, `clear`, perintah tidak dikenal).
- RTL: `clear` mengosongkan output, ↑ mengulang perintah sebelumnya, Tab melengkapi nama perintah.

## Demo

Menjalankan setiap perintah di terminal.

## Definition of Done

- [ ] Command registry dengan deskripsi i18n
- [ ] Perintah `help`, `about`, `sosial` (alias `social`), dan `clear`
- [ ] Riwayat ↑/↓ dan tab completion
- [ ] Pesan untuk perintah tidak dikenal
- [ ] Prompt `guest@sramadhan.cv:~$`
- [ ] Unit test dan RTL terminal lulus
- [ ] `npm run check` lulus

---

[← Sebelumnya](./06-task-settings.md) · [Berikutnya →](./08-task-github-api.md)
