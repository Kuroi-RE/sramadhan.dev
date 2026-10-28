import MiniSearch from "minisearch";
import fallbackKnowledgeIndex from "../generated/knowledge-index.json";
import { chatbotConfig } from "../../content/chatbot/config";

let miniSearchInstance: MiniSearch | null = null;

export function getMiniSearch(): MiniSearch {
  if (!miniSearchInstance) {
    miniSearchInstance = MiniSearch.loadJSON(
      JSON.stringify(fallbackKnowledgeIndex),
      {
        fields: ["title", "content"],
        storeFields: ["id", "title", "content"],
        searchOptions: {
          boost: { title: 2 },
          prefix: true,
          fuzzy: 0.2,
        },
      }
    );
  }
  return miniSearchInstance;
}

export function searchKnowledge(
  query: string,
  topK = chatbotConfig.topK,
  maxContextChars = chatbotConfig.maxContextChars
): string {
  if (!query || !query.trim()) return "";

  const searcher = getMiniSearch();
  const results = searcher.search(query);

  const selectedChunks: string[] = [];
  let totalChars = 0;

  for (const item of results.slice(0, topK)) {
    const chunkText = `[${item.title}]\n${item.content}`;
    if (totalChars + chunkText.length > maxContextChars) {
      const remainingChars = maxContextChars - totalChars;
      if (remainingChars > 100) {
        selectedChunks.push(chunkText.slice(0, remainingChars) + "...");
      }
      break;
    }
    selectedChunks.push(chunkText);
    totalChars += chunkText.length;
  }

  return selectedChunks.join("\n\n---\n\n");
}

export function buildSystemPrompt(
  userQuery: string,
  rulesText: string
): string {
  const context = searchKnowledge(userQuery);

  return `${rulesText}

# KONTEKS KNOWLEDGE BASE RESMI:
${context || "(Tidak ada konteks spesifik yang ditemukan untuk kueri ini. Jawab berdasarkan rules umum.)"}
`.trim();
}
