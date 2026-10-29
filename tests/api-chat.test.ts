import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { searchKnowledge, buildSystemPrompt } from "@/lib/chatbot";
import { POST } from "@/app/api/chat/route";
import { NextRequest } from "next/server";

describe("Knowledge Base RAG Retrieval", () => {
  it("retrieves project chunk when queried about PioPio or projects", () => {
    const result = searchKnowledge("PioPio Notch dynamic island");
    expect(result).toBeTruthy();
    expect(result.toLowerCase()).toContain("piopio");
  });

  it("retrieves skills chunk when queried about TypeScript or tech stack", () => {
    const result = searchKnowledge("TypeScript Next.js React");
    expect(result).toBeTruthy();
    expect(result).toContain("TypeScript");
  });

  it("respects maxContextChars limit in prompt builder", () => {
    const systemPrompt = buildSystemPrompt("Satria Ramadhan", "TEST RULES");
    expect(systemPrompt.startsWith("TEST RULES")).toBe(true);
    expect(systemPrompt.length).toBeLessThanOrEqual(5000);
  });
});

describe("/api/chat Route Handler", () => {
  const originalEnv = { ...process.env };
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.CHAT_API_BASE_URL = "https://mock-chat.example.com";
    process.env.CHAT_API_KEY = "super_secret_test_key_12345";
    process.env.CHAT_MODEL = "test-model";
    process.env.CHAT_STREAM = "true";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    global.fetch = originalFetch;
  });

  it("returns 400 when message content exceeds 2000 characters", async () => {
    const overlongMsg = "a".repeat(2005);
    const req = new NextRequest("http://127.0.0.1:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: overlongMsg }],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Validasi pesan gagal");
  });

  it("returns 400 when message count exceeds 20", async () => {
    const messages = new Array(25).fill(0).map((_, i) => ({
      role: i % 2 === 0 ? ("user" as const) : ("assistant" as const),
      content: `Message ${i}`,
    }));

    const req = new NextRequest("http://127.0.0.1:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({ messages }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 502 without leaking API key when upstream returns 401", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "Invalid API key" }), {
        status: 401,
      })
    );

    const req = new NextRequest("http://127.0.0.1:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Halo" }],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(502);
    const text = await res.text();

    // Verify key was NOT leaked
    expect(text).not.toContain("super_secret_test_key_12345");
  });

  it("forwards streaming response correctly when upstream succeeds", async () => {
    const sseBody =
      'data: {"choices":[{"delta":{"content":"Halo!"}}]}\n\ndata: [DONE]\n\n';
    global.fetch = vi.fn().mockResolvedValue(
      new Response(sseBody, {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      })
    );

    const req = new NextRequest("http://127.0.0.1:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Halo Satria" }],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/event-stream");
    const resText = await res.text();
    expect(resText).toContain("Halo!");
  });

  it("formats image_url multimodal payload correctly for upstream LLM", async () => {
    let capturedBody: any;
    global.fetch = vi.fn().mockImplementation((_url, init) => {
      capturedBody = JSON.parse(init.body);
      return Promise.resolve(
        new Response(
          JSON.stringify({
            choices: [
              { message: { role: "assistant", content: "Vision response" } },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      );
    });

    const req = new NextRequest("http://127.0.0.1:3000/api/chat", {
      method: "POST",
      body: JSON.stringify({
        assistantId: "general",
        messages: [
          {
            role: "user",
            content: "Apa isi gambar ini?",
            images: [
              "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
            ],
          },
        ],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const userMessage = capturedBody.messages.find(
      (m: any) => m.role === "user"
    );
    expect(Array.isArray(userMessage.content)).toBe(true);
    expect(userMessage.content[0].type).toBe("text");
    expect(userMessage.content[0].text).toBe("Apa isi gambar ini?");
    expect(userMessage.content[1].type).toBe("image_url");
    expect(userMessage.content[1].image_url.url).toContain(
      "data:image/png;base64"
    );
  });
});
