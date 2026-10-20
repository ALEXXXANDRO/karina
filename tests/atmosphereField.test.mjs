import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../src/effects/GlobalAtmosphere/atmosphereField.ts', import.meta.url), 'utf8');
const output = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText;
const { referenceTile, getTilePositions, getParallaxY, wrap } = await import(
  `data:text/javascript;base64,${Buffer.from(output).toString('base64')}`
);

test('local Figma artwork preserves the original SVG dimensions and has no external resources', async () => {
  const svg = await readFile(new URL('../src/effects/GlobalAtmosphere/figma-marks.svg', import.meta.url), 'utf8');
  assert(svg.includes(`width="${referenceTile.width}"`));
  assert(svg.includes(`height="${referenceTile.height}"`));
  assert(svg.includes('<path'));
  assert(svg.includes('feGaussianBlur'));
  assert(!/(?:href|src)=["']https?:/i.test(svg));
});

test('every object in the tile shares 540px displacement per 1000px scroll', () => {
  for (const base of [0, 20, 300, 664]) {
    const after = getParallaxY(base, 1000, 0.54, referenceTile.height);
    assert(Math.abs(wrap(base - after, referenceTile.height) - 540) < 1e-8);
  }
});

test('tile positions are deterministic, reversible and preserve reference spacing', () => {
  const args = [1920, 1080, referenceTile.width, referenceTile.height];
  const original = getTilePositions(...args, 0, 0.54);
  assert.deepEqual(getTilePositions(...args, 0, 0.54), original);
  for (const scroll of [-100000, 0, 1000, 100000]) {
    const positions = getTilePositions(...args, scroll, 0.54);
    assert.deepEqual(getTilePositions(...args, scroll, 0.54), positions);
    assert.equal(positions[1].x - positions[0].x, referenceTile.width);
  }
  assert.deepEqual(getTilePositions(...args, 0, 0.54), original);
});

test('cyclic tiling covers every viewport edge without gaps, including mobile and tall windows', () => {
  for (const [width, height, scale] of [[1920, 1080, 1], [1440, 900, 1], [1024, 768, 1], [768, 1024, 1.25], [390, 844, 1.25], [360, 2400, 1.25]]) {
    const tw = referenceTile.width * scale;
    const th = referenceTile.height * scale;
    for (const scroll of [-100000, -0.1, 0, 0.1, th / 0.54, 100000]) {
      const tiles = getTilePositions(width, height, tw, th, scroll, 0.54, 4, -4);
      for (let y = 0; y <= height; y += 37) {
        for (let x = 0; x <= width; x += 41) {
          assert(tiles.some(t => x >= t.x && x <= t.x + tw && y >= t.y && y <= t.y + th));
        }
      }
    }
  }
});

test('crossing the repeat boundary changes coordinates continuously modulo the tile', () => {
  const period = referenceTile.height;
  for (const scroll of [0, period / 0.54, 1e6]) {
    const before = getParallaxY(0, scroll, 0.54, period);
    const after = getParallaxY(0, scroll + 0.1, 0.54, period);
    assert(Math.abs(wrap(before - after, period) - 0.054) < 1e-8);
  }
  assert.deepEqual(getTilePositions(0, 1080, 688, period, 0, 0.54), []);
});
