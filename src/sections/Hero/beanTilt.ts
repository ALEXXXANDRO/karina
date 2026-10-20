interface TiltBounds {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

export function getBeanTilt(
  point: { readonly x: number; readonly y: number },
  bounds: TiltBounds,
  limits: { readonly maxRotateX: number; readonly maxRotateY: number },
) {
  if (bounds.width <= 0 || bounds.height <= 0) return { x: 0, y: 0 };
  const horizontal = Math.max(-1, Math.min(1, (point.x - bounds.left) / bounds.width * 2 - 1));
  const vertical = Math.max(-1, Math.min(1, (point.y - bounds.top) / bounds.height * 2 - 1));
  return { x: -vertical * limits.maxRotateX, y: horizontal * limits.maxRotateY };
}

/** Treat smoothing as the blend per 60Hz frame, preserving speed on other displays. */
export function getBeanTiltBlend(smoothing: number, deltaMs: number) {
  const blend = Math.max(0.001, Math.min(1, smoothing));
  return 1 - (1 - blend) ** (Math.max(0, Math.min(50, deltaMs)) / (1000 / 60));
}
