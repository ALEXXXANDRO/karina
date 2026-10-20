// Each effect can be disabled independently without changing project data.
export const portfolioEffects = {
  traveler: {
    enabled: true,
    size: 120,
    visibleFraction: 0.5,
    stayMs: 3000,
    cooldownMs: 12000,
    cursorRadius: 110,
    minWidth: 1101,
    asset: 'assets/hero/bob16mini.png',
  },
  titles: {
    enabled: true,
    durationMs: 800,
    offset: 36,
    stretch: 1.08,
  },
  gallery: {
    enabled: true,
    lift: 6,
    maxTilt: 4,
    perspective: 1200,
    followMs: 90,
    returnMs: 180,
  },
} as const;
