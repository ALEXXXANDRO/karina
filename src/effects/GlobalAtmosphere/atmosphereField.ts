export type AtmosphereDepth = 'far' | 'mid' | 'near';

export interface AtmosphereStar {
  readonly x: number;
  readonly y: number;
  readonly depth: AtmosphereDepth;
  readonly cross: boolean;
  readonly glow: boolean;
  readonly radius: number;
  readonly opacity: number;
  readonly angle: number;
  readonly colorIndex: number;
}

export interface AtmosphereStarSizes {
  readonly dust: readonly [number, number];
  readonly medium: readonly [number, number];
  readonly large: readonly [number, number];
}

export function wrap(value: number, period: number) {
  return ((value % period) + period) % period;
}

/** Normalized coordinates remain stable across rerenders and count changes. */
export function createStarField(
  count: number,
  seed = 0x5a17c0de,
  sizes: AtmosphereStarSizes = { dust: [2, 3], medium: [4, 6], large: [8, 14] },
): AtmosphereStar[] {
  let state = seed >>> 0;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  return Array.from({ length: Math.max(0, Math.floor(count)) }, (_, index) => {
    // Each group has two dust particles, one medium star and one large cross.
    const depth: AtmosphereDepth = index % 4 === 0 ? 'near' : index % 4 === 1 ? 'mid' : 'far';
    const cross = depth === 'near';
    const glow = cross && index % 12 === 0;
    const size = cross ? sizes.large : depth === 'mid' ? sizes.medium : sizes.dust;
    return {
      x: random(),
      y: random(),
      depth,
      cross,
      glow,
      radius: (size[0] + random() * (size[1] - size[0])) / 2,
      opacity: (0.75 + random() * 0.25) * (depth === 'far' ? 0.65 : glow ? 1.25 : 1),
      angle: (random() - 0.5) * 0.35,
      colorIndex: Math.floor(random() * 4),
    };
  });
}
