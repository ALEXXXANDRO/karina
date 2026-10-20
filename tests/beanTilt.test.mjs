import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../src/sections/Hero/beanTilt.ts', import.meta.url), 'utf8');
const output = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText;
const { getBeanTilt, getBeanTiltBlend } = await import(
  `data:text/javascript;base64,${Buffer.from(output).toString('base64')}`
);
const rect = { left: 100, top: 200, width: 200, height: 100 };
const limits = { maxRotateX: 12, maxRotateY: 12 };

test('tilt is neutral in the centre and changes direction towards opposite edges', () => {
  const centre = getBeanTilt({ x: 200, y: 250 }, rect, limits);
  assert.equal(Math.abs(centre.x) + Math.abs(centre.y), 0);
  assert.deepEqual(getBeanTilt({ x: 100, y: 200 }, rect, limits), { x: 12, y: -12 });
  assert.deepEqual(getBeanTilt({ x: 300, y: 300 }, rect, limits), { x: -12, y: 12 });
  assert.deepEqual(getBeanTilt({ x: 250, y: 225 }, rect, limits), { x: 6, y: 6 });
});

test('outside pointer coordinates remain bounded and zero-size artwork stays neutral', () => {
  assert.deepEqual(getBeanTilt({ x: 9999, y: -9999 }, rect, limits), { x: 12, y: 12 });
  assert.deepEqual(getBeanTilt({ x: 200, y: 250 }, { ...rect, width: 0 }, limits), { x: 0, y: 0 });
});

test('smoothing has the same decay over time on 60Hz and 120Hz displays without overshooting', () => {
  const step60 = getBeanTiltBlend(0.14, 1000 / 60);
  const step120 = getBeanTiltBlend(0.14, 1000 / 120);
  assert(Math.abs(step60 - 0.14) < 1e-10);
  assert(Math.abs((1 - step120) ** 2 - (1 - step60)) < 1e-10);
  let angle = 12;
  for (let frame = 0; frame < 120; frame++) {
    angle += (0 - angle) * step60;
    assert(angle >= 0 && angle <= 12);
  }
  assert(angle < 0.001);
});
