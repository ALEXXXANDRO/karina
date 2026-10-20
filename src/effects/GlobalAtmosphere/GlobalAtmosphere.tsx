import { useEffect, useRef } from 'react';
import { portfolioEffects } from '../config';
import { createGraphicField, getGraphicAngle, getParallaxY, getVisibleCopies, wrap } from './atmosphereField';
import './GlobalAtmosphere.css';

function GlobalAtmosphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const settings = portfolioEffects.globalAtmosphere;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!settings.enabled || !canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    const motion = window.matchMedia('(prefers-reduced-motion: no-preference)');
    const mouse = window.matchMedia(`(min-width: ${settings.mobileBreakpoint + 1}px) and (hover: hover) and (pointer: fine)`);
    const elements = createGraphicField(settings);
    const mobileElements = createGraphicField({
      ...settings, strokeCount: settings.mobileStrokeCount, markerCount: settings.mobileMarkerCount,
    });
    let width = 0;
    let height = 0;
    let dpr = 1;
    let rawDpr = 0;
    let resolution: MediaQueryList | undefined;
    let frame = 0;
    let previousTime = 0;
    const cursor = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };

    const paint = () => {
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const scroll = motion.matches ? window.scrollY : 0;
      const mobile = width <= settings.mobileBreakpoint || !mouse.matches;
      context.strokeStyle = settings.inkColor;
      context.lineCap = 'butt';
      for (const element of mobile ? mobileElements : elements) {
        const extent = element.size / 2 + element.lineWidth;
        const x = wrap(element.x * width + cursor.x * settings.cursorOffset, width);
        const y = getParallaxY(element.y * settings.tileHeight, scroll, settings.scrollFactor,
          settings.tileHeight, cursor.y * settings.cursorOffset);
        context.globalAlpha = settings.opacity * element.opacity;
        context.lineWidth = element.lineWidth;
        // Neighbouring copies preserve complete strokes at the tile edges.
        const xs = getVisibleCopies(x, width, width, extent);
        for (const cy of getVisibleCopies(y, settings.tileHeight, height, extent)) {
          for (const cx of xs) {
            context.save();
            context.translate(cx, cy);
            context.rotate(getGraphicAngle(element, scroll, settings, motion.matches));
            const half = element.size / 2;
            context.beginPath();
            context.moveTo(-half, 0);
            context.lineTo(half, 0);
            if (element.kind !== 'stroke') {
              context.moveTo(0, -half);
              context.lineTo(0, half);
            }
            if (element.kind === 'registration') {
              context.moveTo(half * 0.55, 0);
              context.arc(0, 0, half * 0.55, 0, Math.PI * 2);
            }
            context.stroke();
            context.restore();
          }
        }
      }
      context.globalAlpha = 1;
    };
    const render = (time: number) => {
      frame = 0;
      if (document.hidden || !width || !height) { previousTime = 0; return; }
      if (!motion.matches || !mouse.matches) cursor.x = cursor.y = target.x = target.y = 0;
      const delta = previousTime ? Math.min(50, time - previousTime) : 16;
      previousTime = time;
      const smoothing = 1 - Math.exp(-delta / Math.max(1, settings.cursorResponseMs));
      cursor.x += (target.x - cursor.x) * smoothing;
      cursor.y += (target.y - cursor.y) * smoothing;
      const settling = Math.abs(cursor.x - target.x) + Math.abs(cursor.y - target.y) > 0.001;
      if (!settling) { cursor.x = target.x; cursor.y = target.y; }
      paint();
      if (settling) frame = window.requestAnimationFrame(render);
      else previousTime = 0;
    };
    const schedule = () => {
      if (!frame && !document.hidden) frame = window.requestAnimationFrame(render);
    };
    const scroll = () => { if (motion.matches) schedule(); };
    const move = (event: PointerEvent) => {
      if (!motion.matches || !mouse.matches || event.pointerType !== 'mouse') return;
      target.x = Math.max(-1, Math.min(1, event.clientX / Math.max(1, width) * 2 - 1));
      target.y = Math.max(-1, Math.min(1, event.clientY / Math.max(1, height) * 2 - 1));
      schedule();
    };
    const resetCursor = () => { target.x = target.y = 0; schedule(); };
    const preferences = () => {
      cursor.x = cursor.y = target.x = target.y = 0;
      schedule();
    };
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, settings.maxDpr);
      if (rawDpr !== window.devicePixelRatio) {
        rawDpr = window.devicePixelRatio;
        resolution?.removeEventListener('change', resize);
        resolution = window.matchMedia(`(resolution: ${rawDpr}dppx)`);
        resolution.addEventListener('change', resize);
      }
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      preferences();
    };
    const visibility = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
      preferences();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('resize', resize);
    window.addEventListener('blur', resetCursor);
    document.documentElement.addEventListener('pointerleave', resetCursor);
    document.addEventListener('visibilitychange', visibility);
    motion.addEventListener('change', preferences);
    mouse.addEventListener('change', preferences);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      resolution?.removeEventListener('change', resize);
      window.removeEventListener('scroll', scroll);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('resize', resize);
      window.removeEventListener('blur', resetCursor);
      document.documentElement.removeEventListener('pointerleave', resetCursor);
      document.removeEventListener('visibilitychange', visibility);
      motion.removeEventListener('change', preferences);
      mouse.removeEventListener('change', preferences);
    };
  }, [settings]);

  return settings.enabled ? <canvas className="global-atmosphere" ref={canvasRef} aria-hidden="true" /> : null;
}

export default GlobalAtmosphere;
