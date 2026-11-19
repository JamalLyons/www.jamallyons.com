import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDesk, rectOf } from './behaviour.js';
import { BOX, overlaps, zonesFor } from './zones.js';

// Layouts measured from the running page (book cover, the text blocks of both pages,
// the page-control buttons, and the clock tag / view toggle).
const layouts = {
	'1280x800': {
		vw: 1280,
		vh: 800,
		cover: { x: 196, y: 75, w: 887, h: 614 },
		text: [
			{ x: 247, y: 108, w: 338, h: 382 },
			{ x: 247, y: 630, w: 7, h: 27 },
			{ x: 696, y: 115, w: 338, h: 506 },
			{ x: 1026, y: 630, w: 7, h: 27 }
		],
		controls: { x: 411, y: 691, w: 459, h: 40 },
		avoid: [
			{ x: 15, y: 749, w: 212, h: 43 },
			{ x: 1090, y: 12, w: 174, h: 40 },
			{ x: 411, y: 691, w: 459, h: 40 }
		]
	},
	'1920x1080': {
		vw: 1920,
		vh: 1080,
		cover: { x: 404, y: 137, w: 1112, h: 770 },
		text: [
			{ x: 463, y: 177, w: 427, h: 559 },
			{ x: 463, y: 838, w: 9, h: 34 },
			{ x: 1030, y: 186, w: 428, h: 627 },
			{ x: 1448, y: 838, w: 9, h: 34 }
		],
		controls: { x: 731, y: 909, w: 458, h: 40 },
		avoid: [
			{ x: 15, y: 1029, w: 212, h: 43 },
			{ x: 1730, y: 12, w: 174, h: 40 },
			{ x: 731, y: 909, w: 458, h: 40 }
		]
	}
};

/** @typedef {ReturnType<typeof createDesk>} Desk */
/** @typedef {ReturnType<Desk['view']>} View */
/** @typedef {import('./behaviour.js').DeskEvent} DeskEvent */

/**
 * Run a desk for `ms`, calling `each(view, t)` every frame.
 * @param {Desk} desk @param {number} ms
 * @param {(view: View, t: number) => void} [each]
 * @param {(t: number) => DeskEvent[]} [events]
 */
function simulate(desk, ms, each, events = () => []) {
	for (let t = 0; t < ms; t += 16) {
		desk.step(16, events(t));
		each?.(desk.view(), t);
	}
}

/** The robot's drawn rect, plus whatever it carries. @param {View} view */
function rects(view) {
	const out = [];
	for (const name of /** @type {const} */ (['tread', 'hopper', 'drone'])) {
		const v = view[name];
		if (!v) continue;
		const r = rectOf(name, v);
		// a spinning robot can reach further than its upright box
		if (Math.abs(v.rot) > 20) {
			const cx = r.x + r.w / 2;
			const cy = r.y + r.h / 2;
			const R = Math.hypot(r.w, r.h) / 2;
			out.push({ name, r: { x: cx - R, y: cy - R, w: 2 * R, h: 2 * R }, v });
		} else out.push({ name, r, v });
	}
	return out;
}

for (const [label, L] of Object.entries(layouts)) {
	test(`${label}: every robot gets a zone`, () => {
		const z = zonesFor(L);
		assert.ok(z.tread, 'treadbot strip');
		assert.ok(z.hopper, 'hopper strip');
		assert.ok(z.perches.length, 'a perch');
		assert.ok(z.drone && z.drone.pads.length, 'drone pads');
		assert.ok(z.drone.right, 'the right margin');
		// the top lane only fits when there's wall showing above the book
		if (L.vh >= 1000) assert.ok(z.drone.left && z.drone.topY !== null, 'both margins and the top lane');
	});

	for (const seed of [1, 7, 42, 1234, 99999]) {
		test(`${label} seed ${seed}: no robot ever over text, controls or fixed UI`, () => {
			const z = zonesFor(L);
			const desk = createDesk({ seed, zones: z });
			let turnAt = -1;
			simulate(
				desk,
				4 * 60_000,
				(view, t) => {
					for (const { name, r } of rects(view)) {
						for (const tr of L.text) assert.ok(!overlaps(r, tr), `${name} over text at ${t}ms: ${JSON.stringify(r)}`);
						for (const a of L.avoid) assert.ok(!overlaps(r, a), `${name} over UI at ${t}ms: ${JSON.stringify(r)} vs ${JSON.stringify(a)}`);
						assert.ok(r.x >= 0 && r.x + r.w <= L.vw, `${name} off screen x at ${t}ms`);
						assert.ok(r.y + r.h <= L.vh, `${name} off screen y at ${t}ms`);
					}
					if (view.item) for (const tr of L.text) assert.ok(!overlaps({ x: view.item.x - 11, y: view.item.y, w: 22, h: 19 }, tr), `note over text at ${t}ms`);
				},
				// a page turn now and then
				(t) => (t > turnAt + 23_000 && (turnAt = t) ? [{ type: /** @type {const} */ ('turn') }] : [])
			);
		});
	}

	test(`${label}: the marble stays in its strip`, () => {
		const z = zonesFor(L);
		const m = /** @type {NonNullable<typeof z.marble>} */ (z.marble);
		for (const seed of [3, 5, 8]) {
			const desk = createDesk({ seed, zones: z });
			simulate(desk, 3 * 60_000, (view, t) => {
				assert.ok(view.marble);
				assert.ok(view.marble.x >= m.x0 - 1e-6 && view.marble.x <= m.x1 + 1e-6, `marble at ${view.marble.x} (${t}ms)`);
				for (const a of L.avoid) assert.ok(!overlaps({ x: view.marble.x - view.marble.r, y: view.marble.y - view.marble.r, w: 2 * view.marble.r, h: 2 * view.marble.r }, a));
			});
		}
	});
}

test('Hopper only perches on the cover edge under the left page', () => {
	const L = layouts['1280x800'];
	const z = zonesFor(L);
	const perch = z.perches[0];
	assert.equal(perch.edge, 'bottom');
	assert.ok(perch.y > L.cover.y + L.cover.h - 12 && perch.y <= L.cover.y + L.cover.h, 'on the bottom edge');
	assert.ok(perch.x1 < L.controls.x, 'left of the page controls');
	let perched = 0;
	for (const seed of [1, 2, 3, 4, 5, 6]) {
		const desk = createDesk({ seed, zones: z });
		simulate(desk, 2 * 60_000, () => {
			const h = desk.world.bots.hopper;
			if (!h?.perched) return;
			perched++;
			assert.ok(h.x >= perch.x0 - 1e-6 && h.x <= perch.x1 + 1e-6, `perched at x ${h.x}`);
			assert.ok(Math.abs(h.ground - perch.y) < 1e-6, 'resting on the perch line');
		});
	}
	assert.ok(perched > 0, 'Hopper perched at least once');
});

test('no perch when the text runs down to the edge', () => {
	const L = structuredClone(layouts['1280x800']);
	L.text[1] = { x: 247, y: 600, w: 338, h: 80 };
	assert.equal(zonesFor(L).perches.length, 0);
});

test('a page turn knocks a perched Hopper off, back onto the desk', () => {
	const z = zonesFor(layouts['1280x800']);
	const desk = createDesk({ seed: 2, zones: z });
	let t = 0;
	while (!desk.world.bots.hopper?.perched && t < 3 * 60_000) {
		desk.step(16);
		t += 16;
	}
	assert.ok(desk.world.bots.hopper?.perched, 'perched within three minutes');
	simulate(desk, 1500); // let it settle on the edge
	assert.ok(desk.world.bots.hopper.perched);
	desk.step(16, [{ type: 'turn' }]);
	const h = desk.world.bots.hopper;
	assert.equal(h.perched, false, 'off the book at once');
	assert.equal(desk.view().hopper?.mark?.text, 'wah!');
	simulate(desk, 1200);
	assert.equal(h.layer, 'desk');
	assert.ok(Math.abs(h.ground - z.floorY) < 1e-6, 'back on the desk');
	assert.ok(z.hopper && h.x >= z.hopper.x0 && h.x <= z.hopper.x1);
});

test('only one robot does something big at a time, and big things come round', () => {
	const z = zonesFor(layouts['1920x1080']);
	const desk = createDesk({ seed: 11, zones: z });
	const seen = new Set();
	simulate(desk, 5 * 60_000, () => {
		const w = desk.world;
		const busy = [w.bots.hopper?.perched && 'hopper'].filter(Boolean);
		if (w.stage) seen.add(w.stage);
		for (const b of busy) assert.equal(w.stage, b, 'a perch is the big thing on stage');
	});
	assert.ok(seen.size >= 2, `several kinds of big moment: ${[...seen]}`);
});

test('reduced motion: robots sit still in their zones', () => {
	const L = layouts['1280x800'];
	const z = zonesFor(L);
	const desk = createDesk({ seed: 5, zones: z, reduced: true });
	const first = desk.view();
	assert.equal(first.reduced, true);
	simulate(desk, 30_000, (v) => {
		for (const name of /** @type {const} */ (['tread', 'hopper', 'drone'])) {
			const a = first[name];
			const b = v[name];
			assert.ok(a && b);
			assert.equal(b.x, a.x);
			assert.equal(b.y, a.y);
			assert.equal(b.rot, 0);
			assert.equal(b.pose, a.pose);
		}
		assert.equal(v.marble?.x, first.marble?.x);
		assert.equal(v.drone?.prop, 'off', 'propeller still');
		for (const { r } of rects(v)) for (const tr of L.text) assert.ok(!overlaps(r, tr));
	});
	// a poke only says something
	desk.step(16, [{ type: 'poke', bot: 'tread' }]);
	assert.ok(desk.view().tread?.mark);
	assert.equal(desk.view().tread?.x, first.tread?.x);
});

test('the same seed plays out the same way', () => {
	const z = zonesFor(layouts['1280x800']);
	const run = () => {
		const desk = createDesk({ seed: 77, zones: z });
		/** @type {string[]} */
		const frames = [];
		simulate(desk, 40_000, (v, t) => t % 1000 === 0 && frames.push(JSON.stringify(v)), (t) => (t === 20_000 ? [{ type: /** @type {const} */ ('poke'), bot: /** @type {const} */ ('hopper') }] : []));
		return frames;
	};
	assert.deepEqual(run(), run());
	const other = createDesk({ seed: 78, zones: z });
	simulate(other, 40_000);
	const a = createDesk({ seed: 77, zones: z });
	simulate(a, 40_000);
	assert.notDeepEqual(JSON.stringify(a.view()), JSON.stringify(other.view()));
});

test('poking each robot gets a reaction', () => {
	const z = zonesFor(layouts['1280x800']);
	const desk = createDesk({ seed: 9, zones: z });
	simulate(desk, 5000);
	for (const bot of /** @type {const} */ (['tread', 'hopper', 'drone'])) {
		desk.step(16, [{ type: 'poke', bot }]);
		assert.ok(desk.view()[bot]?.mark, `${bot} says something`);
	}
	// and they get on with things afterwards
	simulate(desk, 20_000);
});

test('at night the drone lands by the can and sleeps; by day it flies again', () => {
	const L = layouts['1280x800'];
	const z = zonesFor(L);
	const desk = createDesk({ seed: 4, zones: z });
	simulate(desk, 3000);
	desk.setNight(true);
	simulate(desk, 30_000);
	const d = desk.world.bots.drone;
	assert.ok(d?.asleep, 'asleep');
	assert.equal(d.prop, 'off');
	const sleep = z.drone?.sleep;
	assert.ok(sleep && Math.abs(d.x - sleep.x) < 1 && Math.abs(d.y - sleep.y) < 1, 'by the can');
	assert.equal(desk.view().drone?.pose, 'sleep');
	desk.setNight(false);
	simulate(desk, 6000);
	assert.equal(desk.world.bots.drone?.asleep, false);
	assert.equal(desk.world.bots.drone?.prop, 'spin');
});

test('a cramped window hides the floor robots rather than squeezing them in', () => {
	const L = structuredClone(layouts['1280x800']);
	L.vh = 745;
	const z = zonesFor(L);
	assert.equal(z.tread, null);
	assert.equal(z.hopper, null);
	const desk = createDesk({ seed: 1, zones: z });
	simulate(desk, 2000);
	assert.equal(desk.view().tread, null);
	assert.equal(desk.view().hopper, null);
});

test('a resize keeps robots inside the new zones', () => {
	const a = zonesFor(layouts['1920x1080']);
	const b = zonesFor(layouts['1280x800']);
	const desk = createDesk({ seed: 21, zones: a });
	simulate(desk, 20_000);
	desk.setZones(b);
	const v = desk.view();
	assert.ok(v.tread && b.tread && v.tread.x >= b.tread.x0 && v.tread.x <= b.tread.x1);
	assert.ok(v.hopper && b.hopper && v.hopper.x >= b.hopper.x0 && v.hopper.x <= b.hopper.x1);
	for (const { r } of rects(v)) for (const tr of layouts['1280x800'].text) assert.ok(!overlaps(r, tr));
});

test('robot boxes are sane', () => {
	for (const box of Object.values(BOX)) assert.ok(box.l < 0 && box.r > 0 && box.t < 0 && box.b >= 0);
});
