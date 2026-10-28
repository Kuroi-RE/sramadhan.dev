"use client";

import { useState, useRef, useEffect, ReactNode, KeyboardEvent } from "react";
import { executeCommand, COMMAND_REGISTRY } from "./command-registry";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { useT } from "@/lib/i18n";

interface HistoryEntry {
  id: string;
  command: string;
  output: ReactNode;
}

export function TerminalApp() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const locale = useSettingsStore((state) => state.locale);
  const t = useT();

  const promptText = "guest@sramadhan.cv:~$";

  const scrollToBottom = () => {
    terminalEndRef.current?.scrollIntoView?.({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    // 1. Tab completion
    if (e.key === "Tab") {
      e.preventDefault();
      const current = inputVal.trim().toLowerCase();
      if (!current) return;

      const candidates = Array.from(
        new Set(Object.keys(COMMAND_REGISTRY))
      ).filter((cmd) => cmd.startsWith(current));

      if (candidates.length === 1) {
        setInputVal(candidates[0] + " ");
      } else if (candidates.length > 1) {
        // Show matching candidates in terminal
        setHistory((prev) => [
          ...prev,
          {
            id: String(Date.now()),
            command: inputVal,
            output: (
              <div className="text-neutral-400 text-xs py-0.5">
                {candidates.join("   ")}
              </div>
            ),
          },
        ]);
      }
      return;
    }

    // 2. Up Arrow (previous command)
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex < commandHistory.length) {
        setHistoryIndex(nextIndex);
        setInputVal(commandHistory[commandHistory.length - 1 - nextIndex]);
      }
      return;
    }

    // 3. Down Arrow (next command)
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInputVal(commandHistory[commandHistory.length - 1 - nextIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputVal("");
      }
      return;
    }

    // 4. Enter (submit command)
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = inputVal.trim();
      if (!trimmed) {
        setHistory((prev) => [
          ...prev,
          { id: String(Date.now()), command: "", output: null },
        ]);
        return;
      }

      setCommandHistory((prev) => [...prev, trimmed]);
      setHistoryIndex(-1);
      setInputVal("");

      const entryId = String(Date.now());
      const context = {
        clearOutput: () => setHistory([]),
        locale,
        t,
      };

      const result = await executeCommand(trimmed, context);
      if (
        trimmed.toLowerCase() !== "clear" &&
        trimmed.toLowerCase() !== "cls"
      ) {
        setHistory((prev) => [
          ...prev,
          { id: entryId, command: trimmed, output: result },
        ]);
      }
    }
  };

  return (
    <div
      data-testid="terminal-container"
      className="flex h-full w-full flex-col bg-[var(--linux-bg)] font-mono text-sm text-[var(--linux-text)] overflow-y-auto cursor-text select-text"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Minimal Terminal Session Header */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-[var(--linux-border)] bg-[var(--linux-surface)] text-[11px] text-[var(--linux-text-muted)] select-none shrink-0">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--linux-success)]" />
          <span>bash — guest@sramadhan.cv</span>
        </div>
        <span className="text-[var(--linux-text-subtle)]">tty1 // zsh-5.9</span>
      </div>

      <div className="p-4 flex-1">
        {/* Banner */}
        <div className="mb-4 text-xs text-[var(--linux-text-subtle)] select-none">
          <div className="text-[var(--linux-text-muted)]">
            SatriaOS Terminal [Version 1.0.0 — Hyprland/Wayland]
          </div>
          <div>(c) 2026 Satria Ramadhan. All rights reserved.</div>
          <div className="mt-1 text-[var(--linux-text-muted)]">
            Ketik &apos;
            <span className="text-[var(--linux-accent)] font-bold">help</span>
            &apos; untuk daftar perintah yang tersedia.
          </div>
        </div>

        {/* History */}
        <div className="space-y-2">
          {history.map((entry) => (
            <div key={entry.id} className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[var(--linux-accent)] font-semibold">
                  {promptText}
                </span>
                <span className="text-[var(--linux-text)]">
                  {entry.command}
                </span>
              </div>
              {entry.output && (
                <div className="pl-4 text-[var(--linux-text-muted)] font-sans">
                  {entry.output}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input line */}
        <div className="mt-2 flex items-center gap-2">
          <span
            data-testid="terminal-prompt"
            className="text-[var(--linux-accent)] font-semibold shrink-0"
          >
            {promptText}
          </span>
          <input
            ref={inputRef}
            data-testid="terminal-input"
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            spellCheck={false}
            autoComplete="off"
            className="flex-1 bg-transparent text-[var(--linux-text)] outline-none font-mono text-sm caret-[var(--linux-accent)]"
            aria-label="Terminal input"
          />
        </div>

        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}
