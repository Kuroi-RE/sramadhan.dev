import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MessageApp } from "./MessageApp";

describe("MessageApp Component RTL Tests", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("renders initial welcome message and suggested prompts", () => {
    render(<MessageApp />);

    expect(screen.getByTestId("message-app")).toBeInTheDocument();
    expect(screen.getByTestId("chat-bubble-assistant")).toBeInTheDocument();
    expect(screen.getByTestId("suggested-prompts")).toBeInTheDocument();
  });

  it("sends message when clicking a suggested prompt button", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                role: "assistant",
                content: "Satria membuat PioPio dan portofolio OS.",
              },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    render(<MessageApp />);

    const promptButtons = screen.getAllByTestId("suggested-prompt-btn");
    await act(async () => {
      fireEvent.click(promptButtons[0]);
    });

    // User message should appear
    expect(screen.getByTestId("chat-bubble-user")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Satria membuat PioPio/)).toBeInTheDocument();
    });
  });

  it("shows error banner and retry button on fetch failure", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network disconnect"));

    render(<MessageApp />);

    const input = screen.getByTestId("chat-input");
    const sendBtn = screen.getByTestId("chat-send-btn");

    await act(async () => {
      fireEvent.change(input, { target: { value: "Halo Satria" } });
      fireEvent.click(sendBtn);
    });

    await waitFor(() => {
      expect(screen.getByTestId("chat-error-banner")).toBeInTheDocument();
      expect(screen.getByTestId("chat-retry-btn")).toBeInTheDocument();
    });

    // Mock successful retry
    global.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [
            {
              message: { role: "assistant", content: "Jawaban setelah retry." },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("chat-retry-btn"));
    });

    await waitFor(() => {
      expect(screen.getByText("Jawaban setelah retry.")).toBeInTheDocument();
    });
  });

  it("displays token usage badge and header token summary when response contains usage", async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                role: "assistant",
                content: "Ini respon dengan metrik token.",
              },
            },
          ],
          usage: {
            prompt_tokens: 120,
            completion_tokens: 45,
            total_tokens: 165,
            tokens_per_second: 22.4,
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    render(<MessageApp />);

    const input = screen.getByTestId("chat-input");
    const sendBtn = screen.getByTestId("chat-send-btn");

    await act(async () => {
      fireEvent.change(input, { target: { value: "Halo test token" } });
      fireEvent.click(sendBtn);
    });

    await waitFor(() => {
      expect(
        screen.getByText("Ini respon dengan metrik token.")
      ).toBeInTheDocument();
    });

    // Check token usage badge in the assistant bubble
    const badge = screen.getByTestId("token-usage-badge");
    expect(badge).toBeInTheDocument();
    expect(badge.textContent).toContain("165 tokens");
    expect(badge.textContent).toContain("120 in");
    expect(badge.textContent).toContain("45 out");
    expect(badge.textContent).toContain("22.4 tok/s");

    // Check header token summary badge
    const headerBadge = screen.getByTestId("header-token-badge");
    expect(headerBadge).toBeInTheDocument();
    expect(headerBadge.textContent).toContain("165 tok");
  });

  it("handles image upload, paste, drag-and-drop, and displays attached images in message bubble", async () => {
    let sentBody: string = "";
    global.fetch = vi.fn().mockImplementation((_url, init) => {
      sentBody = init?.body as string;
      return Promise.resolve(
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  role: "assistant",
                  content: "Gambar berhasil dianalisis.",
                },
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      );
    });

    render(<MessageApp />);

    // 1. Upload via file input
    const fileInput = screen.getByTestId("chat-file-input");
    const mockFile1 = new File(["dummy png content"], "test1.png", {
      type: "image/png",
    });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [mockFile1] } });
    });

    await waitFor(() => {
      expect(screen.getByTestId("chat-pending-images")).toBeInTheDocument();
    });

    // 2. Paste image
    const chatInput = screen.getByTestId("chat-input");
    const mockFile2 = new File(["dummy paste content"], "paste.png", {
      type: "image/png",
    });
    await act(async () => {
      fireEvent.paste(chatInput, {
        clipboardData: {
          items: [
            {
              type: "image/png",
              getAsFile: () => mockFile2,
            },
          ],
        },
      });
    });

    await waitFor(() => {
      const thumbs = screen.getAllByTestId("pending-image-thumb");
      expect(thumbs.length).toBe(2);
    });

    // 3. Remove one image
    const removeBtn = screen.getByTestId("remove-image-0");
    await act(async () => {
      fireEvent.click(removeBtn);
    });

    expect(screen.getAllByTestId("pending-image-thumb").length).toBe(1);

    // 4. Send message with image and text
    const sendBtn = screen.getByTestId("chat-send-btn");
    await act(async () => {
      fireEvent.change(chatInput, {
        target: { value: "Tolong deskripsikan gambar ini" },
      });
      fireEvent.click(sendBtn);
    });

    await waitFor(() => {
      expect(
        screen.getByText("Gambar berhasil dianalisis.")
      ).toBeInTheDocument();
    });

    // Verify user bubble contains image preview
    expect(screen.getByTestId("chat-message-images")).toBeInTheDocument();
    expect(
      screen.getByText("Tolong deskripsikan gambar ini")
    ).toBeInTheDocument();

    // Verify payload sent to /api/chat contains image data
    const parsed = JSON.parse(sentBody);
    const lastMsg = parsed.messages[parsed.messages.length - 1];
    expect(lastMsg.images).toBeDefined();
    expect(lastMsg.images.length).toBe(1);
    expect(lastMsg.images[0]).toContain("data:image/png");
  });
});
