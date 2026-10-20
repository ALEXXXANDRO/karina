export type GraphicKind = 'stroke' | 'plus' | 'cross' | 'registration';

export interface GraphicElement {
  readonly x: number;
  readonly y: number;
  readonly kind: GraphicKind;
  readonly size: number;
  readonly lineWidth: number;
  readonly opacity: number;
  readonly angle: number;
  readonly rotation: {
    readonly rank: number;
    readonly phase: number;
    readonly intensity: number;
    readonly speed: number;
  } | null;
}

export interface GraphicFieldOptions {
  readonly strokeCount: number;
  readonly markerCount: number;
  readonly minStrokeLength: number;
  readonly maxStrokeLength: number;
  readonly markerSize: readonly [number, number];
  readonly lineWidth: readonly [number, number];
}

export function wrap(value: number, period: number) {
  return ((value % period) + period) % period;
}

/** Factors are dimensionless fractions of the real document scroll in CSS px. */
export function getParallaxY(
  baseY: number, scrollY: number, scrollFactor: number, period: number, cursorOffset = 0,
) {
  return wrap(baseY - scrollY * scrollFactor + cursorOffset, period);
}

/** Include neighbouring copies until the entire rotated mark is outside view. */
export function getVisibleCopies(position: number, period: number, viewportSize: number, extent: number) {
  const center = wrap(position, period);
  const first = Math.ceil((-extent - center) / period);
  const last = Math.floor((viewportSize + extent - center) / period);
  return Array.from({ length: Math.max(0, last - first + 1) }, (_, index) => center + (first + index) * period);
}

/** Separate deterministic streams keep mobile subsets and resized marks stable. */
export function createGraphicField(options: GraphicFieldOptions, seed = 0x5a17c0de): GraphicElement[] {
  const create = (count: number, strokes: boolean, salt: number) => {
    let state = (seed ^ salt) >>> 0;
    const random = () => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state / 4294967296;
    };
    const elements: GraphicElement[] = [];
    for (let index = 0; index < Math.max(0, Math.floor(count)); index++) {
      let x = 0;
      let y = 0;
      for (let attempt = 0; attempt < 50; attempt++) {
        const candidateX = 0.02 + random() * 0.96;
        const candidateY = 0.015 + random() * 0.97;
        // Leave generous quiet areas around the reference title/copy regions.
        const quiet = (candidateX > 0.07 && candidateX < 0.48 && candidateY > 0.06 && candidateY < 0.23)
          || (candidateX > 0.12 && candidateX < 0.88 && candidateY > 0.38 && candidateY < 0.64)
          || (candidateX > 0.07 && candidateX < 0.4 && candidateY > 0.73 && candidateY < 0.92);
        // A rejected final candidate must never fill a quiet area at high density.
        if (quiet) continue;
        x = candidateX;
        y = candidateY;
        const crowded = elements.some((other) => Math.hypot((x - other.x) * 1.78, y - other.y) < 0.09);
        if (!crowded) break;
      }
      const kind: GraphicKind = strokes ? 'stroke'
        : index % 3 === 2 ? 'registration' : index % 2 ? 'cross' : 'plus';
      const size = strokes ? [options.minStrokeLength, options.maxStrokeLength] : options.markerSize;
      elements.push({
        x, y, kind,
        size: size[0] + random() * (size[1] - size[0]),
        lineWidth: options.lineWidth[0] + random() * (options.lineWidth[1] - options.lineWidth[0]),
        opacity: 0.65 + random() * 0.35,
        angle: strokes ? (random() - 0.5) * Math.PI : kind === 'cross' ? Math.PI / 4 : 0,
        // Low-discrepancy ranks give a stable subset close to the desired ratio.
        // Profiles never depend on time or alter the position generator's stream.
        rotation: strokes ? {
          rank: wrap(index * 0.61803398875 + 0.17, 1),
          phase: wrap(index * 2.39996322973, Math.PI * 2),
          intensity: 0.6 + wrap(index * 0.41421356237 + 0.3, 1) * 0.4,
          speed: 0.7 + wrap(index * 0.73205080757 + 0.1, 1) * 0.6,
        } : null,
      });
    }
    return elements;
  };
  return [...create(options.strokeCount, true, 0x346a), ...create(options.markerCount, false, 0x9b21)];
}

export interface GraphicRotationOptions {
  readonly rotationEnabled: boolean;
  readonly rotatingStrokeRatio: number;
  readonly maxRotationDeg: number;
  readonly rotationScrollPeriod: number;
}

/** Bounded, reversible rotation; scrollY=0 always preserves the original angle. */
export function getGraphicAngle(
  element: GraphicElement,
  scrollY: number,
  options: GraphicRotationOptions,
  motionAllowed = true,
) {
  const profile = element.rotation;
  if (!motionAllowed || !options.rotationEnabled || !profile
    || profile.rank >= Math.max(0, Math.min(1, options.rotatingStrokeRatio))) return element.angle;
  const progress = scrollY / Math.max(1, options.rotationScrollPeriod) * Math.PI * 2 * profile.speed;
  // Subtract the initial phase to start at zero. Half the sine difference is
  // bounded by ±1 even after arbitrarily long scrolling in either direction.
  const offset = (Math.sin(profile.phase + progress) - Math.sin(profile.phase)) * 0.5;
  return element.angle + offset * profile.intensity * options.maxRotationDeg * Math.PI / 180;
}
