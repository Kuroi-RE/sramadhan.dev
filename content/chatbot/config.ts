export interface AssistantProfile {
  id: "portfolio" | "general";
  name: string;
  channel: string;
  badge: string;
  description: { id: string; en: string };
  initialMessage: { id: string; en: string };
  maxTokens: number;
  useRAG: boolean;
  systemPrompt: string;
}

export const ASSISTANT_PROFILES: AssistantProfile[] = [
  {
    id: "portfolio",
    name: "Satria's Assistant",
    channel: "#portfolio-assistant",
    badge: "RAG • Official",
    description: {
      id: "Asisten resmi profil & portofolio Satria",
      en: "Official assistant for Satria's background & work",
    },
    initialMessage: {
      id: "Halo! Saya asisten virtual resmi Satria Ramadhan. Tanyakan apa saja mengenai profil, keahlian, pengalaman, atau proyek-proyeknya!",
      en: "Hello! I am Satria Ramadhan's official virtual assistant. Ask me anything about his profile, skills, background, or projects!",
    },
    maxTokens: 800,
    useRAG: true,
    systemPrompt: "", // Will use rules.md + knowledge base RAG
  },
  {
    id: "general",
    name: "General AI (Direct)",
    channel: "#general-ai",
    badge: "Direct • 500 Tokens",
    description: {
      id: "Tanya jawab topik umum, coding, & teknis",
      en: "General technical, coding, & knowledge Q&A",
    },
    initialMessage: {
      id: "Halo! Saya adalah General AI Assistant. Saya siap menjawab pertanyaan umum, coding, sains, dan teknologi secara langsung dan ringkas.",
      en: "Hello! I am the General AI Assistant. Ask me anything about coding, technology, science, or general topics.",
    },
    maxTokens: 500, // Enforced token budget
    useRAG: false,
    systemPrompt:
      "You are a helpful, direct, concise, and knowledgeable AI assistant. You answer all user questions accurately, objectively, and comprehensively across coding, tech, sciences, and general domains. Keep answers crisp and bounded within the token limit.",
  },
];

export const chatbotConfig = {
  defaultModel: "combo",
  temperature: 0.3,
  topK: 4,
  maxContextChars: 4000,
  maxTokens: 800,
  maxMessageHistory: 20,
  maxMessageLength: 2000,
};
