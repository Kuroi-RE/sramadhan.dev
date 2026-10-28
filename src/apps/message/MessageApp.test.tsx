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
});
