import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../src/effects/GlobalAtmosphere/atmosphereField.ts', import.meta.url), 'utf8');
const output = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText;
const { createStarField, wrap } = await import(
  `data:text/javascript;base64,${Buffer.from(output).toString('base64')}`
);

test('the field survives remounts and mobile uses the same stars', () => {
  const desktop = createStarField(80);
  assert.deepEqual(createStarField(80), desktop);
  assert.deepEqual(createStarField(36), desktop.slice(0, 36));
  assert.deepEqual(new Set(desktop.map((star) => star.depth)), new Set(['far', 'mid', 'near']));
  assert.equal(desktop.filter((star) => star.cross).length, 20);
  assert(desktop.filter((star) => star.glow).length < 10);
});

test('dust, medium stars and crosses have separate configurable diameter ranges', () => {
  const sizes = { dust: [2, 3], medium: [4, 6], large: [8, 14] };
  const field = createStarField(80, undefined, sizes);
  for (const star of field) {
    const [min, max] = star.cross ? sizes.large : star.depth === 'mid' ? sizes.medium : sizes.dust;
    assert(star.radius * 2 >= min && star.radius * 2 <= max);
    assert(star.opacity > 0 && star.opacity <= 1.25);
  }
  const enlarged = createStarField(80, undefined, { ...sizes, large: [20, 24] });
  for (let i = 0; i < field.length; i++) {
    assert.equal(field[i].x, enlarged[i].x);
    assert.equal(field[i].y, enlarged[i].y);
    if (enlarged[i].cross) assert(enlarged[i].radius >= 10 && enlarged[i].radius <= 12);
  }
});

test('the periodic field is reversible across both positive and negative tile boundaries', () => {
  const period = 1200;
  for (const star of createStarField(90)) {
    const start = star.y * period;
    for (const shift of [-99999, -1201, -1, 0, 1, 1201, 99999]) {
      const wrapped = wrap(start - shift, period);
      assert(wrapped >= 0 && wrapped < period);
      assert(Math.abs(wrap(wrapped + shift, period) - start) < 1e-8);
      assert(Math.abs(wrap(start - shift + period, period) - wrapped) < 1e-8);
    }
  }
});
