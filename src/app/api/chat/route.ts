import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import fs from "node:fs/promises";
import path from "node:path";
import {
  chatbotConfig,
  ASSISTANT_PROFILES,
} from "../../../../content/chatbot/config";
import { buildSystemPrompt } from "@/lib/chatbot";

const ChatMessageItemSchema = z
  .object({
    role: z.enum(["user", "assistant"]),
    content: z.string().max(chatbotConfig.maxMessageLength).default(""),
    images: z.array(z.string()).max(4).optional(),
  })
  .refine(
    (item) =>
      item.content.trim().length > 0 || (item.images && item.images.length > 0),
    {
      message: "Pesan teks atau gambar harus ada.",
    }
  );

const ChatRequestSchema = z.object({
  assistantId: z.enum(["portfolio", "general"]).optional().default("portfolio"),
  messages: z
    .array(ChatMessageItemSchema)
    .min(1)
    .max(chatbotConfig.maxMessageHistory),
});

// Simple in-memory IP rate limiter (30 requests per minute)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  if (entry.count >= 30) {
    return false;
  }

  entry.count++;
  return true;
}

let cachedRulesText: string | null = null;
async function getRulesText(): Promise<string> {
  if (cachedRulesText) return cachedRulesText;
  try {
    const rulesPath = path.join(
      process.cwd(),
      "content",
      "chatbot",
      "rules.md"
    );
    cachedRulesText = await fs.readFile(rulesPath, "utf8");
    return cachedRulesText;
  } catch {
    return "Anda adalah asisten AI resmi Satria Ramadhan. Jawab seputar profil, keahlian, dan proyek Satria.";
  }
}

export async function POST(req: NextRequest) {
  // 1. Rate limiting check
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Silakan tunggu sebentar." },
      { status: 429 }
    );
  }

  // 2. Validate request body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = ChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          "Validasi pesan gagal. Maksimal 20 pesan dan 2.000 karakter per pesan.",
        details: parsed.error.issues,
      },
      { status: 400 }
    );
  }

  const { messages, assistantId } = parsed.data;
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
  const userQuery =
    lastUserMsg?.content.trim() ||
    (lastUserMsg?.images && lastUserMsg.images.length > 0
      ? "Analisis gambar ini"
      : "");

  // 3. Resolve Assistant Profile & System Prompt
  const profile =
    ASSISTANT_PROFILES.find((p) => p.id === assistantId) ||
    ASSISTANT_PROFILES[0];

  let systemPrompt: string;
  if (profile.useRAG) {
    const rules = await getRulesText();
    systemPrompt = buildSystemPrompt(userQuery, rules);
  } else {
    systemPrompt = profile.systemPrompt;
  }

  const maxTokens = Math.min(profile.maxTokens, chatbotConfig.maxTokens);

  const baseUrl = process.env.CHAT_API_BASE_URL;
  const apiKey = process.env.CHAT_API_KEY;
  const model = process.env.CHAT_MODEL || chatbotConfig.defaultModel;
  const isStream = process.env.CHAT_STREAM !== "false";

  // Fallback demo mode if environment variables are not configured
  if (!baseUrl || !apiKey) {
    // Return graceful synthetic assistant response in demo mode
    const hasImage = !!(lastUserMsg?.images && lastUserMsg.images.length > 0);
    const demoReply = hasImage
      ? `Halo! Saya menerima pesan Anda beserta ${lastUserMsg!.images!.length} gambar (Demo Mode). Kunci API belum dikonfigurasi di environment, namun endpoint berhasil menerima berkas gambar.`
      : `Halo! Saya adalah asisten AI Satria Ramadhan (Demo Mode). Kunci API belum dikonfigurasi di environment, namun knowledge base RAG lokal berhasil menemukan informasi berikut:\n\n${systemPrompt.slice(0, 300)}...`;

    if (isStream) {
      const encoder = new TextEncoder();
      const readableStream = new ReadableStream({
        start(controller) {
          const sseData = `data: ${JSON.stringify({
            choices: [{ delta: { content: demoReply } }],
          })}\n\ndata: ${JSON.stringify({
            choices: [],
            usage: {
              prompt_tokens: 38,
              completion_tokens: 42,
              total_tokens: 80,
            },
          })}\n\ndata: [DONE]\n\n`;
          controller.enqueue(encoder.encode(sseData));
          controller.close();
        },
      });

      return new Response(readableStream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    return NextResponse.json({
      choices: [{ message: { role: "assistant", content: demoReply } }],
      usage: {
        prompt_tokens: 38,
        completion_tokens: 42,
        total_tokens: 80,
      },
    });
  }

  // 4. Upstream POST call with timeout guard
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
    const upstreamUrl = cleanBaseUrl.endsWith("/v1")
      ? `${cleanBaseUrl}/chat/completions`
      : `${cleanBaseUrl}/v1/chat/completions`;
    const upstreamMessages = messages.map((m) => {
      if (m.role === "user" && m.images && m.images.length > 0) {
        const textPart = m.content.trim() || "Jelaskan gambar ini.";
        return {
          role: "user",
          content: [
            { type: "text", text: textPart },
            ...m.images.map((img) => ({
              type: "image_url",
              image_url: { url: img },
            })),
          ],
        };
      }
      return {
        role: m.role,
        content: m.content || " ",
      };
    });

    const upstreamRes = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          ...upstreamMessages,
        ],
        temperature: chatbotConfig.temperature,
        max_tokens: maxTokens,
        stream: isStream,
        ...(isStream ? { stream_options: { include_usage: true } } : {}),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (upstreamRes.status === 401 || upstreamRes.status === 403) {
      return NextResponse.json(
        {
          error:
            "Autentikasi ke layanan model gagal. Harap hubungi administrator.",
        },
        { status: 502 }
      );
    }

    if (!upstreamRes.ok) {
      return NextResponse.json(
        {
          error: `Layanan model mengembalikan kesalahan (Status ${upstreamRes.status}).`,
        },
        { status: 502 }
      );
    }

    if (isStream && upstreamRes.body) {
      return new Response(upstreamRes.body, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    const data = await upstreamRes.json();
    return NextResponse.json(data);
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json(
        { error: "Waktu permintaan ke layanan chatbot habis (timeout)." },
        { status: 504 }
      );
    }

    return NextResponse.json(
      {
        error: "Terjadi kesalahan internal saat menghubungkan ke chatbot.",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
