import { useEffect, useRef } from 'react';
import { portfolioEffects } from '../config';
import { useMotionEnabled } from '../useMotionEnabled';
import './ProjectTitles.css';

export function useProjectTitleReveal() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const playedRef = useRef(false);
  const enabled = useMotionEnabled(portfolioEffects.titles.enabled);

  useEffect(() => {
    const title = titleRef.current;
    if (!title || !enabled || playedRef.current || !('IntersectionObserver' in window)) return;
    title.style.setProperty('--title-reveal-duration', `${portfolioEffects.titles.durationMs}ms`);
    title.style.setProperty('--title-reveal-offset', `${portfolioEffects.titles.offset}px`);
    title.style.setProperty('--title-reveal-stretch', `${portfolioEffects.titles.stretch}`);

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      playedRef.current = true;
      title.dataset.titleReveal = 'playing';
      observer.disconnect();
    }, { threshold: 0.25 });
    const finish = () => { delete title.dataset.titleReveal; };
    title.addEventListener('animationend', finish);
    observer.observe(title);
    return () => {
      observer.disconnect();
      title.removeEventListener('animationend', finish);
      delete title.dataset.titleReveal;
      title.style.removeProperty('--title-reveal-duration');
      title.style.removeProperty('--title-reveal-offset');
      title.style.removeProperty('--title-reveal-stretch');
    };
  }, [enabled]);

  return titleRef;
}
