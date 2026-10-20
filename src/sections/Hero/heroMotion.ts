export const beanReactions = ['jelly-bounce', 'crazy-flip', 'wiggle', 'double-hop'] as const;
export type BeanReaction = typeof beanReactions[number];

export const heroMotion = {
  durationsMs: {
    'jelly-bounce': 780,
    'crazy-flip': 900,
    wiggle: 650,
    'double-hop': 1000,
  },
  squashY: 0.86,
  stretchY: 1.16,
  jellyHeight: 28,
  flipHeight: 40,
  hopHeight: 32,
  wiggleAngle: 14,
  party: {
    enabled: true,
    requiredBeans: 5,
    windowMs: 10000,
    durationMs: 4000,
    jumpHeight: 30,
    staggerMs: 35,
  },
} as const;

export function chooseBeanReaction(previous: BeanReaction | null, random = Math.random): BeanReaction {
  const choices = beanReactions.filter((reaction) => reaction !== previous);
  return choices[Math.floor(random() * choices.length)] ?? choices[0] ?? 'jelly-bounce';
}

/** A rolling window of distinct beans; repeated clicks refresh only that bean. */
export class BeanPartyCounter {
  private readonly clicks = new Map<string, number>();

  constructor(private readonly requiredBeans: number, private readonly windowMs: number) {}

  record(id: string, now: number) {
    for (const [bean, time] of this.clicks) {
      if (now - time > this.windowMs) this.clicks.delete(bean);
    }
    this.clicks.set(id, now);
    if (this.clicks.size < this.requiredBeans) return false;
    this.clear();
    return true;
  }

  clear() { this.clicks.clear(); }
}
