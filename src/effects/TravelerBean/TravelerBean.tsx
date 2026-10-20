import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { portfolioEffects } from '../config';
import { useMotionEnabled } from '../useMotionEnabled';
import './TravelerBean.css';

type Side = 'right' | 'left';

interface Peek {
  readonly top: number;
  readonly side: Side;
  readonly visible: boolean;
  readonly preparing: boolean;
  readonly curious: boolean;
  readonly shivering: boolean;
  readonly spinning: boolean;
}

type TravelerStyle = CSSProperties & Record<`--traveler-${string}`, string>;
const protectedSelector = 'h1, h2, p, dt, dd, a, button, input, select, textarea, [role="button"]';

function TravelerBean() {
  const settings = portfolioEffects.traveler;
  const enabled = useMotionEnabled(settings.enabled, `(min-width: ${settings.minWidth}px)`);
  const [peek, setPeek] = useState<Peek | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const actionsRef = useRef({ tumble: () => {}, focus: () => {}, blur: () => {} });
  const seenRef = useRef(new Set<string>());
  const lastPeekRef = useRef(-Infinity);
  const nextSideRef = useRef<Side>('right');

  useEffect(() => {
    if (!enabled || !('IntersectionObserver' in window)) {
      setPeek(null);
      return;
    }
    const root = rootRef.current;
    const button = buttonRef.current;
    if (!root || !button) return;
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
    const sections = Array.from(document.querySelectorAll<HTMLElement>('.project-intro'));
    const hero = document.querySelector('.hero');
    const height = settings.size * 83 / 104;
    // Reserve the largest rotated/stretched silhouette, including its entire jump.
    const maxScale = Math.max(2 - settings.landingSquash, 2 - settings.launchSquash, settings.stretch);
    const halfDiagonal = Math.hypot(settings.size, height) / 2 * maxScale;
    const above = settings.jumpHeight + halfDiagonal - height / 2
      + settings.floatDistance + settings.safetyMargin;
    const below = halfDiagonal - height / 2 + settings.floatDistance
      + settings.landingBounce + settings.safetyMargin;
    const reach = settings.jumpInset + settings.size / 2 + halfDiagonal
      + settings.curiosityDistance + settings.safetyMargin;
    let timer: number | undefined;
    let hoverTimer: number | undefined;
    let pointerFrame = 0;
    let entranceFrame = 0;
    let pending: HTMLElement | undefined;
    let current: Peek | null = null;
    let safetyObserver: IntersectionObserver | undefined;
    let pointer: { x: number; y: number } | null = null;
    let reaction = { shift: 0, tilt: 0 };
    let hideDelay: number = settings.stayMs;

    function publish(next: Peek | null) {
      current = next;
      setPeek(next);
    }

    function clearReaction() {
      window.clearTimeout(hoverTimer);
      hoverTimer = undefined;
      if (pointerFrame) cancelAnimationFrame(pointerFrame);
      pointerFrame = 0;
      reaction = { shift: 0, tilt: 0 };
      root?.style.setProperty('--traveler-curiosity-shift', '0px');
      root?.style.setProperty('--traveler-curiosity-tilt', '0deg');
    }

    function suppress() {
      window.clearTimeout(timer);
      timer = undefined;
      if (entranceFrame) cancelAnimationFrame(entranceFrame);
      entranceFrame = 0;
      clearReaction();
      safetyObserver?.disconnect();
      publish(null);
      button?.blur();
    }

    function hide() {
      window.clearTimeout(timer);
      timer = undefined;
      if (!current?.visible || current.spinning) return;
      clearReaction();
      publish({ ...current, visible: false, curious: false, shivering: false });
      button?.blur();
      // Let floating continue through the exit, then stop it outside the viewport.
      timer = window.setTimeout(() => {
        if (current && !current.visible) suppress();
      }, settings.exitMs);
    }

    function armHide(delay: number) {
      window.clearTimeout(timer);
      hideDelay = delay;
      // Keep the keyboard target available while it has focus.
      if (current?.visible && !current.spinning && !button?.matches(':focus-visible')) {
        timer = window.setTimeout(hide, delay);
      }
    }

    function protectedElements() {
      return Array.from(document.querySelectorAll(protectedSelector))
        .filter((element) => !element.closest('.traveler-bean'));
    }

    function findSafeTop(boundary: number, side: Side) {
      const minTop = settings.viewportMargin + above;
      const maxTop = innerHeight - settings.viewportMargin - height - below;
      if (maxTop < minTop) return null;
      const rects = protectedElements().map((element) => element.getBoundingClientRect());
      const candidates = [boundary + 16, boundary - height - 16, innerHeight * 0.35, innerHeight * 0.65];
      for (const candidate of candidates) {
        const top = Math.max(minTop, Math.min(maxTop, candidate));
        const overlaps = rects.some((rect) => (
          side === 'right' ? rect.right > innerWidth - reach && rect.left < innerWidth
            : rect.left < reach && rect.right > 0
        ) && rect.bottom > top - above && rect.top < top + height + below);
        if (!overlaps) return top;
      }
      return null;
    }

    function show(section: HTMLElement) {
      if (document.hidden || current?.visible || current?.preparing || seenRef.current.has(section.id)) return;
      const bounds = section.getBoundingClientRect();
      if (bounds.bottom <= 0 || bounds.top >= innerHeight) return;
      if (hero && hero.getBoundingClientRect().bottom > 0) {
        pending = section;
        return;
      }
      if (performance.now() - lastPeekRef.current < settings.cooldownMs) return;
      const side = nextSideRef.current;
      const top = findSafeTop(bounds.top, side);
      if (top === null) return;
      seenRef.current.add(section.id);
      lastPeekRef.current = performance.now();
      nextSideRef.current = side === 'right' ? 'left' : 'right';
      clearReaction();
      publish({ top, side, visible: false, preparing: true, curious: false, shivering: false, spinning: false });
      // Commit the new side offscreen before transitioning into view. This avoids
      // interpolating across the page when successive appearances change sides.
      entranceFrame = requestAnimationFrame(() => {
        entranceFrame = requestAnimationFrame(() => {
          entranceFrame = 0;
          if (!current?.preparing) return;
          publish({ ...current, visible: true, preparing: false });
          armHide(settings.stayMs);
        });
      });
      safetyObserver?.disconnect();
      const leftMargin = side === 'right' ? innerWidth - reach : 0;
      const rightMargin = side === 'left' ? innerWidth - reach : 0;
      safetyObserver = new IntersectionObserver((entries) => {
        if (current && entries.some((entry) => entry.isIntersecting && entry.intersectionRatio > 0)) {
          suppress();
        }
      }, {
        rootMargin: `-${top - above}px -${rightMargin}px -${innerHeight - top - height - below}px -${leftMargin}px`,
      });
      protectedElements().forEach((element) => safetyObserver?.observe(element));
    }

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === hero) {
          if (entry.isIntersecting && entry.intersectionRatio > 0) suppress();
          else if (pending) {
            const candidate = pending;
            pending = undefined;
            show(candidate);
          }
        } else if (entry.isIntersecting && entry.intersectionRatio >= 0.1
          && entry.target instanceof HTMLElement) show(entry.target);
      }
    }, { threshold: [0, 0.1] });
    sections.forEach((section) => observer.observe(section));
    if (hero) observer.observe(hero);

    function stopCuriosity() {
      if (current?.spinning) return;
      clearReaction();
      if (current?.curious || current?.shivering) {
        publish({ ...current, curious: false, shivering: false });
      }
    }

    function updateCuriosity() {
      if (!current?.visible || current.spinning) return;
      if (!canHover.matches || !pointer) {
        stopCuriosity();
        return;
      }
      const sign = current.side === 'right' ? 1 : -1;
      const centerX = current.side === 'right'
        ? innerWidth - settings.size * (settings.visibleFraction - 0.5)
        : settings.size * (settings.visibleFraction - 0.5);
      const dy = pointer.y - current.top - height / 2;
      const distance = Math.hypot(pointer.x - centerX, dy);
      const strength = Math.max(0, 1 - distance / settings.cursorRadius);
      if (!strength) {
        stopCuriosity();
        return;
      }
      if (!current.curious) {
        publish({ ...current, curious: true });
        hoverTimer = window.setTimeout(() => {
          hoverTimer = undefined;
          if (current?.visible && current.curious && !current.spinning) {
            publish({ ...current, shivering: true });
          }
        }, settings.hoverDelayMs);
      }
      reaction = {
        shift: -sign * settings.curiosityDistance * strength,
        tilt: -sign * Math.max(-1, Math.min(1, dy / (height / 2))) * settings.curiosityTilt * strength,
      };
      if (!pointerFrame) {
        pointerFrame = requestAnimationFrame(() => {
          pointerFrame = 0;
          root?.style.setProperty('--traveler-curiosity-shift', `${reaction.shift}px`);
          root?.style.setProperty('--traveler-curiosity-tilt', `${reaction.tilt}deg`);
        });
      }
    }

    function movePointer(event: PointerEvent) {
      pointer = event.pointerType === 'mouse' ? { x: event.clientX, y: event.clientY } : null;
      updateCuriosity();
    }

    function tumble() {
      if (!current?.visible || current.spinning
        || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      window.clearTimeout(timer);
      window.clearTimeout(hoverTimer);
      hoverTimer = undefined;
      if (pointerFrame) cancelAnimationFrame(pointerFrame);
      pointerFrame = 0;
      // Freeze the current curiosity pose; its transform belongs to a separate layer.
      publish({ ...current, spinning: true, curious: false, shivering: false });
    }

    function finishTumble(event: AnimationEvent) {
      if (event.target !== button || event.animationName !== 'traveler-tumble' || !current?.spinning) return;
      publish({ ...current, spinning: false });
      armHide(settings.afterClickMs);
      updateCuriosity();
    }

    actionsRef.current = {
      tumble,
      focus: () => { if (button?.matches(':focus-visible')) window.clearTimeout(timer); },
      blur: () => armHide(hideDelay),
    };
    const leave = () => { pointer = null; stopCuriosity(); };
    const visibility = () => { if (document.hidden) suppress(); };
    window.addEventListener('pointermove', movePointer, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    window.addEventListener('blur', leave);
    window.addEventListener('resize', suppress);
    document.addEventListener('visibilitychange', visibility);
    canHover.addEventListener('change', leave);
    button.addEventListener('animationend', finishTumble);
    button.addEventListener('animationcancel', finishTumble);
    return () => {
      actionsRef.current = { tumble: () => {}, focus: () => {}, blur: () => {} };
      observer.disconnect();
      safetyObserver?.disconnect();
      window.clearTimeout(timer);
      if (entranceFrame) cancelAnimationFrame(entranceFrame);
      clearReaction();
      window.removeEventListener('pointermove', movePointer);
      document.documentElement.removeEventListener('pointerleave', leave);
      window.removeEventListener('blur', leave);
      window.removeEventListener('resize', suppress);
      document.removeEventListener('visibilitychange', visibility);
      canHover.removeEventListener('change', leave);
      button.removeEventListener('animationend', finishTumble);
      button.removeEventListener('animationcancel', finishTumble);
    };
  }, [enabled, settings]);

  if (!enabled) return null;
  const hiddenPart = (1 - settings.visibleFraction) * settings.size;
  const style: TravelerStyle = {
    visibility: peek && !peek.preparing ? 'visible' : 'hidden',
    '--traveler-top': `${peek?.top ?? 0}px`,
    '--traveler-size': `${settings.size}px`,
    '--traveler-hidden-part': `${hiddenPart}px`,
    '--traveler-enter-ms': `${settings.enterMs}ms`,
    '--traveler-enter-spring': `${settings.enterSpring}`,
    '--traveler-exit-ms': `${settings.exitMs}ms`,
    '--traveler-float-distance': `${settings.floatDistance}px`,
    '--traveler-float-tilt': `${settings.floatTilt}deg`,
    '--traveler-float-ms': `${settings.floatMs}ms`,
    '--traveler-curiosity-ms': `${settings.curiosityMs}ms`,
    '--traveler-jitter-distance': `${settings.jitterDistance}px`,
    '--traveler-jitter-tilt': `${settings.jitterTilt}deg`,
    '--traveler-jitter-ms': `${settings.jitterMs}ms`,
    '--traveler-tumble-ms': `${settings.tumbleMs}ms`,
    '--traveler-jump-height': `${settings.jumpHeight}px`,
    '--traveler-jump-x': `${hiddenPart + settings.jumpInset}px`,
    '--traveler-press-distance': `${settings.pressDistance}px`,
    '--traveler-launch-squash': `${settings.launchSquash}`,
    '--traveler-landing-squash': `${settings.landingSquash}`,
    '--traveler-stretch': `${settings.stretch}`,
    '--traveler-landing-bounce': `${settings.landingBounce}px`,
  };

  return (
    <div
      className="traveler-bean"
      ref={rootRef}
      style={style}
      data-side={peek?.side ?? 'right'}
      data-preparing={peek?.preparing ? 'true' : undefined}
      data-present={peek ? 'true' : undefined}
      data-peeking={peek?.visible ? 'true' : undefined}
      data-curious={peek?.curious ? 'true' : undefined}
      data-shivering={peek?.shivering ? 'true' : undefined}
      data-spinning={peek?.spinning ? 'true' : undefined}
      aria-hidden={peek?.visible ? undefined : true}
    >
      <div className="traveler-bean__anchor">
        <div className="traveler-bean__appearance">
          <div className="traveler-bean__float">
            <div className="traveler-bean__curiosity">
              <div className="traveler-bean__jitter">
                <button
                  ref={buttonRef}
                  type="button"
                  className="traveler-bean__button"
                  aria-label="Make the traveling bean jump and tumble"
                  disabled={!peek?.visible}
                  tabIndex={peek?.visible ? 0 : -1}
                  onClick={() => actionsRef.current.tumble()}
                  onFocus={() => actionsRef.current.focus()}
                  onBlur={() => actionsRef.current.blur()}
                >
                  <img
                    src={`${import.meta.env.BASE_URL}${settings.asset}`}
                    alt=""
                    width={104}
                    height={83}
                    draggable={false}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TravelerBean;
