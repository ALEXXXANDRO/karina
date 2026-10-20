import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { portfolioEffects } from '../config';
import { useMotionEnabled } from '../useMotionEnabled';
import './TravelerBean.css';

interface Peek {
  readonly top: number;
  readonly visible: boolean;
  readonly scared: boolean;
}

type TravelerStyle = CSSProperties & {
  '--traveler-size': string;
  '--traveler-hidden-part': string;
};

function TravelerBean() {
  const settings = portfolioEffects.traveler;
  const enabled = useMotionEnabled(settings.enabled, `(min-width: ${settings.minWidth}px)`);
  const [peek, setPeek] = useState<Peek | null>(null);
  const seenRef = useRef(new Set<string>());
  const lastPeekRef = useRef(-Infinity);

  useEffect(() => {
    if (!enabled || !('IntersectionObserver' in window)) {
      setPeek(null);
      return;
    }
    const sections = Array.from(document.querySelectorAll<HTMLElement>('.project-intro'));
    const hero = document.querySelector('.hero');
    let timer: number | undefined;
    let pending: HTMLElement | undefined;
    let current: Peek | null = null;
    let safetyObserver: IntersectionObserver | undefined;
    const height = settings.size * 83 / 104;

    function suppress() {
      window.clearTimeout(timer);
      timer = undefined;
      safetyObserver?.disconnect();
      current = null;
      setPeek(null);
    }

    function hide(scared = false) {
      window.clearTimeout(timer);
      timer = undefined;
      if (!current?.visible) return;
      current = { ...current, visible: false, scared };
      setPeek(current);
    }

    function findSafeTop(boundary: number) {
      const visibleWidth = settings.size * settings.visibleFraction;
      const textAndControls = Array.from(document.querySelectorAll(
        'h1, h2, p, dt, dd, a, button, input, select, textarea, [role="button"]',
      )).map((element) => element.getBoundingClientRect());
      const candidates = [boundary + 16, boundary - height - 16, innerHeight * 0.35, innerHeight * 0.65];
      for (const candidate of candidates) {
        const top = Math.max(24, Math.min(innerHeight - height - 24, candidate));
        const overlaps = textAndControls.some((rect) => rect.right > innerWidth - visibleWidth - 12
          && rect.left < innerWidth && rect.bottom > top - 12 && rect.top < top + height + 12);
        if (!overlaps) return top;
      }
      return null;
    }

    function show(section: HTMLElement) {
      if (document.hidden || current?.visible || seenRef.current.has(section.id)) return;
      const bounds = section.getBoundingClientRect();
      if (bounds.bottom <= 0 || bounds.top >= innerHeight) return;
      if (hero && hero.getBoundingClientRect().bottom > 0) {
        pending = section;
        return;
      }
      if (performance.now() - lastPeekRef.current < settings.cooldownMs) return;
      const top = findSafeTop(bounds.top);
      if (top === null) return;
      seenRef.current.add(section.id);
      lastPeekRef.current = performance.now();
      current = { top, visible: true, scared: false };
      setPeek(current);
      timer = window.setTimeout(() => hide(), settings.stayMs);
      // Watch the peek area itself: scrolling text/controls must never pass under it.
      // This also guards the short retreat transition, without a scroll listener.
      safetyObserver?.disconnect();
      safetyObserver = new IntersectionObserver((entries) => {
        if (current && entries.some((entry) => entry.isIntersecting && entry.intersectionRatio > 0)) {
          suppress();
        }
      }, {
        rootMargin: `-${top - 12}px 0px -${innerHeight - top - height - 12}px -${
          innerWidth - settings.size * settings.visibleFraction - 12
        }px`,
      });
      document.querySelectorAll('h1, h2, p, dt, dd, a, button, input, select, textarea, [role="button"]')
        .forEach((element) => safetyObserver?.observe(element));
    }

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === hero) {
          // Touching the viewport boundary has ratio 0 and is not visible Hero.
          if (entry.isIntersecting && entry.intersectionRatio > 0) {
            suppress();
          } else if (pending) {
            const candidate = pending;
            pending = undefined;
            show(candidate);
          }
        } else if (entry.isIntersecting && entry.intersectionRatio >= 0.1
          && entry.target instanceof HTMLElement) {
          show(entry.target);
        }
      }
    }, { threshold: [0, 0.1] });
    sections.forEach((section) => observer.observe(section));
    if (hero) observer.observe(hero);

    function scare(event: PointerEvent) {
      if (!current?.visible || event.pointerType !== 'mouse') return;
      const centerX = innerWidth - settings.size * settings.visibleFraction / 2;
      if (Math.hypot(event.clientX - centerX, event.clientY - current.top - height / 2)
        < settings.cursorRadius) hide(true);
    }
    const visibility = () => { if (document.hidden) hide(); };
    const resize = () => hide();
    window.addEventListener('pointermove', scare, { passive: true });
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      observer.disconnect();
      safetyObserver?.disconnect();
      window.clearTimeout(timer);
      window.removeEventListener('pointermove', scare);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [enabled, settings]);

  if (!enabled) return null;
  const style: TravelerStyle = {
    top: peek?.top ?? 24,
    visibility: peek ? 'visible' : 'hidden',
    '--traveler-size': `${settings.size}px`,
    '--traveler-hidden-part': `${(1 - settings.visibleFraction) * 100}%`,
  };

  return (
    <div
      className="traveler-bean"
      style={style}
      data-peeking={peek?.visible ? 'true' : undefined}
      data-scared={peek?.scared ? 'true' : undefined}
      aria-hidden="true"
    >
      <img
        src={`${import.meta.env.BASE_URL}${settings.asset}`}
        alt=""
        width={104}
        height={83}
        draggable={false}
      />
    </div>
  );
}

export default TravelerBean;
