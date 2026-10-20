import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../src/sections/Hero/heroMotion.ts', import.meta.url), 'utf8');
const output = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText;
const { beanReactions, chooseBeanReaction, BeanPartyCounter } = await import(
  `data:text/javascript;base64,${Buffer.from(output).toString('base64')}`
);

test('all four reactions can be chosen, and no selection repeats its predecessor', () => {
  assert.deepEqual([0, 0.25, 0.5, 0.999].map((value) => chooseBeanReaction(null, () => value)), beanReactions);
  for (const previous of beanReactions) {
    for (const value of [0, 0.25, 0.5, 0.999]) {
      assert.notEqual(chooseBeanReaction(previous, () => value), previous);
    }
  }
});

test('five different beans trigger once, clearing the counter for the next series', () => {
  const counter = new BeanPartyCounter(5, 10000);
  for (let i = 0; i < 4; i++) assert.equal(counter.record(`bean-${i}`, i * 100), false);
  assert.equal(counter.record('bean-4', 500), true);
  for (let i = 0; i < 4; i++) assert.equal(counter.record(`bean-${i}`, 600 + i * 100), false);
  assert.equal(counter.record('bean-4', 1100), true);
});

test('repeated clicks on a single bean never trigger the party', () => {
  const counter = new BeanPartyCounter(5, 10000);
  for (let i = 0; i < 100; i++) assert.equal(counter.record('same-bean', i * 50), false);
});

test('clicks outside the rolling window expire; repeats update only their own timestamp', () => {
  const counter = new BeanPartyCounter(5, 10000);
  counter.record('a', 0);
  counter.record('b', 1000);
  counter.record('a', 9000);
  for (const id of ['c', 'd', 'e']) assert.equal(counter.record(id, 11001), false);
  assert.equal(counter.record('b', 11002), true);
});

test('explicit cancellation clears all prior clicks', () => {
  const counter = new BeanPartyCounter(5, 10000);
  for (const id of ['a', 'b', 'c', 'd']) counter.record(id, 0);
  counter.clear();
  assert.equal(counter.record('e', 100), false);
});
