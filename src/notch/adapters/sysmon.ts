export interface SysmonMetrics {
  cpu: number; // 0 - 100
  ram: number; // 0 - 100
}

/**
 * Seeded pseudo-random number generator (Mulberry32).
 */
export function createSeededRandom(seed: number) {
  let s = Math.floor(seed) >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Simulates decorative CPU and RAM loads using a bounded random walk.
 * Guaranteed to be strictly within 0 - 100 and deterministic for the same step and seed.
 */
export function getSysmonMetrics(step: number, seed = 1337): SysmonMetrics {
  const rng = createSeededRandom(seed + step * 10);
  const rawCpu = 20 + rng() * 45 + Math.sin(step * 0.1) * 15;
  const rawRam = 45 + rng() * 20 + Math.cos(step * 0.05) * 10;

  const clamp = (val: number) => Math.max(0, Math.min(100, Math.round(val)));

  return {
    cpu: clamp(rawCpu),
    ram: clamp(rawRam),
  };
}
