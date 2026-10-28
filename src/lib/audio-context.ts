let globalAudioContext: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  return globalAudioContext;
}

export function initAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return null;

    if (!globalAudioContext) {
      globalAudioContext = new AudioCtx();
    }

    if (globalAudioContext.state === "suspended") {
      globalAudioContext.resume().catch(() => {});
    }

    return globalAudioContext;
  } catch (err) {
    console.warn("AudioContext init skipped/failed:", err);
    return null;
  }
}
