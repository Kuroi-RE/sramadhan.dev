import { useState, useEffect } from "react";

export function useLyricPulse(activeLineIndex: number): boolean {
  const [prevIndex, setPrevIndex] = useState(activeLineIndex);
  const [isPulsing, setIsPulsing] = useState(false);

  if (activeLineIndex !== prevIndex) {
    setPrevIndex(activeLineIndex);
    if (activeLineIndex >= 0) {
      setIsPulsing(true);
    }
  }

  useEffect(() => {
    if (!isPulsing) return;

    const timer = setTimeout(() => {
      setIsPulsing(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [isPulsing]);

  return isPulsing;
}
