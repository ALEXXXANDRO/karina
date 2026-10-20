import { useEffect, useRef } from 'react';
import { portfolioEffects } from '../config';
import { createStarField, wrap } from './atmosphereField';
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
    const stars = createStarField(Math.max(settings.starCount, settings.mobileStarCount), undefined, {
      dust: settings.dustSize, medium: settings.mediumStarSize, large: settings.largeStarSize,
    });
    const layers = {
      far: { scroll: settings.farScrollFactor, cursor: settings.farCursorOffset },
      mid: { scroll: settings.midScrollFactor, cursor: settings.midCursorOffset },
      near: { scroll: settings.nearScrollFactor, cursor: settings.nearCursorOffset },
    };
    const glows = [
      { x: 0.16, y: 0.16, color: settings.colors[0], depth: 'far', intensity: 1 },
      { x: 0.75, y: 0.4, color: settings.colors[1], depth: 'far', intensity: 0.9 },
      { x: 0.36, y: 0.65, color: settings.colors[2], depth: 'far', intensity: 1 },
      { x: 0.08, y: 0.9, color: settings.colors[3], depth: 'far', intensity: 0.35 },
    ] as const;
    // Soft gradients need no high-DPR detail. Cache at CSS resolution on resize,
    // rather than recomputing four large radial gradients on every scroll frame.
    const glowSprites = glows.map(() => document.createElement('canvas'));
    let glowDiameter = 0;
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
      context.globalAlpha = 1;
      context.fillStyle = '#1c1c1c';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const scroll = motion.matches ? window.scrollY : 0;
      const mobile = width <= settings.mobileBreakpoint || !mouse.matches;
      const count = mobile ? Math.min(settings.mobileStarCount, settings.starCount) : settings.starCount;
      const radius = glowDiameter / 2;
      const glowPeriod = Math.max(settings.tileHeight, glowDiameter + 1);
      for (const [index, glow] of glows.entries()) {
        const sprite = glowSprites[index];
        if (!sprite) continue;
        const layer = layers[glow.depth];
        const x = glow.x * width + cursor.x * layer.cursor;
        const y = wrap(glow.y * glowPeriod - scroll * layer.scroll + cursor.y * layer.cursor, glowPeriod);
        context.globalAlpha = settings.glowOpacity * glow.intensity;
        for (let cy = y - glowPeriod; cy <= height + radius; cy += glowPeriod) {
          if (cy < -radius) continue;
          context.drawImage(sprite, x - radius, cy - radius, glowDiameter, glowDiameter);
        }
      }
      for (const star of stars.slice(0, count)) {
        const layer = layers[star.depth];
        const starRadius = star.radius * (mobile && star.cross ? settings.mobileLargeStarScale : 1);
        const extent = starRadius * (star.glow ? settings.starGlowScale : 1);
        const x = wrap(star.x * width + cursor.x * layer.cursor, width);
        const y = wrap(star.y * settings.tileHeight - scroll * layer.scroll
          + cursor.y * layer.cursor, settings.tileHeight);
        const opacity = Math.min(1, settings.starOpacity * star.opacity);
        const color = settings.colors[star.colorIndex] ?? settings.colors[0];
        // Draw neighbouring copies while crossing an edge, so a star never pops.
        const xs = [x];
        if (x < extent) xs.push(x + width);
        if (x > width - extent) xs.push(x - width);
        for (let cy = y - settings.tileHeight; cy <= height + extent; cy += settings.tileHeight) {
          if (cy < -extent) continue;
          for (const cx of xs) {
            context.save();
            context.translate(cx, cy);
            context.rotate(star.angle);
            if (star.glow) {
              const halo = context.createRadialGradient(0, 0, 0, 0, 0, extent);
              halo.addColorStop(0, color);
              halo.addColorStop(1, `${color}00`);
              context.globalAlpha = opacity * settings.starGlowOpacity;
              context.fillStyle = halo;
              context.beginPath();
              context.arc(0, 0, extent, 0, Math.PI * 2);
              context.fill();
            }
            context.globalAlpha = opacity;
            context.fillStyle = color;
            context.beginPath();
            if (star.cross) {
              for (let vertex = 0; vertex < 8; vertex++) {
                const angle = vertex * Math.PI / 4;
                const r = starRadius * (vertex % 2 ? 0.22 : 1);
                if (!vertex) context.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
                else context.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
              }
              context.closePath();
            } else context.arc(0, 0, starRadius, 0, Math.PI * 2);
            context.fill();
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
      glowDiameter = Math.round(Math.max(settings.glowMinDiameter,
        Math.min(settings.glowMaxDiameter, width * settings.glowViewportRatio)));
      glows.forEach((glow, index) => {
        const sprite = glowSprites[index];
        if (!sprite) return;
        sprite.width = sprite.height = glowDiameter;
        const brush = sprite.getContext('2d');
        if (!brush) return;
        const radius = glowDiameter / 2;
        const gradient = brush.createRadialGradient(radius, radius, 0, radius, radius, radius);
        gradient.addColorStop(0, glow.color);
        gradient.addColorStop(0.2, `${glow.color}e0`);
        gradient.addColorStop(0.5, `${glow.color}66`);
        gradient.addColorStop(0.78, `${glow.color}1a`);
        gradient.addColorStop(1, `${glow.color}00`);
        brush.fillStyle = gradient;
        brush.fillRect(0, 0, glowDiameter, glowDiameter);
      });
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
