import { useCallback, useEffect, useRef } from 'react';

export const beanInteraction = {
  radius: 150,
  maxDistance: 30,
  maxTilt: 7,
  responseTimeMs: 100,
  returnTimeMs: 220,
} as const;

export function useBeanInteraction() {
  const containerRef = useRef<HTMLDivElement>(null);
  const wakeRef = useRef<() => void>(() => {});
  const requestUpdate = useCallback(() => wakeRef.current(), []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine)');
    const beans = Array.from(container.querySelectorAll<HTMLElement>('.hero__object'))
      .map((element) => ({ element, x: 0, y: 0, tilt: 0 }));
    let frame = 0;
    let previousTime = 0;
    let pointer = { x: 0, y: 0, active: false };

    function update(time: number) {
      frame = 0;
      const delta = previousTime ? Math.min(time - previousTime, 50) : 16;
      previousTime = time;
      const enabled = !reducedMotion.matches && finePointer.matches && pointer.active;
      // Read stable positioning wrappers before writing any transforms.
      const bounds = beans.map(({ element }) => element.getBoundingClientRect());
      let settling = false;

      beans.forEach((bean, index) => {
        const rect = bounds[index];
        let targetX = 0;
        let targetY = 0;
        let targetTilt = 0;
        if (enabled && bean.element.dataset.spinning !== 'true' && rect) {
          const dx = rect.x + rect.width / 2 - pointer.x;
          const dy = rect.y + rect.height / 2 - pointer.y;
          const distance = Math.hypot(dx, dy);
          const proximity = Math.max(0, 1 - distance / beanInteraction.radius);
          const force = beanInteraction.maxDistance * proximity * proximity;
          // A deterministic direction also handles the cursor at the exact center.
          targetX = force * (distance > 0.1 ? dx / distance : Math.SQRT1_2);
          targetY = force * (distance > 0.1 ? dy / distance : -Math.SQRT1_2);
          targetTilt = targetX / beanInteraction.maxDistance * beanInteraction.maxTilt;
        }

        const returning = targetX === 0 && targetY === 0;
        const smoothing = 1 - Math.exp(-delta / (
          returning ? beanInteraction.returnTimeMs : beanInteraction.responseTimeMs
        ));
        bean.x += (targetX - bean.x) * smoothing;
        bean.y += (targetY - bean.y) * smoothing;
        bean.tilt += (targetTilt - bean.tilt) * smoothing;
        if (Math.abs(targetX - bean.x) + Math.abs(targetY - bean.y)
          + Math.abs(targetTilt - bean.tilt) < 0.02) {
          bean.x = targetX;
          bean.y = targetY;
          bean.tilt = targetTilt;
        } else {
          settling = true;
        }
        bean.element.style.setProperty('--evade-x', `${bean.x}px`);
        bean.element.style.setProperty('--evade-y', `${bean.y}px`);
        bean.element.style.setProperty('--evade-tilt', `${bean.tilt}deg`);
      });
      if (settling) schedule();
      else previousTime = 0;
    }

    function schedule() {
      if (!frame && !reducedMotion.matches) frame = requestAnimationFrame(update);
    }

    function resetPointer() {
      pointer.active = false;
      schedule();
    }

    function movePointer(event: PointerEvent) {
      pointer = { x: event.clientX, y: event.clientY, active: event.pointerType === 'mouse' };
      schedule();
    }

    function resetPreferences() {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
      pointer.active = false;
      beans.forEach((bean) => {
        bean.x = bean.y = bean.tilt = 0;
        bean.element.style.setProperty('--evade-x', '0px');
        bean.element.style.setProperty('--evade-y', '0px');
        bean.element.style.setProperty('--evade-tilt', '0deg');
        if (reducedMotion.matches) delete bean.element.dataset.spinning;
      });
    }

    wakeRef.current = schedule;
    window.addEventListener('pointermove', movePointer, { passive: true });
    document.documentElement.addEventListener('pointerleave', resetPointer);
    window.addEventListener('blur', resetPointer);
    window.addEventListener('scroll', resetPointer, { passive: true });
    window.addEventListener('resize', resetPointer);
    reducedMotion.addEventListener('change', resetPreferences);
    finePointer.addEventListener('change', resetPreferences);

    return () => {
      wakeRef.current = () => {};
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', movePointer);
      document.documentElement.removeEventListener('pointerleave', resetPointer);
      window.removeEventListener('blur', resetPointer);
      window.removeEventListener('scroll', resetPointer);
      window.removeEventListener('resize', resetPointer);
      reducedMotion.removeEventListener('change', resetPreferences);
      finePointer.removeEventListener('change', resetPreferences);
    };
  }, []);

  return { containerRef, requestUpdate };
}
