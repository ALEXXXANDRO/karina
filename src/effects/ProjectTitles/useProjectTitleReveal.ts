import { useEffect, useRef } from 'react';
import { portfolioEffects } from '../config';
import { useMotionEnabled } from '../useMotionEnabled';
import './ProjectTitles.css';

export function useProjectTitleReveal() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const enabled = useMotionEnabled(portfolioEffects.titles.enabled);

  useEffect(() => {
    const title = titleRef.current;
    if (!title || !enabled || !('IntersectionObserver' in window)) return;
    title.style.setProperty('--title-reveal-duration', `${portfolioEffects.titles.durationMs}ms`);
    title.style.setProperty('--title-reveal-offset', `${portfolioEffects.titles.offset}px`);
    title.style.setProperty('--title-reveal-stretch', `${portfolioEffects.titles.stretch}`);

    let armed = true;
    let playing = false;
    let inside = false;
    let frame = 0;
    const play = () => {
      if (!armed || playing || !inside) return;
      armed = false;
      playing = true;
      title.dataset.titleReveal = 'playing';
    };
    const observer = new IntersectionObserver(([entry]) => {
      inside = Boolean(entry?.isIntersecting
        && entry.intersectionRatio >= portfolioEffects.titles.enterThreshold);
      play();
    }, { threshold: portfolioEffects.titles.enterThreshold });
    // Separate exit boundary prevents animation transforms and small scroll
    // movements at the entrance threshold from rearming the effect.
    const exitObserver = new IntersectionObserver(([entry]) => {
      if (entry && !entry.isIntersecting) armed = true;
    }, { rootMargin: `${portfolioEffects.titles.exitMargin}px 0px`, threshold: 0 });
    const finish = (event: AnimationEvent) => {
      if (event.target !== title || event.animationName !== 'project-title-land') return;
      playing = false;
      delete title.dataset.titleReveal;
      // A fast exit/return during landing is deferred until it has finished.
      if (armed && inside && !frame) {
        frame = window.requestAnimationFrame(() => {
          // Commit the removal before setting the same animation again.
          frame = window.requestAnimationFrame(() => {
            frame = 0;
            play();
          });
        });
      }
    };
    title.addEventListener('animationend', finish);
    observer.observe(title);
    exitObserver.observe(title);
    return () => {
      observer.disconnect();
      exitObserver.disconnect();
      window.cancelAnimationFrame(frame);
      title.removeEventListener('animationend', finish);
      delete title.dataset.titleReveal;
      title.style.removeProperty('--title-reveal-duration');
      title.style.removeProperty('--title-reveal-offset');
      title.style.removeProperty('--title-reveal-stretch');
    };
  }, [enabled]);

  return titleRef;
}
