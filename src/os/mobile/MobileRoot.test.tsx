import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { MobileRoot } from "./MobileRoot";
import { useWindowStore } from "@/lib/stores/window-store";

describe("MobileRoot Component Tests", () => {
  beforeEach(() => {
    localStorage.clear();
    useWindowStore.getState().resetWindows();
  });

  it("renders mobile status bar, clock, app icons, and dock", () => {
    render(<MobileRoot />);

    expect(screen.getByTestId("mobile-root")).toBeInTheDocument();
    expect(screen.getByTestId("mobile-status-bar")).toBeInTheDocument();
    expect(screen.getByTestId("mobile-clock")).toBeInTheDocument();
    expect(screen.getByTestId("mobile-battery-level")).toBeInTheDocument();
    expect(screen.getByTestId("mobile-dock")).toBeInTheDocument();

    // Check an app icon
    expect(screen.getByTestId("mobile-app-icon-terminal")).toBeInTheDocument();
    expect(screen.getByTestId("mobile-dock-icon-terminal")).toBeInTheDocument();
  });

  it("displays desktop advisory banner by default and hides when dismissed", () => {
    render(<MobileRoot />);

    const banner = screen.getByTestId("desktop-banner");
    expect(banner).toBeInTheDocument();

    const dismissBtn = screen.getByTestId("dismiss-banner-btn");
    fireEvent.click(dismissBtn);

    expect(screen.queryByTestId("desktop-banner")).not.toBeInTheDocument();
    expect(localStorage.getItem("dismissed_desktop_banner")).toBe("true");
  });

  it("does not display banner if previously dismissed in localStorage", () => {
    localStorage.setItem("dismissed_desktop_banner", "true");
    render(<MobileRoot />);

    expect(screen.queryByTestId("desktop-banner")).not.toBeInTheDocument();
  });

  it("opens fullscreen app when tapping app icon and closes via home indicator", async () => {
    render(<MobileRoot />);

    const terminalIcon = screen.getByTestId("mobile-app-icon-terminal");
    fireEvent.click(terminalIcon);

    expect(
      screen.getByTestId("mobile-fullscreen-app-terminal")
    ).toBeInTheDocument();

    // Close via home indicator
    const homeIndicator = screen.getByTestId("mobile-home-indicator");
    fireEvent.click(homeIndicator);

    await waitFor(() => {
      expect(
        screen.queryByTestId("mobile-fullscreen-app-terminal")
      ).not.toBeInTheDocument();
    });
  });

  it("closes fullscreen app via top close button", async () => {
    render(<MobileRoot />);

    const settingsIcon = screen.getByTestId("mobile-app-icon-settings");
    fireEvent.click(settingsIcon);

    expect(
      screen.getByTestId("mobile-fullscreen-app-settings")
    ).toBeInTheDocument();

    const closeBtn = screen.getByTestId("mobile-app-close-btn");
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(
        screen.queryByTestId("mobile-fullscreen-app-settings")
      ).not.toBeInTheDocument();
    });
  });
});
