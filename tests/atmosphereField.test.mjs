import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../src/effects/GlobalAtmosphere/atmosphereField.ts', import.meta.url), 'utf8');
const output = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText;
const { createGraphicField, getGraphicAngle, getParallaxY, getVisibleCopies, wrap } = await import(
  `data:text/javascript;base64,${Buffer.from(output).toString('base64')}`
);
const options = {
  strokeCount: 56, markerCount: 20,
  minStrokeLength: 10, maxStrokeLength: 28, markerSize: [6, 12], lineWidth: [0.7, 1.2],
};

test('graphic field is deterministic, sparse and contains all editorial mark types', () => {
  const field = createGraphicField(options);
  assert.deepEqual(createGraphicField(options), field);
  assert.equal(field.filter((element) => element.kind === 'stroke').length, 56);
  assert.equal(field.filter((element) => element.kind === 'registration').length, 6);
  assert.deepEqual(new Set(field.map((element) => element.kind)), new Set(['stroke', 'plus', 'cross', 'registration']));
  for (const element of field) {
    assert(element.x >= 0 && element.x < 1 && element.y >= 0 && element.y < 1);
    assert(element.lineWidth >= 0.7 && element.lineWidth <= 1.2);
    assert(element.size >= (element.kind === 'stroke' ? 10 : 6));
    assert(element.size <= (element.kind === 'stroke' ? 28 : 12));
  }
});

test('every graphic kind moves by the same 540px per 1000px scroll without changing spacing', () => {
  const field = createGraphicField(options);
  const moved = field.map((element) => getParallaxY(element.y * 1080, 1000, 0.54, 1080));
  for (const [index, element] of field.entries()) {
    assert.equal('depth' in element, false);
    const base = element.y * 1080;
    assert(Math.abs(wrap(base - moved[index], 1080) - 540) < 1e-8);
    assert.equal(getParallaxY(base, 0, 0.54, 1080), wrap(base, 1080));
    assert.equal(getParallaxY(base, 1000, 0.54, 1080, 3), wrap(base - 540 + 3, 1080));
    assert(Math.abs(wrap(base - field[0].y * 1080, 1080) - wrap(moved[index] - moved[0], 1080)) < 1e-8);
  }
});

test('copies cross the seam continuously, including the full stroke-size margin', () => {
  const before = getVisibleCopies(getParallaxY(0.1, 0, 1, 1080), 1080, 1080, 15);
  const after = getVisibleCopies(getParallaxY(0.1, 0.2, 1, 1080), 1080, 1080, 15);
  assert.equal(before.length, 2);
  assert.equal(after.length, 2);
  for (let i = 0; i < before.length; i++) assert(Math.abs(before[i] - 0.2 - after[i]) < 1e-8);
  assert.deepEqual(getVisibleCopies(1075, 1080, 1600, 15), [-5, 1075]);
  assert.deepEqual(getVisibleCopies(5, 1080, 2400, 15), [5, 1085, 2165]);
  assert.deepEqual(getVisibleCopies(-5, 1080, 600, 15), [-5]);
  for (const scroll of [-100000, 0, 1080, 100000]) {
    const centers = getVisibleCopies(getParallaxY(300, scroll, 0.54, 1080), 1080, 1080, 15);
    assert(centers.length > 0);
    assert(centers.every((y) => y >= -15 && y <= 1095));
  }
});

test('mobile retains the same positions instead of reshuffling the page', () => {
  const desktop = createGraphicField(options);
  const mobile = createGraphicField({ ...options, strokeCount: 28, markerCount: 10 });
  assert.deepEqual(mobile, [...desktop.slice(0, 28), ...desktop.slice(56, 66)]);
  const resized = createGraphicField({ ...options, minStrokeLength: 20, maxStrokeLength: 30 });
  assert.deepEqual(resized.map(({ x, y }) => [x, y]), desktop.map(({ x, y }) => [x, y]));
});

test('continuous coordinates are reversible through either edge of the repeated field', () => {
  const period = 1080;
  for (const element of createGraphicField(options)) {
    const start = element.y * period;
    for (const shift of [-99999, -1081, -1, 0, 1, 1081, 99999]) {
      const wrapped = wrap(start - shift, period);
      assert(wrapped >= 0 && wrapped < period);
      assert(Math.abs(wrap(wrapped + shift, period) - start) < 1e-8);
      assert(Math.abs(wrap(start - shift + period, period) - wrapped) < 1e-8);
    }
  }
});

const rotation = {
  rotationEnabled: true, rotatingStrokeRatio: 0.65,
  maxRotationDeg: 12, rotationScrollPeriod: 4200,
};

test('roughly 65% of strokes rotate, markers and other strokes keep their angle', () => {
  const field = createGraphicField(options);
  const active = field.filter((element) => getGraphicAngle(element, 1000, rotation) !== element.angle);
  assert(active.length >= options.strokeCount * 0.6 && active.length <= options.strokeCount * 0.7);
  assert(active.every((element) => element.kind === 'stroke'));
  assert.equal(getGraphicAngle(active[0], 0, rotation), active[0].angle);
  assert.deepEqual(createGraphicField(options), field);
});

test('rotation is bounded, continuous and exactly reversible without angle accumulation', () => {
  for (const element of createGraphicField(options)) {
    const original = getGraphicAngle(element, 500, rotation);
    for (const scroll of [-1e9, -100000, -1000, 0, 1, 1000, 100000, 1e9]) {
      const angle = getGraphicAngle(element, scroll, rotation);
      assert(Math.abs(angle - element.angle) <= 12 * Math.PI / 180 + 1e-12);
      assert(Math.abs(getGraphicAngle(element, scroll + 0.1, rotation) - angle) < 0.001);
    }
    assert.equal(getGraphicAngle(element, 500, rotation), original);
    assert.equal(getGraphicAngle(element, 1000, { ...rotation, rotationEnabled: false }), element.angle);
    assert.equal(getGraphicAngle(element, 1000, rotation, false), element.angle);
    assert.equal(getGraphicAngle(element, 1000, { ...rotation, rotatingStrokeRatio: 0 }), element.angle);
  }
});

test('denser composition retains quiet areas around the reference title and copy regions', () => {
  for (const element of createGraphicField(options)) {
    const { x, y } = element;
    assert(!(x > 0.07 && x < 0.48 && y > 0.06 && y < 0.23));
    assert(!(x > 0.12 && x < 0.88 && y > 0.38 && y < 0.64));
    assert(!(x > 0.07 && x < 0.4 && y > 0.73 && y < 0.92));
  }
});
