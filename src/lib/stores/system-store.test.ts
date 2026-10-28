import { describe, it, expect, beforeEach } from "vitest";
import { useSystemStore } from "./system-store";

describe("System Store State Machine", () => {
  beforeEach(() => {
    useSystemStore.setState({ phase: "boot", hasBootedSession: false });
  });

  it("initializes with boot phase", () => {
    expect(useSystemStore.getState().phase).toBe("boot");
  });

  it("transitions from boot to lock via finishBoot", () => {
    useSystemStore.getState().finishBoot();
    expect(useSystemStore.getState().phase).toBe("lock");
    expect(useSystemStore.getState().hasBootedSession).toBe(true);
  });

  it("transitions from lock to welcome via unlock", () => {
    useSystemStore.setState({ phase: "lock" });
    useSystemStore.getState().unlock();
    expect(useSystemStore.getState().phase).toBe("welcome");
  });

  it("transitions from welcome to desktop via setPhase", () => {
    useSystemStore.setState({ phase: "welcome" });
    useSystemStore.getState().setPhase("desktop");
    expect(useSystemStore.getState().phase).toBe("desktop");
  });

  it("transitions from desktop to lock via lock action", () => {
    useSystemStore.setState({ phase: "desktop" });
    useSystemStore.getState().lock();
    expect(useSystemStore.getState().phase).toBe("lock");
  });
});
