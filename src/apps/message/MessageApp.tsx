"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSettingsStore } from "@/lib/stores/settings-store";
import {
  Send,
  Square,
  RefreshCw,
  Sparkles,
  Bot,
  User,
  AlertCircle,
} from "lucide-react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_PROMPTS = {
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
};

const STORAGE_KEY = "sramadhan_chat_history";

export function MessageApp() {
  const locale = useSettingsStore((state) => state.locale);
  const accentColor = useSettingsStore((state) => state.accentColor);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [
      {
        id: "init",
        role: "assistant",
        content:
          locale === "id"
            ? "Halo! Saya adalah asisten virtual Satria Ramadhan. Tanyakan apa saja mengenai profil, keahlian, pengalaman, atau proyek-proyeknya!"
            : "Hello! I am Satria Ramadhan's virtual assistant. Ask me anything about his profile, skills, background, or projects!",
      },
    ];
  });

  const [inputVal, setInputVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text || isLoading) return;

    if (text.length > 2000) return;

    setInputVal("");
    setHasError(false);

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      content: text,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    const assistantMsgId = `asst_${Date.now()}`;
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const apiMessages = newMessages
        .filter((m) => m.id !== "init")
        .slice(-20)
        .map(({ role, content }) => ({ role, content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
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

                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId ? { ...m, content: accumulated } : m
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
        setMessages((prev) => [
          ...prev,
          { id: assistantMsgId, role: "assistant", content: reply },
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

  const suggestedPrompts = SUGGESTED_PROMPTS[locale] || SUGGESTED_PROMPTS.id;

  return (
    <div
      data-testid="message-app"
      className="flex h-full w-full select-none bg-[var(--linux-surface)] text-[var(--linux-text)] overflow-hidden"
    >
      {/* Linux Desktop Messenger Channel List */}
      <aside className="w-56 border-r border-[var(--linux-border)] bg-[var(--linux-bg)] p-2.5 flex flex-col shrink-0">
        <div className="px-2 py-1.5 border-b border-[var(--linux-border)] mb-2 flex items-center justify-between">
          <span className="linux-mono-label">Pesan</span>
          <span className="text-[10px] font-mono text-[var(--linux-accent)]">
            irc/ai
          </span>
        </div>

        <div className="flex items-center gap-2.5 p-2.5 rounded-md bg-[var(--linux-surface-raised)] border border-[var(--linux-accent)]/50 cursor-pointer">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-[4px] bg-[var(--linux-bg)] border border-[var(--linux-border-strong)] text-[var(--linux-accent)] font-mono font-bold text-xs">
            <Bot className="h-4 w-4" />
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-[var(--linux-success)] ring-2 ring-[var(--linux-surface-raised)]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-[var(--linux-text)] truncate">
              Satria&apos;s Assistant
            </div>
            <div className="text-[10px] font-mono text-[var(--linux-success)]">
              Online &bull; RAG Ready
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Thread */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--linux-surface)]">
        {/* Thread Header */}
        <div className="h-11 border-b border-[var(--linux-border)] px-4 flex items-center justify-between shrink-0 bg-[var(--linux-bg)]">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--linux-success)]" />
            <span className="text-xs font-mono font-semibold text-[var(--linux-text)]">
              #assistant — Satria&apos;s Assistant (AI)
            </span>
          </div>
          <div className="text-[11px] text-[var(--linux-text-muted)] font-mono">
            gpt-4o-mini &bull; BM25
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
                  className={`max-w-[80%] rounded-md px-3.5 py-2.5 text-xs leading-relaxed border ${
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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              data-testid="chat-input"
              type="text"
              placeholder={
                locale === "id"
                  ? "Tanyakan apa saja tentang Satria..."
                  : "Ask anything about Satria..."
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
                disabled={!inputVal.trim()}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--linux-surface-raised)] border border-[var(--linux-accent)] text-[var(--linux-accent)] hover:bg-[var(--linux-accent)] hover:text-[#080b10] transition-colors disabled:opacity-40 shrink-0"
                title="Send"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            )}
          </form>

          <div className="flex items-center justify-between px-1 pt-1.5 text-[10px] font-mono text-[var(--linux-text-subtle)]">
            <span>Maksimal 2.000 karakter</span>
            <span>{inputVal.length} / 2000</span>
          </div>
        </div>
      </main>
    </div>
  );
}
