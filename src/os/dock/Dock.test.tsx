import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { Dock } from "./Dock";
import { DesktopScreen } from "../desktop/DesktopScreen";
import { useWindowStore } from "@/lib/stores/window-store";
import { useSystemStore } from "@/lib/stores/system-store";

describe("Dock and Window Manager Integration", () => {
  beforeEach(() => {
    useWindowStore.getState().resetWindows();
    useSystemStore.setState({ phase: "desktop" });
  });

  it("renders all dock app icons and lock button", () => {
    render(<Dock />);

    expect(screen.getByTestId("dock-icon-music")).toBeInTheDocument();
    expect(screen.getByTestId("dock-icon-settings")).toBeInTheDocument();
    expect(screen.getByTestId("dock-icon-terminal")).toBeInTheDocument();
    expect(screen.getByTestId("dock-icon-calendar")).toBeInTheDocument();
    expect(screen.getByTestId("dock-icon-message")).toBeInTheDocument();
    expect(screen.getByTestId("dock-icon-lock")).toBeInTheDocument();
  });

  it("opens window on dock click, minimizes on second click, restores on third click", async () => {
    render(<DesktopScreen />);

    const musicButton = screen.getByTestId("dock-icon-music");

    // 1. Click to open
    await act(async () => {
      fireEvent.click(musicButton);
    });
    expect(useWindowStore.getState().windows.music?.isOpen).toBe(true);
    expect(useWindowStore.getState().windows.music?.isMinimized).toBe(false);
    expect(screen.getByTestId("dock-running-dot-music")).toBeInTheDocument();
    expect(screen.getByTestId("window-music")).toBeInTheDocument();

    // 2. Click while active to minimize
    await act(async () => {
      fireEvent.click(musicButton);
    });
    expect(useWindowStore.getState().windows.music?.isMinimized).toBe(true);
    expect(screen.queryByTestId("window-music")).not.toBeInTheDocument();
    expect(screen.getByTestId("dock-running-dot-music")).toBeInTheDocument();

    // 3. Click while minimized to restore
    await act(async () => {
      fireEvent.click(musicButton);
    });
    expect(useWindowStore.getState().windows.music?.isMinimized).toBe(false);
    expect(screen.getByTestId("window-music")).toBeInTheDocument();
  });

  it("lock icon in dock triggers lockscreen transition", () => {
    render(<Dock />);

    const lockButton = screen.getByTestId("dock-icon-lock");
    fireEvent.click(lockButton);

    expect(useSystemStore.getState().phase).toBe("lock");
  });
});
