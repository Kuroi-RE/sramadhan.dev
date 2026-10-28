import fs from "node:fs/promises";
import path from "node:path";
import MiniSearch from "minisearch";

export async function buildKnowledgeIndex(options = {}) {
  const rootDir = options.rootDir || process.cwd();
  const contentDir = options.contentDir || path.join(rootDir, "content");
  const knowledgeDir =
    options.knowledgeDir || path.join(contentDir, "chatbot", "knowledge");
  const outDir = options.outDir || path.join(rootDir, "src", "generated");

  await fs.mkdir(outDir, { recursive: true });

  const documents = [];
  let docId = 1;

  // 1. Process Markdown files in knowledge/
  try {
    await fs.mkdir(knowledgeDir, { recursive: true });
    const files = await fs.readdir(knowledgeDir);

    for (const file of files) {
      if (file.endsWith(".md")) {
        const filePath = path.join(knowledgeDir, file);
        const text = await fs.readFile(filePath, "utf8");

        // Split markdown by major headings (## or #) into chunks
        const sections = text.split(/(?=^##?\s+)/m);
        for (const sec of sections) {
          const trimmed = sec.trim();
          if (!trimmed) continue;

          const titleMatch = trimmed.match(/^##?\s+(.+)$/m);
          const title = titleMatch
            ? titleMatch[1].trim()
            : path.basename(file, ".md");

          documents.push({
            id: `doc_${docId++}`,
            title: `${path.basename(file, ".md")} - ${title}`,
            content: trimmed,
          });
        }
      }
    }
  } catch (err) {
    console.warn("Notice: could not read knowledge directory", err.message);
  }

  // 2. Add Profile chunk
  documents.push({
    id: `doc_${docId++}`,
    title: "Satria Ramadhan Profile & Bio",
    content:
      "Nama: Satria Ramadhan. Role: Software Engineer. Fokus: modern web architectures, interactive user interfaces, and TypeScript-based systems. GitHub: sramadhan.",
  });

  // 3. Add Socials chunk
  documents.push({
    id: `doc_${docId++}`,
    title: "Kontak & Tautan Sosial Satria Ramadhan",
    content:
      "LinkedIn: https://linkedin.com/in/sramadhan, Instagram: https://instagram.com/sramadhan, Threads: https://threads.net/@sramadhan, GitHub: https://github.com/sramadhan.",
  });

  // 4. Add Projects chunk
  documents.push({
    id: `doc_${docId++}`,
    title: "Proyek Portofolio Satria Ramadhan",
    content:
      "Proyek: PioPio Notch (Dynamic Island desktop dengan visualisator musik dan lirik Better Lyrics). Proyek: sramadhan.cv (Portfolio bergaya OS desktop lengkap dengan Audio Player, Terminal, Kalender, dan AI Assistant).",
  });

  // Build MiniSearch
  const miniSearch = new MiniSearch({
    fields: ["title", "content"],
    storeFields: ["id", "title", "content"],
    searchOptions: {
      boost: { title: 2 },
      prefix: true,
      fuzzy: 0.2,
    },
  });

  miniSearch.addAll(documents);

  const indexJson = JSON.stringify(miniSearch.toJSON(), null, 2);
  const outPath = path.join(outDir, "knowledge-index.json");
  await fs.writeFile(outPath, indexJson, "utf8");

  console.log(
    `✓ Knowledge index built with ${documents.length} chunks into ${outPath}`
  );
  return { documents, indexJson };
}

// CLI invocation check
const isMainModule =
  process.argv[1] &&
  path.resolve(process.argv[1]) ===
    path.resolve(
      new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/i, "$1")
    );
if (isMainModule || process.argv[1]?.endsWith("build-knowledge.mjs")) {
  buildKnowledgeIndex().catch((err) => {
    console.error("Failed to build knowledge index:", err);
    process.exit(1);
  });
}
