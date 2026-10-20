type HeroObjectStatus = 'ready' | 'manual-review';

interface HeroObject {
  readonly id: string;
  readonly nodeId: string;
  readonly file: string;
  readonly status: HeroObjectStatus;
  /** Bounds in the original 1920 × 1080 composition; rotation is baked in. */
  readonly desktop: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
  };
  /** Proposed positions and widths in percent for tablet and mobile. */
  readonly compact: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
  };
}

export const heroReferenceSize = { width: 1920, height: 1080 } as const;

// Mappings are verified by artwork, orientation, proportions and alpha.
// See docs/hero-assets.md; unverified exports are not requested.
export const heroObjects = [
  {
    id: 'blue-bottom-left',
    nodeId: '141:12810',
    file: 'bob19mini.png',
    status: 'ready',
    desktop: { x: 316, y: 881, width: 106.220, height: 102.294 },
    compact: { x: 14, y: 82, width: 14 },
  },
  {
    id: 'blue-top',
    nodeId: '141:12811',
    file: 'bob12mini.png',
    status: 'ready',
    desktop: { x: 1084, y: 176, width: 106.220, height: 102.294 },
    compact: { x: 70, y: 18, width: 14 },
  },
  {
    id: 'blue-bottom-right',
    nodeId: '141:12812',
    file: 'bob16mini.png',
    status: 'ready',
    desktop: { x: 1389.49, y: 715.993, width: 103.246, height: 82.308 },
    compact: { x: 77, y: 72, width: 14 },
  },
  {
    id: 'purple-spiked-left',
    nodeId: '141:12813',
    file: 'bob20.png',
    status: 'ready',
    desktop: { x: 33, y: 589, width: 212.430, height: 208.364 },
    compact: { x: 2, y: 62, width: 20 },
  },
  {
    id: 'yellow-spiked-bottom',
    nodeId: '141:12816',
    file: 'bob17.png',
    status: 'ready',
    desktop: { x: 1194, y: 799, width: 220.629, height: 220.536 },
    compact: { x: 62, y: 83, width: 22 },
  },
  {
    id: 'yellow-top-left',
    nodeId: '141:12820',
    file: 'bob23.png',
    status: 'ready',
    desktop: { x: 321, y: 104, width: 127.004, height: 160 },
    compact: { x: 15, y: 11, width: 19 },
  },
  {
    id: 'yellow-bottom-left',
    nodeId: '141:12823',
    file: 'bob19.png',
    status: 'ready',
    desktop: { x: 580, y: 773, width: 202.942, height: 202.942 },
    compact: { x: 27, y: 68, width: 23 },
  },
  {
    id: 'yellow-top-right',
    nodeId: '141:12826',
    file: 'bob13mini.png',
    status: 'ready',
    desktop: { x: 1707, y: 271, width: 144.964, height: 136.592 },
    compact: { x: 80, y: 32, width: 15 },
  },
  {
    id: 'purple-top-left',
    nodeId: '141:12829',
    file: 'bob22.png',
    status: 'ready',
    desktop: { x: 133, y: 210, width: 93.288, height: 94.084 },
    compact: { x: 8, y: 31, width: 13 },
  },
  {
    id: 'purple-bottom',
    nodeId: '141:12832',
    file: 'bob18.png',
    status: 'ready',
    desktop: { x: 867, y: 740, width: 93.288, height: 94.084 },
    compact: { x: 43, y: 78, width: 13 },
  },
  {
    id: 'green-spiked-top-right',
    nodeId: '141:12835',
    file: 'bob13.png',
    status: 'ready',
    desktop: { x: 1440, y: 149, width: 200.179, height: 142.669 },
    compact: { x: 67, y: 4, width: 25 },
  },
  {
    id: 'orange-spiked-right',
    nodeId: '141:12836',
    file: 'bob16.png',
    status: 'ready',
    desktop: { x: 1623.75, y: 662.155, width: 185.932, height: 190.329 },
    compact: { x: 80, y: 57, width: 19 },
  },
  {
    id: 'orange-spiked-top',
    nodeId: '141:12840',
    file: 'hero-13-orange-spiked-top.png',
    // bob12.png includes unrelated pixels and has the wrong orientation.
    // Keep the reference slot disabled until a clean matching export exists.
    status: 'manual-review',
    desktop: { x: 735, y: 67, width: 247.326, height: 246.938 },
    compact: { x: 38, y: 10, width: 24 },
  },
] as const satisfies readonly HeroObject[];
