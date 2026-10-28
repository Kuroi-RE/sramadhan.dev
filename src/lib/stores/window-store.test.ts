import { describe, it, expect, beforeEach } from "vitest";
import { useWindowStore } from "./window-store";

describe("Window Store Reducer and State Management", () => {
  beforeEach(() => {
    useWindowStore.getState().resetWindows();
  });

  it("opens an application window and sets activeWindowId", () => {
    useWindowStore.getState().openWindow("terminal");
    const state = useWindowStore.getState();

    expect(state.windows.terminal).toBeDefined();
    expect(state.windows.terminal.isOpen).toBe(true);
    expect(state.windows.terminal.isMinimized).toBe(false);
    expect(state.activeWindowId).toBe("terminal");
  });

  it("focus raises z-index above current maximum", () => {
    useWindowStore.getState().openWindow("terminal");
    const terminalZ1 = useWindowStore.getState().windows.terminal.zIndex;

    useWindowStore.getState().openWindow("settings");
    const settingsZ = useWindowStore.getState().windows.settings.zIndex;
    expect(settingsZ).toBeGreaterThan(terminalZ1);
    expect(useWindowStore.getState().activeWindowId).toBe("settings");

    // Focus back on terminal
    useWindowStore.getState().focusWindow("terminal");
    const terminalZ2 = useWindowStore.getState().windows.terminal.zIndex;
    expect(terminalZ2).toBeGreaterThan(settingsZ);
    expect(useWindowStore.getState().activeWindowId).toBe("terminal");
  });

  it("minimizes window and restores it on focus", () => {
    useWindowStore.getState().openWindow("music");
    expect(useWindowStore.getState().windows.music.isMinimized).toBe(false);

    useWindowStore.getState().minimizeWindow("music");
    expect(useWindowStore.getState().windows.music.isMinimized).toBe(true);

    useWindowStore.getState().focusWindow("music");
    expect(useWindowStore.getState().windows.music.isMinimized).toBe(false);
    expect(useWindowStore.getState().activeWindowId).toBe("music");
  });

  it("toggles maximize and restores previous bounds", () => {
    useWindowStore.getState().openWindow("calendar");
    const initialBounds = {
      ...useWindowStore.getState().windows.calendar.bounds,
    };

    // Maximize
    useWindowStore.getState().maximizeWindow("calendar");
    expect(useWindowStore.getState().windows.calendar.isMaximized).toBe(true);
    expect(
      useWindowStore.getState().windows.calendar.preMaximizedBounds
    ).toEqual(initialBounds);

    // Un-maximize / restore
    useWindowStore.getState().maximizeWindow("calendar");
    expect(useWindowStore.getState().windows.calendar.isMaximized).toBe(false);
    expect(useWindowStore.getState().windows.calendar.bounds).toEqual(
      initialBounds
    );
  });

  it("close marks window as not open and clears active focus", () => {
    useWindowStore.getState().openWindow("message");
    expect(useWindowStore.getState().windows.message.isOpen).toBe(true);
    expect(useWindowStore.getState().activeWindowId).toBe("message");

    useWindowStore.getState().closeWindow("message");
    expect(useWindowStore.getState().windows.message.isOpen).toBe(false);
    expect(useWindowStore.getState().activeWindowId).toBeNull();
  });
});
