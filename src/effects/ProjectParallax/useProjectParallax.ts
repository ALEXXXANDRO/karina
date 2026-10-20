import { useEffect, useRef } from 'react';
import { portfolioEffects } from '../config';
import { useMotionEnabled } from '../useMotionEnabled';

/** Only the image moves; the figure remains the layout and clipping boundary. */
export function useProjectParallax(projectId: string, hasImage: boolean) {
  const ref = useRef<HTMLElement>(null);
  const settings = portfolioEffects.parallax;
  const project = Object.entries(settings.projects).find(([id]) => id === projectId)?.[1];
  const enabled = useMotionEnabled(
    settings.enabled && hasImage && Boolean(project?.enabled),
    `(min-width: ${settings.minWidth}px)`,
  );
  const maxOffset = Math.max(0, Math.min(settings.maxOffset, project?.maxOffset ?? 0));
  const maxOffsetRatio = project?.maxOffsetRatio ?? 0;

  useEffect(() => {
    const card = ref.current;
    const image = card?.querySelector('img');
    if (!enabled || !card || !image || !('IntersectionObserver' in window)) return;

    let visible = false;
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!visible) return;
      const rect = card.getBoundingClientRect();
      if (rect.height <= 0) return;
      const progress = Math.max(-1, Math.min(1,
        (window.innerHeight - 2 * rect.top - rect.height) / (window.innerHeight + rect.height),
      ));
      // Keep the crop proportional to the card on narrower desktop layouts.
      const offset = Math.min(maxOffset, rect.height * maxOffsetRatio);
      const scale = 1 + 2 * offset / rect.height;
      // Reveal the leading edge on entry and the trailing edge on exit.
      // This protects artwork near the top/bottom while it is on screen.
      image.style.transform = `translate3d(0, ${-progress * offset}px, 0) scale(${scale})`;
    };
    const schedule = () => {
      if (visible && !frame) frame = window.requestAnimationFrame(update);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      if (visible) {
        image.style.willChange = 'transform';
        schedule();
      } else {
        window.cancelAnimationFrame(frame);
        frame = 0;
        image.style.removeProperty('will-change');
      }
    });
    observer.observe(card);
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(card);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.cancelAnimationFrame(frame);
      image.style.removeProperty('transform');
      image.style.removeProperty('will-change');
    };
  }, [enabled, maxOffset, maxOffsetRatio]);

  return ref;
}
