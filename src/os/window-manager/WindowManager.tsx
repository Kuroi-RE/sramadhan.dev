"use client";

import { useWindowStore } from "@/lib/stores/window-store";
import { APP_REGISTRY } from "./app-registry";
import { WindowFrame } from "./WindowFrame";

export function WindowManager() {
  const windows = useWindowStore((state) => state.windows);
  const openWindows = Object.values(windows).filter((w) => w.isOpen);

  return (
    <div
      data-testid="window-manager"
      className="absolute inset-0 pointer-events-none"
    >
      {openWindows.map((instance) => {
        const metadata = APP_REGISTRY[instance.id];
        if (!metadata) return null;

        return (
          <WindowFrame
            key={instance.id}
            instance={instance}
            metadata={metadata}
          />
        );
      })}
    </div>
  );
}
