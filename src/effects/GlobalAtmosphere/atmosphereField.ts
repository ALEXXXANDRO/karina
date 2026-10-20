/** Natural dimensions of the unmodified export from Figma node 185:75. */
export const referenceTile = { width: 688, height: 664.363 } as const;

export function wrap(value: number, period: number) {
  return ((value % period) + period) % period;
}

/** Factors are dimensionless fractions of the real document scroll in CSS px. */
export function getParallaxY(
  baseY: number, scrollY: number, scrollFactor: number, period: number, cursorOffset = 0,
) {
  return wrap(baseY - scrollY * scrollFactor + cursorOffset, period);
}

/** Include adjacent artwork tiles while any portion is inside the viewport. */
export function getTilePositions(
  width: number, height: number, tileWidth: number, tileHeight: number,
  scrollY: number, scrollFactor: number, cursorX = 0, cursorY = 0,
) {
  if (width <= 0 || height <= 0 || tileWidth <= 0 || tileHeight <= 0) return [];
  const startX = wrap(cursorX, tileWidth) - tileWidth;
  const startY = getParallaxY(0, scrollY, scrollFactor, tileHeight, cursorY) - tileHeight;
  const positions: { x: number; y: number }[] = [];
  for (let y = startY; y < height; y += tileHeight) {
    for (let x = startX; x < width; x += tileWidth) positions.push({ x, y });
  }
  return positions;
}
