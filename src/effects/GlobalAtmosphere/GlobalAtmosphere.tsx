import { useEffect, useRef } from 'react';
import { portfolioEffects } from '../config';
import { getTilePositions, referenceTile } from './atmosphereField';
import marksUrl from './figma-marks.svg';
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
    const artwork = new Image();
    const tile = document.createElement('canvas');
    let loaded = false;
    let tileWidth = 0;
    let tileHeight = 0;
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
      if (!loaded || !tileWidth || !tileHeight) return;
      context.globalAlpha = settings.opacity;
      // The exact exported group is cached once per size/DPR. Its SVG blur is
      // never recalculated for every tile on every scroll frame.
      const positions = getTilePositions(width, height, tileWidth, tileHeight, scroll,
        settings.scrollFactor, cursor.x * settings.cursorOffset, cursor.y * settings.cursorOffset);
      for (const { x, y } of positions) {
        context.drawImage(tile, x, y, tileWidth, tileHeight);
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
    const cacheArtwork = () => {
      const mobile = width <= settings.mobileBreakpoint || !mouse.matches;
      const scale = mobile ? settings.mobileTileScale : settings.tileScale;
      tileWidth = referenceTile.width * scale;
      tileHeight = referenceTile.height * scale;
      tile.width = Math.max(1, Math.round(tileWidth * dpr));
      tile.height = Math.max(1, Math.round(tileHeight * dpr));
      if (loaded) tile.getContext('2d')?.drawImage(artwork, 0, 0, tile.width, tile.height);
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
      cacheArtwork();
      preferences();
    };
    const visibility = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
      preferences();
    };
    artwork.onload = () => {
      loaded = true;
      cacheArtwork();
      schedule();
    };
    artwork.src = marksUrl;
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
    const pointerPreference = () => { cacheArtwork(); preferences(); };
    mouse.addEventListener('change', pointerPreference);
    return () => {
      artwork.onload = null;
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
      mouse.removeEventListener('change', pointerPreference);
    };
  }, [settings]);

  return settings.enabled ? <canvas className="global-atmosphere" ref={canvasRef} aria-hidden="true" /> : null;
}

export default GlobalAtmosphere;
