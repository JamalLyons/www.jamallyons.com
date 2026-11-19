import assert from 'node:assert/strict';
import { test } from 'node:test';
// Node strips the types from turn.ts; it has no imports of its own.
import { frame, frameStyle, phases } from './turn.ts';

const [first, last] = [phases[0].name, phases[phases.length - 1].name];

test('a forward turn runs from 0 to -180 degrees, back turns the other way', () => {
	for (const [dir, from, to] of /** @type {const} */ ([
		[1, 0, -180],
		[-1, -180, 0]
	])) {
		const start = frame(dir, first, 0);
		const end = frame(dir, last, 1);
		assert.deepEqual(start, { angle: from, bend: 0, fingers: 0 }, `dir ${dir} start`);
		assert.equal(end.angle, to, `dir ${dir} end`);
		assert.equal(end.bend, 0);
		assert.equal(end.fingers, 0);
	}
});

test('phases join without jumps', () => {
	for (const dir of /** @type {const} */ ([1, -1])) {
		for (let i = 1; i < phases.length; i++) {
			const a = frame(dir, phases[i - 1].name, 1);
			const b = frame(dir, phases[i].name, 0);
			assert.ok(Math.abs(a.angle - b.angle) < 1e-9, `${dir} ${phases[i].name} angle`);
		}
	}
});

test('frameStyle flips which face shows as the leaf passes upright', () => {
	const flat = frameStyle({ angle: 0, bend: 0, fingers: 0 });
	assert.equal(flat['--a-front'], 'visible');
	assert.equal(flat['--a-back'], 'hidden');
	assert.equal(flat['--b-front'], 'visible');
	assert.equal(flat['--cast-l'], '0');

	const over = frameStyle({ angle: -180, bend: 0, fingers: 0 });
	assert.equal(over['--a-front'], 'hidden');
	assert.equal(over['--a-back'], 'visible');
	assert.equal(over['--b-back'], 'visible');

	// The outer half can lead the inner half past upright.
	const split = frameStyle({ angle: -80, bend: -20, fingers: 1 });
	assert.equal(split['--a-front'], 'visible');
	assert.equal(split['--b-front'], 'hidden');
	assert.equal(split['--b-back'], 'visible');
	assert.equal(split['--a'], '-80.00deg');
	assert.equal(split['--fingers'], '1.000');
});
