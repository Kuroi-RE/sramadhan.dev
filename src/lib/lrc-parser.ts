export interface LrcLine {
  timeMs: number;
  text: string;
}

export interface LineTiming {
  startMs: number;
  endMs: number;
  durationMs: number;
}

/**
 * Parses LRC format lyrics into a sorted array of lines with timestamps in milliseconds.
 * Supports multi-timestamps per line (e.g., [00:10.00][00:20.00]Chorus) and [offset: +/-ms].
 */
export function parseLrc(lrcText: string): LrcLine[] {
  if (!lrcText) return [];

  const lines = lrcText.split(/\r?\n/);
  const result: LrcLine[] = [];
  let offsetMs = 0;

  // Regex to match tags like [01:23.45] or [01:23.456] or [01:23]
  const timeTagRegex = /\[(\d{1,3}):(\d{2})(?:\.(\d{1,3}))?\]/g;
  const offsetRegex = /\[offset:\s*([+-]?\d+)\s*\]/i;

  // First pass: look for offset tag
  for (const line of lines) {
    const offsetMatch = line.match(offsetRegex);
    if (offsetMatch) {
      offsetMs = parseInt(offsetMatch[1], 10) || 0;
    }
  }

  // Second pass: extract lyrics and timestamps
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("[offset:")) continue;

    timeTagRegex.lastIndex = 0;
    const timestamps: number[] = [];
    let match: RegExpExecArray | null;

    while ((match = timeTagRegex.exec(trimmed)) !== null) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const millisPart = match[3] || "0";
      // Normalize millisecond precision (e.g. "45" -> 450, "4" -> 400, "456" -> 456)
      const millis = parseInt(millisPart.padEnd(3, "0").slice(0, 3), 10);

      const totalMs = minutes * 60 * 1000 + seconds * 1000 + millis + offsetMs;
      timestamps.push(Math.max(0, totalMs));
    }

    if (timestamps.length === 0) continue;

    const text = trimmed.replace(timeTagRegex, "").trim();
    if (!text) continue; // skip blank lyrics

    for (const timeMs of timestamps) {
      result.push({ timeMs, text });
    }
  }

  // Sort chronologically
  return result.sort((a, b) => a.timeMs - b.timeMs);
}

/**
 * Finds the current lyric line index using binary search with a configurable lead time (default 200ms).
 * Returns -1 if playback is before the first line.
 */
export function currentLineIndex(
  lines: LrcLine[],
  positionMs: number,
  leadMs = 200
): number {
  if (!lines || lines.length === 0) return -1;

  const targetTime = positionMs + leadMs;
  if (targetTime < lines[0].timeMs) return -1;

  let low = 0;
  let high = lines.length - 1;
  let result = 0;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (lines[mid].timeMs <= targetTime) {
      result = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return result;
}

/**
 * Calculates start, end, and duration for a line.
 * If it's the last line, end is trackDurationMs or startMs + 4000ms fallback.
 */
export function lineTiming(
  lines: LrcLine[],
  index: number,
  trackDurationMs?: number
): LineTiming {
  if (!lines || index < 0 || index >= lines.length) {
    return { startMs: 0, endMs: 0, durationMs: 0 };
  }

  const startMs = lines[index].timeMs;
  let endMs: number;

  if (index < lines.length - 1) {
    endMs = lines[index + 1].timeMs;
  } else {
    // Last line
    if (trackDurationMs && trackDurationMs > startMs) {
      endMs = trackDurationMs;
    } else {
      endMs = startMs + 4000;
    }
  }

  const durationMs = Math.max(0, endMs - startMs);
  return { startMs, endMs, durationMs };
}
