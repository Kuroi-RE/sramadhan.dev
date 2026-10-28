import { describe, it, expect } from "vitest";
import { parseLrc, currentLineIndex, lineTiming } from "./lrc-parser";

describe("LRC Parser", () => {
  it("parses single timestamp lines correctly", () => {
    const lrc = `
[00:01.00] Line one
[00:05.50] Line two
    `;
    const result = parseLrc(lrc);
    expect(result.length).toBe(2);
    expect(result[0]).toEqual({ timeMs: 1000, text: "Line one" });
    expect(result[1]).toEqual({ timeMs: 5500, text: "Line two" });
  });

  it("parses multi timestamp in a single line into separate lines chronologically", () => {
    const lrc = `[00:10.00][00:25.00] Repeat chorus line`;
    const result = parseLrc(lrc);
    expect(result.length).toBe(2);
    expect(result[0]).toEqual({ timeMs: 10000, text: "Repeat chorus line" });
    expect(result[1]).toEqual({ timeMs: 25000, text: "Repeat chorus line" });
  });

  it("applies [offset:+/-ms] tag to all lines", () => {
    const lrc = `
[offset:+500]
[00:02.00] Offset line
    `;
    const result = parseLrc(lrc);
    expect(result.length).toBe(1);
    expect(result[0].timeMs).toBe(2500); // 2000 + 500
  });

  it("ignores blank lines and metadata tags", () => {
    const lrc = `
[ti:Sample Title]
[ar:Sample Artist]

[00:03.00] Hello world

   
    `;
    const result = parseLrc(lrc);
    expect(result.length).toBe(1);
    expect(result[0].text).toBe("Hello world");
  });
});

describe("currentLineIndex Binary Search", () => {
  const lines = [
    { timeMs: 1000, text: "First" },
    { timeMs: 4000, text: "Second" },
    { timeMs: 8000, text: "Third" },
  ];

  it("returns -1 before the first line starts with lead time", () => {
    // 500ms + 200ms lead = 700ms < 1000ms -> -1
    expect(currentLineIndex(lines, 500, 200)).toBe(-1);
  });

  it("returns 0 when approaching first line within lead time (200ms)", () => {
    // 850ms + 200ms lead = 1050ms >= 1000ms -> line 0
    expect(currentLineIndex(lines, 850, 200)).toBe(0);
  });

  it("finds exact active line during playback", () => {
    // 5000ms + 200ms = 5200ms -> line 1 (Second: 4000)
    expect(currentLineIndex(lines, 5000, 200)).toBe(1);

    // 8000ms + 200ms = 8200ms -> line 2 (Third: 8000)
    expect(currentLineIndex(lines, 8000, 200)).toBe(2);
  });
});

describe("lineTiming Calculations", () => {
  const lines = [
    { timeMs: 1000, text: "First" },
    { timeMs: 4000, text: "Second" },
    { timeMs: 7000, text: "Third" },
  ];

  it("calculates normal line duration until next line", () => {
    const timing = lineTiming(lines, 0);
    expect(timing.startMs).toBe(1000);
    expect(timing.endMs).toBe(4000);
    expect(timing.durationMs).toBe(3000);
  });

  it("calculates last line timing using trackDurationMs when available", () => {
    const timing = lineTiming(lines, 2, 10000);
    expect(timing.startMs).toBe(7000);
    expect(timing.endMs).toBe(10000);
    expect(timing.durationMs).toBe(3000);
  });

  it("falls back to 4000ms default duration for last line when track duration is omitted", () => {
    const timing = lineTiming(lines, 2);
    expect(timing.startMs).toBe(7000);
    expect(timing.endMs).toBe(11000); // 7000 + 4000
    expect(timing.durationMs).toBe(4000);
  });
});
