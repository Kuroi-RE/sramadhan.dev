"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSettingsStore } from "@/lib/stores/settings-store";
import {
  ASSISTANT_PROFILES,
  AssistantProfile,
} from "../../../content/chatbot/config";
import {
  Send,
  Square,
  RefreshCw,
  Sparkles,
  Bot,
  User,
  AlertCircle,
  Cpu,
  Zap,
  Image as ImageIcon,
  X,
} from "lucide-react";

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  tokensPerSecond?: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  images?: string[];
  usage?: TokenUsage;
}

async function processImageFile(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Berkas harus berupa gambar.");
  }
  if (file.size > 15 * 1024 * 1024) {
    throw new Error("Ukuran berkas gambar maksimal 15MB.");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Gagal membaca berkas gambar."));
    reader.onload = () => {
      const result = reader.result as string;
      if (file.type === "image/svg+xml" || file.size < 600 * 1024) {
        return resolve(result);
      }

      // Resize large images via Canvas to conserve bandwidth and context
      if (typeof window === "undefined" || !window.document) {
        return resolve(result);
      }

      const img = new Image();
      img.onerror = () => resolve(result);
      img.onload = () => {
        const MAX_DIM = 1600;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(result);

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
}

const SUGGESTED_PROMPTS: Record<
  "portfolio" | "general",
  Record<"id" | "en", string[]>
> = {
  portfolio: {
    id: [
      "Apa saja proyek yang pernah dibuat Satria?",
      "Teknologi dan keahlian apa yang dikuasai Satria?",
      "Bagaimana cara menghubungi Satria?",
    ],
    en: [
      "What projects has Satria built?",
      "What are Satria's core technical skills?",
      "How can I contact or collaborate with Satria?",
    ],
  },
  general: {
    id: [
      "Jelaskan konsep arsitektur microservices secara ringkas.",
      "Bagaimana cara mengoptimasi performa aplikasi React?",
      "Tuliskan fungsi debounce sederhana dalam TypeScript.",
    ],
    en: [
      "Explain microservices architecture in brief.",
      "How do I optimize React application performance?",
      "Write a concise debounce function in TypeScript.",
    ],
  },
};

const STORAGE_PREFIX = "sramadhan_chat_history_";

export function MessageApp() {
  const locale = useSettingsStore((state) => state.locale);
  const accentColor = useSettingsStore((state) => state.accentColor);

  const [activeAssistantId, setActiveAssistantId] = useState<
    "portfolio" | "general"
  >("portfolio");
  const activeProfile =
    ASSISTANT_PROFILES.find((p) => p.id === activeAssistantId) ||
    ASSISTANT_PROFILES[0];

  const getInitialMessages = (assistant: AssistantProfile): ChatMessage[] => {
    return [
      {
        id: `init_${assistant.id}`,
        role: "assistant",
        content:
          locale === "id"
            ? assistant.initialMessage.id
            : assistant.initialMessage.en,
      },
    ];
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem(`${STORAGE_PREFIX}portfolio`);
        if (saved) return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return getInitialMessages(ASSISTANT_PROFILES[0]);
  });

  const [inputVal, setInputVal] = useState("");
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  // Sync current channel to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(
        `${STORAGE_PREFIX}${activeAssistantId}`,
        JSON.stringify(messages)
      );
    } catch {
      // ignore
    }
  }, [messages, activeAssistantId]);

  const handleSelectAssistant = (assistant: AssistantProfile) => {
    if (assistant.id === activeAssistantId) return;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
    setHasError(false);
    setInputVal("");
    setPendingImages([]);
    setActiveAssistantId(assistant.id);

    try {
      const saved = sessionStorage.getItem(`${STORAGE_PREFIX}${assistant.id}`);
      if (saved) {
        setMessages(JSON.parse(saved));
        return;
      }
    } catch {
      // fallback
    }
    setMessages(getInitialMessages(assistant));
  };

  const handleAddImageFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (fileArray.length === 0) return;

    for (const file of fileArray) {
      if (pendingImages.length >= 4) break;
      try {
        const b64 = await processImageFile(file);
        setPendingImages((prev) => {
          if (prev.length >= 4) return prev;
          return [...prev, b64];
        });
      } catch (err) {
        console.error("Error loading image:", err);
      }
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setPendingImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData?.items || []);
    const imageFiles: File[] = [];
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) imageFiles.push(file);
      }
    }
    if (imageFiles.length > 0) {
      e.preventDefault();
      await handleAddImageFiles(imageFiles);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragging(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleAddImageFiles(e.dataTransfer.files);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : inputVal).trim();
    const imagesToSend = textToSend !== undefined ? [] : [...pendingImages];
    if ((!text && imagesToSend.length === 0) || isLoading) return;

    if (text.length > 2000) return;

    setInputVal("");
    setPendingImages([]);
    setHasError(false);

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      content: text,
      images: imagesToSend.length > 0 ? imagesToSend : undefined,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    const assistantMsgId = `asst_${Date.now()}`;
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const apiMessages = newMessages
        .filter((m) => !m.id.startsWith("init"))
        .slice(-20)
        .map(({ role, content, images }) => ({
          role,
          content,
          ...(images && images.length > 0 ? { images } : {}),
        }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assistantId: activeAssistantId,
          messages: apiMessages,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      // Check if streaming
      const contentType = res.headers.get("Content-Type") || "";
      if (contentType.includes("text/event-stream") && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let accumulated = "";
        let currentUsage: TokenUsage | undefined = undefined;

        // Add placeholder assistant message
        setMessages((prev) => [
          ...prev,
          { id: assistantMsgId, role: "assistant", content: "" },
        ]);

        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;
              const payload = trimmed.replace(/^data:\s*/, "");
              if (payload === "[DONE]") {
                done = true;
                break;
              }

              try {
                const parsed = JSON.parse(payload);
                const delta = parsed.choices?.[0]?.delta?.content || "";
                accumulated += delta;

                if (parsed.usage) {
                  const u = parsed.usage;
                  currentUsage = {
                    promptTokens: u.prompt_tokens ?? u.promptTokens ?? 0,
                    completionTokens:
                      u.completion_tokens ?? u.completionTokens ?? 0,
                    totalTokens: u.total_tokens ?? u.totalTokens ?? 0,
                    tokensPerSecond: u.tokens_per_second ?? u.tokensPerSecond,
                  };
                }

                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId
                      ? {
                          ...m,
                          content: accumulated,
                          ...(currentUsage ? { usage: currentUsage } : {}),
                        }
                      : m
                  )
                );
              } catch {
                // partial line or parsing skipped
              }
            }
          }
        }
      } else {
        // Non-streaming response
        const data = await res.json();
        const reply =
          data.choices?.[0]?.message?.content || "Tidak ada jawaban.";
        let usage: TokenUsage | undefined = undefined;
        if (data.usage) {
          const u = data.usage;
          usage = {
            promptTokens: u.prompt_tokens ?? u.promptTokens ?? 0,
            completionTokens: u.completion_tokens ?? u.completionTokens ?? 0,
            totalTokens: u.total_tokens ?? u.totalTokens ?? 0,
            tokensPerSecond: u.tokens_per_second ?? u.tokensPerSecond,
          };
        }

        setMessages((prev) => [
          ...prev,
          { id: assistantMsgId, role: "assistant", content: reply, usage },
        ]);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        // User stopped intentionally
      } else {
        setHasError(true);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleRetry = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.content);
    }
  };

  const currentAssistantPrompts =
    SUGGESTED_PROMPTS[activeAssistantId] || SUGGESTED_PROMPTS.portfolio;
  const suggestedPrompts =
    currentAssistantPrompts[locale] || currentAssistantPrompts.id;

  const totalSessionTokens = messages.reduce(
    (sum, m) => sum + (m.usage?.totalTokens || 0),
    0
  );

  const placeholderText =
    activeAssistantId === "portfolio"
      ? locale === "id"
        ? "Tanyakan apa saja tentang Satria..."
        : "Ask anything about Satria..."
      : locale === "id"
        ? "Tanyakan pertanyaan coding, sains, atau topik umum (maks 500 token)..."
        : "Ask anything about coding, tech, or general topics (max 500 tokens)...";

  return (
    <div
      data-testid="message-app"
      className="flex h-full w-full select-none bg-[var(--linux-surface)] text-[var(--linux-text)] overflow-hidden"
    >
      {/* Linux Desktop Messenger Channel List */}
      <aside className="w-56 border-r border-[var(--linux-border)] bg-[var(--linux-bg)] p-2.5 flex flex-col gap-2 shrink-0">
        <div className="px-2 py-1.5 border-b border-[var(--linux-border)] flex items-center justify-between">
          <span className="linux-mono-label">Pesan // AI Channels</span>
          <span className="text-[10px] font-mono text-[var(--linux-accent)]">
            irc/ai
          </span>
        </div>

        <div className="space-y-1.5">
          {ASSISTANT_PROFILES.map((profile) => {
            const isSelected = profile.id === activeAssistantId;
            return (
              <button
                key={profile.id}
                type="button"
                data-testid={`channel-select-${profile.id}`}
                onClick={() => handleSelectAssistant(profile)}
                className={`w-full text-left flex items-center gap-2.5 p-2 rounded-md transition-colors border ${
                  isSelected
                    ? "bg-[var(--linux-surface-raised)] border-[var(--linux-accent)]"
                    : "bg-transparent border-transparent hover:bg-[var(--linux-surface-raised)]/60 text-[var(--linux-text-muted)] hover:text-[var(--linux-text)]"
                }`}
              >
                <div
                  className="relative flex h-8 w-8 items-center justify-center rounded-[4px] bg-[var(--linux-bg)] border border-[var(--linux-border-strong)] text-[var(--linux-accent)] font-mono font-bold text-xs shrink-0"
                  style={
                    isSelected
                      ? { borderColor: accentColor || "var(--linux-accent)" }
                      : {}
                  }
                >
                  {profile.id === "portfolio" ? (
                    <Bot className="h-4 w-4" />
                  ) : (
                    <Cpu className="h-4 w-4" />
                  )}
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ${
                      isSelected
                        ? "bg-[var(--linux-success)] ring-2 ring-[var(--linux-surface-raised)]"
                        : "bg-[var(--linux-text-subtle)]"
                    }`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-[var(--linux-text)] truncate">
                    {profile.name}
                  </div>
                  <div className="text-[10px] font-mono text-[var(--linux-text-muted)] truncate">
                    {profile.badge}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Chat Thread */}
      <main
        className="relative flex-1 flex flex-col h-full overflow-hidden bg-[var(--linux-surface)]"
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Drag and Drop Overlay */}
        {isDragging && (
          <div
            data-testid="chat-drop-overlay"
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[var(--linux-bg)]/90 backdrop-blur-sm border-2 border-dashed border-[var(--linux-accent)] rounded-lg pointer-events-none p-6 text-center select-none"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-[var(--linux-surface-raised)] border border-[var(--linux-accent)] text-[var(--linux-accent)] mb-3">
              <ImageIcon className="h-6 w-6 animate-pulse" />
            </div>
            <div className="text-xs font-mono font-bold text-[var(--linux-text)]">
              {locale === "id"
                ? "Lepaskan gambar untuk mengunggah"
                : "Drop images to upload"}
            </div>
            <div className="text-[10px] font-mono text-[var(--linux-text-subtle)] mt-1">
              JPG, PNG, WEBP, GIF, SVG (maksimal 4 gambar)
            </div>
          </div>
        )}

        {/* Thread Header */}
        <div className="h-11 border-b border-[var(--linux-border)] px-4 flex items-center justify-between shrink-0 bg-[var(--linux-bg)]">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--linux-success)]" />
            <span className="text-xs font-mono font-semibold text-[var(--linux-text)]">
              {activeProfile.channel} // {activeProfile.name}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            {totalSessionTokens > 0 && (
              <div
                data-testid="header-token-badge"
                className="flex items-center gap-1 text-[11px] font-mono text-[var(--linux-accent)] bg-[var(--linux-surface-raised)] px-2 py-0.5 rounded border border-[var(--linux-border)] tabular-nums"
                title={`Total token terpakai di sesi ini: ${totalSessionTokens.toLocaleString()}`}
              >
                <Zap className="h-3 w-3" />
                <span>{totalSessionTokens.toLocaleString()} tok</span>
              </div>
            )}
            <div className="text-[11px] text-[var(--linux-text-muted)] font-mono">
              Omniroute &bull; max {activeProfile.maxTokens} tok
            </div>
          </div>
        </div>

        {/* Message Bubble List */}
        <div
          data-testid="chat-messages"
          className="flex-1 overflow-y-auto p-4 space-y-3 select-text"
        >
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                data-testid={`chat-bubble-${msg.role}`}
                className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-[4px] bg-[var(--linux-surface-raised)] text-[var(--linux-accent)] shrink-0 mt-0.5 border border-[var(--linux-border)]">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}

                <div
                  className={`flex flex-col max-w-[80%] ${
                    isUser ? "items-end" : "items-start"
                  }`}
                >
                  {/* Images preview in message bubble */}
                  {msg.images && msg.images.length > 0 && (
                    <div
                      data-testid="chat-message-images"
                      className="flex flex-wrap gap-2 mb-1.5"
                    >
                      {msg.images.map((imgSrc, imgIdx) => (
                        <a
                          key={imgIdx}
                          href={imgSrc}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative block rounded border border-[var(--linux-border)] overflow-hidden bg-[var(--linux-surface-raised)] hover:border-[var(--linux-accent)] transition-all max-w-[220px] max-h-[160px]"
                          title="Buka ukuran penuh"
                        >
                          <img
                            src={imgSrc}
                            alt={`Lampiran ${imgIdx + 1}`}
                            className="object-cover max-h-[160px] w-auto"
                          />
                        </a>
                      ))}
                    </div>
                  )}

                  {msg.content && (
                    <div
                      className={`w-full rounded-md px-3.5 py-2.5 text-xs leading-relaxed border ${
                        isUser
                          ? "bg-[var(--linux-surface-raised)] text-[var(--linux-text)]"
                          : "bg-[var(--linux-bg)] text-[var(--linux-text)] border-[var(--linux-border)]"
                      }`}
                      style={
                        isUser
                          ? {
                              borderColor: accentColor || "var(--linux-accent)",
                            }
                          : {}
                      }
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({ href, children }) => (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline text-[var(--linux-accent)] hover:text-[var(--linux-text)]"
                            >
                              {children}
                            </a>
                          ),
                          p: ({ children }) => (
                            <p className="mb-1 last:mb-0">{children}</p>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc pl-4 my-1 space-y-0.5">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal pl-4 my-1 space-y-0.5">
                              {children}
                            </ol>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-bold text-[var(--linux-text)]">
                              {children}
                            </strong>
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}

                  {!isUser && msg.usage && (
                    <div
                      data-testid="token-usage-badge"
                      className="mt-1 flex items-center gap-1.5 font-mono text-[10px] text-[var(--linux-text-subtle)] tabular-nums px-1"
                    >
                      <Zap className="h-2.5 w-2.5 text-[var(--linux-accent)] shrink-0" />
                      <span>
                        {msg.usage.totalTokens.toLocaleString()} tokens
                        {" ("}
                        {msg.usage.promptTokens.toLocaleString()} in &bull;{" "}
                        {msg.usage.completionTokens.toLocaleString()} out
                        {")"}
                      </span>
                      {typeof msg.usage.tokensPerSecond === "number" && (
                        <>
                          <span>&bull;</span>
                          <span>
                            {msg.usage.tokensPerSecond.toFixed(1)} tok/s
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-[4px] bg-[var(--linux-surface-raised)] border border-[var(--linux-border)] text-[var(--linux-text-muted)] shrink-0 mt-0.5">
                    <User className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div
              data-testid="typing-indicator"
              className="flex items-center gap-2 pl-8"
            >
              <div className="flex items-center gap-1.5 bg-[var(--linux-bg)] px-3 py-1.5 rounded-md border border-[var(--linux-border)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--linux-accent)] animate-bounce" />
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--linux-accent)] animate-bounce [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--linux-accent)] animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          {/* Error Banner with Retry */}
          {hasError && (
            <div
              data-testid="chat-error-banner"
              className="flex items-center justify-between p-3 rounded-md bg-[var(--linux-bg)] border border-[var(--linux-danger)]/50 text-xs text-[var(--linux-danger)]"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-[var(--linux-danger)] shrink-0" />
                <span>Gagal mendapatkan respon dari asisten.</span>
              </div>
              <button
                type="button"
                data-testid="chat-retry-btn"
                onClick={handleRetry}
                className="flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-[var(--linux-surface-raised)] hover:bg-[var(--linux-surface-hover)] border border-[var(--linux-danger)]/50 text-[var(--linux-text)] font-mono text-[11px] transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Coba Lagi</span>
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts */}
        {messages.length <= 2 && (
          <div
            data-testid="suggested-prompts"
            className="px-4 py-2 flex flex-wrap gap-1.5 shrink-0"
          >
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                data-testid="suggested-prompt-btn"
                onClick={() => handleSendMessage(prompt)}
                className="linux-focus-ring flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] border border-[var(--linux-border)] bg-[var(--linux-bg)] hover:bg-[var(--linux-surface-hover)] hover:border-[var(--linux-accent)]/50 text-[11px] font-mono text-[var(--linux-text-muted)] hover:text-[var(--linux-text)] transition-colors"
              >
                <Sparkles className="h-3 w-3 text-[var(--linux-accent)]" />
                <span>{prompt}</span>
              </button>
            ))}
          </div>
        )}

        {/* Input Form Bar */}
        <div className="p-3 border-t border-[var(--linux-border)] bg-[var(--linux-bg)] shrink-0">
          {/* Pending Images Tray */}
          {pendingImages.length > 0 && (
            <div
              data-testid="chat-pending-images"
              className="mb-2.5 flex items-center gap-2 overflow-x-auto py-1"
            >
              {pendingImages.map((imgSrc, idx) => (
                <div
                  key={idx}
                  data-testid="pending-image-thumb"
                  className="relative group h-14 w-14 shrink-0 rounded-[4px] border border-[var(--linux-border)] bg-[var(--linux-surface-raised)] overflow-hidden"
                >
                  <img
                    src={imgSrc}
                    alt={`Preview ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    data-testid={`remove-image-${idx}`}
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-black/75 hover:bg-[var(--linux-danger)] text-white flex items-center justify-center transition-colors"
                    title="Hapus gambar"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              ))}
              <div className="text-[10px] font-mono text-[var(--linux-text-subtle)] pl-1">
                {pendingImages.length} / 4 gambar terlampir
              </div>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            onPaste={handlePaste}
            className="flex items-center gap-2"
          >
            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              data-testid="chat-file-input"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  handleAddImageFiles(e.target.files);
                  e.target.value = "";
                }
              }}
            />

            {/* Upload image button */}
            <button
              type="button"
              data-testid="chat-upload-image-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || pendingImages.length >= 4}
              className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--linux-surface-raised)] border border-[var(--linux-border)] text-[var(--linux-text-muted)] hover:text-[var(--linux-text)] hover:border-[var(--linux-accent)] transition-colors disabled:opacity-40 shrink-0"
              title={
                locale === "id"
                  ? "Unggah gambar (drag, paste, atau klik)"
                  : "Upload image (drag, paste, or click)"
              }
            >
              <ImageIcon className="h-3.5 w-3.5" />
            </button>

            <input
              data-testid="chat-input"
              type="text"
              placeholder={
                pendingImages.length > 0
                  ? locale === "id"
                    ? "Ketik instruksi untuk gambar ini (opsional)..."
                    : "Add instructions for this image (optional)..."
                  : placeholderText
              }
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={isLoading}
              maxLength={2000}
              className="flex-1 bg-[var(--linux-surface)] border border-[var(--linux-border)] rounded-md px-3.5 py-2 text-xs text-[var(--linux-text)] placeholder-[var(--linux-text-subtle)] focus:outline-none focus:border-[var(--linux-accent)]"
            />

            {isLoading ? (
              <button
                type="button"
                data-testid="chat-stop-btn"
                onClick={handleStop}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--linux-surface-raised)] border border-[var(--linux-danger)] text-[var(--linux-danger)] hover:bg-[var(--linux-danger)] hover:text-[#080b10] transition-colors shrink-0"
                title="Stop streaming"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
              </button>
            ) : (
              <button
                type="submit"
                data-testid="chat-send-btn"
                disabled={!inputVal.trim() && pendingImages.length === 0}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--linux-surface-raised)] border border-[var(--linux-accent)] text-[var(--linux-accent)] hover:bg-[var(--linux-accent)] hover:text-[#080b10] transition-colors disabled:opacity-40 shrink-0"
                title="Send"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            )}
          </form>

          <div className="flex items-center justify-between px-1 pt-1.5 text-[10px] font-mono text-[var(--linux-text-subtle)]">
            <span>
              {locale === "id"
                ? "Dukungan teks & gambar (drag / paste)"
                : "Text & image support (drag / paste)"}
            </span>
            <span>{inputVal.length} / 2000</span>
          </div>
        </div>
      </main>
    </div>
  );
}
