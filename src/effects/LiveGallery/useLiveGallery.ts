import { useEffect, useRef } from 'react';
import { portfolioEffects } from '../config';
import { useMotionEnabled } from '../useMotionEnabled';
import './LiveGallery.css';

export function useLiveGallery() {
  const galleryRef = useRef<HTMLElement>(null);
  const enabled = useMotionEnabled(portfolioEffects.gallery.enabled, '(hover: hover) and (pointer: fine)');

  useEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery || !enabled) return;
    const settings = portfolioEffects.gallery;
    const cards = Array.from(gallery.querySelectorAll<HTMLElement>('[data-gallery-card]'))
      .map((element) => ({ element, x: 0, y: 0, lift: 0, targetX: 0, targetY: 0, targetLift: 0 }));
    let active: typeof cards[number] | undefined;
    let frame = 0;
    let previousTime = 0;

    cards.forEach(({ element }) => {
      element.dataset.liveCard = 'true';
      element.style.setProperty('--card-perspective', `${settings.perspective}px`);
    });

    function update(time: number) {
      frame = 0;
      const delta = previousTime ? Math.min(time - previousTime, 50) : 16;
      previousTime = time;
      let settling = false;
      cards.forEach((card) => {
        const blend = 1 - Math.exp(-delta / (card === active ? settings.followMs : settings.returnMs));
        card.x += (card.targetX - card.x) * blend;
        card.y += (card.targetY - card.y) * blend;
        card.lift += (card.targetLift - card.lift) * blend;
        if (Math.abs(card.targetX - card.x) + Math.abs(card.targetY - card.y)
          + Math.abs(card.targetLift - card.lift) < 0.01) {
          card.x = card.targetX;
          card.y = card.targetY;
          card.lift = card.targetLift;
        } else settling = true;
        card.element.style.setProperty('--card-tilt-x', `${card.x}deg`);
        card.element.style.setProperty('--card-tilt-y', `${card.y}deg`);
        card.element.style.setProperty('--card-lift', `${card.lift}px`);
      });
      if (settling) schedule();
      else previousTime = 0;
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    function leave() {
      if (active) active.targetX = active.targetY = active.targetLift = 0;
      active = undefined;
      schedule();
    }

    function move(event: PointerEvent) {
      if (event.pointerType !== 'mouse') return;
      const target = event.target instanceof Element ? event.target.closest('[data-gallery-card]') : null;
      const next = cards.find((card) => card.element === target);
      if (!next) {
        leave();
        return;
      }
      if (active !== next) leave();
      active = next;
      const rect = next.element.getBoundingClientRect();
      const baseTop = rect.top + next.lift;
      const horizontal = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
      const vertical = Math.max(-1, Math.min(1, (event.clientY - baseTop) / rect.height * 2 - 1));
      let clearance = Infinity;
      // Restrict lift to the real gap above the slot, including nested grids.
      cards.forEach((other) => {
        if (other === next) return;
        const bounds = other.element.getBoundingClientRect();
        const bottom = bounds.bottom + other.lift;
        if (bounds.left < rect.right && bounds.right > rect.left && bottom <= baseTop + 0.1) {
          clearance = Math.min(clearance, baseTop - bottom);
        }
      });
      next.targetX = -vertical * settings.maxTilt;
      next.targetY = horizontal * settings.maxTilt;
      next.targetLift = Math.min(settings.lift, Math.max(0, clearance - 1));
      schedule();
    }

    gallery.addEventListener('pointermove', move, { passive: true });
    gallery.addEventListener('pointerleave', leave);
    window.addEventListener('blur', leave);
    window.addEventListener('scroll', leave, { passive: true });
    window.addEventListener('resize', leave);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      gallery.removeEventListener('pointermove', move);
      gallery.removeEventListener('pointerleave', leave);
      window.removeEventListener('blur', leave);
      window.removeEventListener('scroll', leave);
      window.removeEventListener('resize', leave);
      cards.forEach(({ element }) => {
        delete element.dataset.liveCard;
        ['--card-perspective', '--card-tilt-x', '--card-tilt-y', '--card-lift']
          .forEach((property) => element.style.removeProperty(property));
      });
    };
  }, [enabled]);

  return galleryRef;
}
