import { useEffect, useRef } from 'react';
import { portfolioEffects } from '../config';
import { useMotionEnabled } from '../useMotionEnabled';
import './CursorTrail.css';

interface Point {
  readonly x: number;
  readonly y: number;
}

interface Particle extends Point {
  readonly born: number;
  readonly lifetime: number;
  readonly size: number;
  readonly color: string;
  readonly kind: 'dot' | 'star' | 'sparkle';
  readonly dx: number;
  readonly dy: number;
  readonly angle: number;
  readonly spin: number;
}

function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const settings = portfolioEffects.cursorTrail;
  const enabled = useMotionEnabled(settings.enabled, '(hover: hover) and (pointer: fine)');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!enabled || !canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const motion = window.matchMedia('(prefers-reduced-motion: no-preference)');
    const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let resolution: MediaQueryList | undefined;
    let rawDpr = 0;
    let dpr = 1;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let frame = 0;
    let previous: Point | null = null;
    let lastInput: Point | null = null;
    let lastSpawn = -Infinity;

    const resetPath = () => {
      previous = null;
      lastInput = null;
      lastSpawn = -Infinity;
    };
    const clearCanvas = () => {
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const stop = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
      particles = [];
      resetPath();
      clearCanvas();
    };
    const allowed = () => motion.matches && pointer.matches && !document.hidden;

    const draw = (particle: Particle, now: number) => {
      const age = Math.max(0, (now - particle.born) / particle.lifetime);
      const drift = 1 - (1 - age) ** 2;
      const size = particle.size * (1 - age * 0.85);
      context.save();
      context.translate(particle.x + particle.dx * drift, particle.y + particle.dy * drift);
      context.rotate(particle.angle + particle.spin * age);
      context.globalAlpha = settings.opacity * Math.min(1, age / 0.12) * (1 - age) ** 1.3;
      context.fillStyle = particle.color;
      context.shadowColor = particle.color;
      context.shadowBlur = settings.glowBlur * dpr;
      context.beginPath();
      if (particle.kind === 'dot') {
        context.arc(0, 0, size / 2, 0, Math.PI * 2);
      } else {
        // Eight alternating vertices make a slender four-pointed star.
        for (let vertex = 0; vertex < 8; vertex++) {
          const angle = vertex * Math.PI / 4;
          const radius = size * (vertex % 2 ? 0.14 : 0.5);
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          if (vertex === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.closePath();
      }
      context.fill();
      if (particle.kind === 'sparkle') {
        context.shadowBlur = 0;
        context.fillStyle = '#ffffff';
        context.beginPath();
        context.arc(0, 0, Math.max(0.35, size * 0.1), 0, Math.PI * 2);
        context.fill();
      }
      context.restore();
    };
    const render = (now: number) => {
      frame = 0;
      // Also guard inside RAF: CSS/media updates need not arrive in lockstep.
      if (!allowed()) { stop(); return; }
      clearCanvas();
      particles = particles.filter((particle) => now - particle.born < particle.lifetime);
      particles.forEach((particle) => draw(particle, now));
      if (particles.length) frame = window.requestAnimationFrame(render);
    };
    const spawn = (point: Point, now: number) => {
      const choice = Math.random();
      const kind = choice < 0.6 ? 'dot' : choice < 0.94 ? 'star' : 'sparkle';
      particles.push({
        x: point.x + (Math.random() - 0.5) * 4,
        y: point.y + (Math.random() - 0.5) * 4,
        born: now,
        lifetime: settings.minLifetimeMs + Math.random() * (settings.maxLifetimeMs - settings.minLifetimeMs),
        size: (settings.minSize + Math.random() * (settings.maxSize - settings.minSize))
          * (kind === 'sparkle' ? 1.35 : 1),
        kind,
        color: settings.colors[Math.floor(Math.random() * settings.colors.length)] ?? settings.colors[0],
        dx: (Math.random() * 2 - 1) * settings.spread,
        dy: (Math.random() * 2 - 1) * settings.spread,
        angle: Math.random() * Math.PI,
        spin: kind === 'dot' ? 0 : (Math.random() * 2 - 1) * 0.8,
      });
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !allowed()) return;
      const current = { x: event.clientX, y: event.clientY };
      if (current.x < 0 || current.y < 0 || current.x > width || current.y > height) {
        resetPath();
        return;
      }
      if (lastInput?.x === current.x && lastInput.y === current.y) return;
      lastInput = current;
      const now = performance.now();
      if (particles.length >= settings.maxParticles) { previous = current; return; }
      if (now - lastSpawn < settings.spawnIntervalMs) return;
      const distance = previous ? Math.hypot(current.x - previous.x, current.y - previous.y) : 0;
      const count = Math.min(
        settings.maxSpawnPerMove,
        settings.maxParticles - particles.length,
        previous ? Math.floor(distance / Math.max(1, settings.spawnSpacing)) : 1,
      );
      if (!count) return;
      const start = previous ?? current;
      for (let index = 1; index <= count; index++) {
        // A bounded batch is distributed across the segment, never piled up
        // at its endpoint. Missed input is not queued after the mouse stops.
        const t = index / count;
        spawn({ x: start.x + (current.x - start.x) * t, y: start.y + (current.y - start.y) * t }, now);
      }
      previous = current;
      lastSpawn = now;
      if (!frame) frame = window.requestAnimationFrame(render);
    };
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const nextRawDpr = window.devicePixelRatio || 1;
      const nextDpr = Math.min(nextRawDpr, settings.maxDpr);
      if (nextRawDpr !== rawDpr) {
        resolution?.removeEventListener('change', resize);
        resolution = window.matchMedia(`(resolution: ${nextRawDpr}dppx)`);
        resolution.addEventListener('change', resize);
        rawDpr = nextRawDpr;
      }
      if (rect.width === width && rect.height === height && dpr === nextDpr) return;
      stop();
      width = rect.width;
      height = rect.height;
      dpr = nextDpr;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
    };
    const preferencesChanged = () => { if (!allowed()) stop(); };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    document.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', resetPath);
    window.addEventListener('resize', resize);
    window.addEventListener('blur', resetPath);
    document.addEventListener('visibilitychange', preferencesChanged);
    motion.addEventListener('change', preferencesChanged);
    pointer.addEventListener('change', preferencesChanged);
    return () => {
      stop();
      observer.disconnect();
      resolution?.removeEventListener('change', resize);
      document.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', resetPath);
      window.removeEventListener('resize', resize);
      window.removeEventListener('blur', resetPath);
      document.removeEventListener('visibilitychange', preferencesChanged);
      motion.removeEventListener('change', preferencesChanged);
      pointer.removeEventListener('change', preferencesChanged);
    };
  }, [enabled, settings]);

  return enabled ? <canvas className="cursor-trail" ref={canvasRef} aria-hidden="true" /> : null;
}

export default CursorTrail;
