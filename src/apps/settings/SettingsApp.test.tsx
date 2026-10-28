import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { SettingsApp } from "./SettingsApp";
import { useSettingsStore, ACCENT_PRESETS } from "@/lib/stores/settings-store";
import { defaultWallpapers } from "@/lib/manifests";

describe("SettingsApp Component", () => {
  beforeEach(() => {
    useSettingsStore.setState({
      locale: "id",
      accentColor: "#3b82f6",
      wallpaperId: "default",
    });
  });

  it("renders sidebar with all 4 menu items", () => {
    render(<SettingsApp />);

    expect(screen.getByTestId("settings-nav-wallpaper")).toBeInTheDocument();
    expect(screen.getByTestId("settings-nav-appearance")).toBeInTheDocument();
    expect(screen.getByTestId("settings-nav-language")).toBeInTheDocument();
    expect(screen.getByTestId("settings-nav-about")).toBeInTheDocument();
  });

  it("allows selecting wallpaper and updates store", () => {
    render(<SettingsApp />);

    const wp = defaultWallpapers[0];
    const wpButton = screen.getByTestId(`wallpaper-item-${wp.id}`);
    fireEvent.click(wpButton);

    expect(useSettingsStore.getState().wallpaperId).toBe(wp.id);
  });

  it("allows selecting accent color and updates store and :root --accent", () => {
    render(<SettingsApp />);

    // Navigate to appearance
    fireEvent.click(screen.getByTestId("settings-nav-appearance"));
    expect(
      screen.getByTestId("settings-section-appearance")
    ).toBeInTheDocument();

    // Select Green preset
    const greenPreset = ACCENT_PRESETS.find((p) => p.id === "green")!;
    const greenButton = screen.getByTestId("accent-item-green");
    fireEvent.click(greenButton);

    expect(useSettingsStore.getState().accentColor).toBe(greenPreset.color);
    expect(document.documentElement.style.getPropertyValue("--accent")).toBe(
      greenPreset.color
    );
  });

  it("allows switching language between ID and EN", () => {
    render(<SettingsApp />);

    // Navigate to language
    fireEvent.click(screen.getByTestId("settings-nav-language"));

    // Select EN
    fireEvent.click(screen.getByTestId("language-select-en"));
    expect(useSettingsStore.getState().locale).toBe("en");

    // Select ID
    fireEvent.click(screen.getByTestId("language-select-id"));
    expect(useSettingsStore.getState().locale).toBe("id");
  });

  it("displays developer profile details in About section", () => {
    render(<SettingsApp />);

    // Navigate to about
    fireEvent.click(screen.getByTestId("settings-nav-about"));
    expect(screen.getByTestId("settings-section-about")).toBeInTheDocument();

    expect(screen.getByText("Satria Ramadhan")).toBeInTheDocument();
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
  });
});
