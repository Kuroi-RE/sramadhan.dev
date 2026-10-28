import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { LockScreen } from "./LockScreen";
import { useSystemStore } from "@/lib/stores/system-store";

vi.mock("@/lib/audio-context", () => ({
  initAudioContext: vi.fn(),
  getAudioContext: vi.fn(),
}));

describe("LockScreen Component", () => {
  beforeEach(() => {
    useSystemStore.setState({ phase: "lock" });
    vi.clearAllMocks();
  });

  it("renders clock, profile name, and unlock prompt without password input", () => {
    render(<LockScreen />);

    expect(screen.getByTestId("lock-screen")).toBeInTheDocument();
    expect(screen.getByTestId("lock-time")).toBeInTheDocument();
    expect(screen.getByTestId("lock-date")).toBeInTheDocument();
    expect(screen.getByTestId("lock-user-name")).toHaveTextContent(
      "Satria Ramadhan"
    );
    expect(screen.getByTestId("lock-submit-button")).toBeInTheDocument();
    expect(screen.queryByTestId("lock-password-input")).not.toBeInTheDocument();
  });

  it("unlocks and moves system phase to welcome on clicking submit button", () => {
    render(<LockScreen />);

    const unlockBtn = screen.getByTestId("lock-submit-button");
    fireEvent.click(unlockBtn);

    expect(useSystemStore.getState().phase).toBe("welcome");
  });

  it("unlocks and moves system phase to welcome on pressing Enter key", () => {
    render(<LockScreen />);

    fireEvent.keyDown(window, { key: "Enter", code: "Enter" });

    expect(useSystemStore.getState().phase).toBe("welcome");
  });
});
