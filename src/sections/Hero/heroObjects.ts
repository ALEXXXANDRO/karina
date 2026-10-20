type HeroObjectStatus = 'ready' | 'opaque-background' | 'missing';

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

// Mark an object ready only after replacing its export and checking its alpha.
// Files are intentionally not requested until their status is ready.
export const heroObjects = [
  {
    id: 'blue-bottom-left',
    nodeId: '141:12810',
    file: 'hero-01-blue-bottom-left.png',
    status: 'ready',
    desktop: { x: 316, y: 881, width: 106.220, height: 102.294 },
    compact: { x: 14, y: 82, width: 14 },
  },
  {
    id: 'blue-top',
    nodeId: '141:12811',
    file: 'hero-02-blue-top.png',
    status: 'ready',
    desktop: { x: 1084, y: 176, width: 106.220, height: 102.294 },
    compact: { x: 70, y: 18, width: 14 },
  },
  {
    id: 'blue-bottom-right',
    nodeId: '141:12812',
    file: 'hero-03-blue-bottom-right.png',
    status: 'ready',
    desktop: { x: 1389.49, y: 715.993, width: 103.246, height: 82.308 },
    compact: { x: 77, y: 72, width: 14 },
  },
  {
    id: 'purple-spiked-left',
    nodeId: '141:12813',
    file: 'hero-04-purple-spiked-left.png',
    status: 'opaque-background',
    desktop: { x: 33, y: 589, width: 212.430, height: 208.364 },
    compact: { x: 2, y: 62, width: 20 },
  },
  {
    id: 'yellow-spiked-bottom',
    nodeId: '141:12816',
    file: 'hero-05-yellow-spiked-bottom.png',
    status: 'opaque-background',
    desktop: { x: 1194, y: 799, width: 220.629, height: 220.536 },
    compact: { x: 62, y: 83, width: 22 },
  },
  {
    id: 'yellow-top-left',
    nodeId: '141:12820',
    file: 'hero-06-yellow-top-left.png',
    status: 'ready',
    desktop: { x: 321, y: 104, width: 127.004, height: 160 },
    compact: { x: 15, y: 11, width: 19 },
  },
  {
    id: 'yellow-bottom-left',
    nodeId: '141:12823',
    file: 'hero-07-yellow-bottom-left.png',
    status: 'missing',
    desktop: { x: 580, y: 773, width: 202.942, height: 202.942 },
    compact: { x: 27, y: 68, width: 23 },
  },
  {
    id: 'yellow-top-right',
    nodeId: '141:12826',
    file: 'hero-08-yellow-top-right.png',
    status: 'opaque-background',
    desktop: { x: 1707, y: 271, width: 144.964, height: 136.592 },
    compact: { x: 80, y: 32, width: 15 },
  },
  {
    id: 'purple-top-left',
    nodeId: '141:12829',
    file: 'hero-09-purple-top-left.png',
    status: 'ready',
    desktop: { x: 133, y: 210, width: 93.288, height: 94.084 },
    compact: { x: 8, y: 31, width: 13 },
  },
  {
    id: 'purple-bottom',
    nodeId: '141:12832',
    file: 'hero-10-purple-bottom.png',
    status: 'ready',
    desktop: { x: 867, y: 740, width: 93.288, height: 94.084 },
    compact: { x: 43, y: 78, width: 13 },
  },
  {
    id: 'green-spiked-top-right',
    nodeId: '141:12835',
    file: 'hero-11-green-spiked-top-right.png',
    status: 'missing',
    desktop: { x: 1440, y: 149, width: 200.179, height: 142.669 },
    compact: { x: 67, y: 4, width: 25 },
  },
  {
    id: 'orange-spiked-right',
    nodeId: '141:12836',
    file: 'hero-12-orange-spiked-right.png',
    status: 'opaque-background',
    desktop: { x: 1623.75, y: 662.155, width: 185.932, height: 190.329 },
    compact: { x: 80, y: 57, width: 19 },
  },
  {
    id: 'orange-spiked-top',
    nodeId: '141:12840',
    file: 'hero-13-orange-spiked-top.png',
    status: 'opaque-background',
    desktop: { x: 735, y: 67, width: 247.326, height: 246.938 },
    compact: { x: 38, y: 10, width: 24 },
  },
] as const satisfies readonly HeroObject[];
