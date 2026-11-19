// The desk robots' brains: a pure, deterministic state machine. No DOM. Given a seed, the
// zones from zones.js, and a stream of (dt, events) it produces the same motion every time,
// so it can be tested frame by frame. Robots.svelte only measures the page and draws `view()`.
//
// Each robot runs a queue of segments. A segment is a little timed tween (or an open-ended
// one that runs `until` something is true); when the queue empties the robot `think`s and
// queues its next task. Segments marked `soft` are resting points that can be cut short
// (a poke, nightfall, a resize); the others always finish, so props are never left
// half-carried. One robot at a time may do something "big" (a perch, a marble chase, a
// flight across the top of the desk), and big things come round every 8-20 seconds.
//
// Plain JavaScript (types in JSDoc) so `node --test` can load it.

import { BOX, MARBLE_R, PAD_HOVER, PERCH_HOP, PUSH_OFF } from './zones.js';

/** @typedef {import('./zones.js').Zones} Zones */
/** @typedef {{ type: 'turn' } | { type: 'poke', bot: 'tread' | 'hopper' | 'drone' }} DeskEvent */

/** Small, fast, seedable PRNG. @param {number} seed */
export function mulberry32(seed) {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

export const ease = {
	/** @param {number} t */ inOut: (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2),
	/** @param {number} t */ out: (t) => 1 - (1 - t) ** 3,
	/** @param {number} t */ in: (t) => t ** 3,
	/** @param {number} t */ sine: (t) => (1 - Math.cos(Math.PI * t)) / 2,
	/** @param {number} t */ outBack: (t) => 1 + 2.4 * (t - 1) ** 3 + 1.4 * (t - 1) ** 2
};
const lerp = (/** @type {number} */ a, /** @type {number} */ b, /** @type {number} */ t) => a + (b - a) * t;
const clamp = (/** @type {number} */ v, /** @type {number} */ lo, /** @type {number} */ hi) => Math.max(lo, Math.min(hi, v));
const bump = (/** @type {number} */ t) => Math.sin(Math.PI * clamp(t, 0, 1));

/**
 * @typedef {{
 *   dur?: number, until?: (b: Bot, w: World) => boolean, soft?: boolean, air?: boolean,
 *   start?: (b: Bot, w: World) => void, tick?: (b: Bot, w: World, t: number, dt: number) => void,
 *   end?: (b: Bot, w: World) => void, t?: number, started?: boolean
 * }} Seg
 * @typedef {{
 *   name: 'tread' | 'hopper' | 'drone', x: number, y: number, face: 1 | -1, rot: number, sx: number, sy: number,
 *   pose: string, look: { x: number, y: number }, segs: Seg[], mark: { text: string, id: number, until: number } | null,
 *   blinkAt: number, blinkUntil: number, glanceUntil: number, poke: boolean, interrupt: boolean,
 *   layer: 'desk' | 'above', ground: number,
 *   dist: number, arm: number, key: number, coil: number, perched: boolean, asleep: boolean,
 *   tip: number, open: number, prop: 'spin' | 'slow' | 'off', side: 'left' | 'right', passing: boolean, phase: number
 * }} Bot
 * @typedef {{
 *   rnd: () => number, clock: number, z: Zones, reduced: boolean, night: boolean,
 *   stage: string | null, nextBig: number, markId: number,
 *   bots: { tread: Bot | null, hopper: Bot | null, drone: Bot | null },
 *   marble: { x: number, vx: number, held: boolean, angle: number } | null,
 *   item: { x: number, y: number, held: boolean, rot: number } | null
 * }} World
 */

/**
 * @param {{ seed?: number, zones: Zones, reduced?: boolean, night?: boolean }} opts
 */
export function createDesk({ seed = 1, zones, reduced = false, night = false }) {
	/** @type {World} */
	const w = {
		rnd: mulberry32(seed),
		clock: 0,
		z: zones,
		reduced,
		night,
		stage: null,
		nextBig: 4000,
		markId: 0,
		bots: { tread: null, hopper: null, drone: null },
		marble: null,
		item: null
	};
	place(w, true);
	return {
		/** @param {number} dt ms since the last step @param {DeskEvent[]} [events] */
		step(dt, events = []) {
			step(w, Math.min(dt, 100), events);
		},
		view: () => view(w),
		/**
		 * New measurements. Only a change in the robots' own zones re-places them; new text
		 * after a page turn just updates where Hopper may perch next.
		 * @param {Zones} z
		 */
		setZones(z) {
			const key = (/** @type {Zones} */ z) => JSON.stringify([z.s, z.floorY, z.tread, z.hopper, z.drone].map((v) => (typeof v === 'number' ? Math.round(v) : v && JSON.stringify(v, (k, x) => (typeof x === 'number' ? Math.round(x) : x)))));
			const moved = key(z) !== key(w.z);
			w.z = z;
			if (moved) place(w, false);
		},
		/** @param {boolean} on */
		setNight(on) {
			if (w.night === on) return;
			w.night = on;
			const d = w.bots.drone;
			if (d) d.interrupt = true;
			if (w.reduced) place(w, false);
		},
		world: w
	};
}

// ------------------------------------------------------------------ placement

/** @param {Bot['name']} name @param {number} x @param {number} y @returns {Bot} */
function makeBot(name, x, y) {
	return {
		name, x, y, face: 1, rot: 0, sx: 1, sy: 1, pose: 'idle', look: { x: 0, y: 0 }, segs: [], mark: null,
		blinkAt: 1500, blinkUntil: 0, glanceUntil: 0, poke: false, interrupt: false, layer: 'desk', ground: y,
		dist: 0, arm: 0, key: 0, coil: 0, perched: false, asleep: false, tip: 26, open: 0, prop: 'spin', side: 'right',
		passing: false, phase: 0
	};
}

/**
 * Put every robot somewhere legal for the current zones. On first placement they get
 * fresh random spots; later (a resize) they keep their places, clamped into the new zones,
 * and restart their routines.
 * @param {World} w @param {boolean} fresh
 */
function place(w, fresh) {
	const { z, rnd } = w;
	const s = z.s;
	if (w.stage) w.stage = null;

	// Treadbot and its marble
	if (z.tread && z.marble) {
		const tz = z.tread;
		const mz = z.marble;
		let m = w.marble;
		const keep = !fresh && w.bots.tread;
		const mx = keep && m ? clamp(m.x, mz.x0, mz.x1) : lerp(mz.x0, mz.x1, 0.35 + rnd() * 0.3);
		w.marble = m = { x: mx, vx: 0, held: false, angle: m?.angle ?? 0 };
		const b = keep && w.bots.tread ? w.bots.tread : makeBot('tread', 0, 0);
		b.segs = [];
		b.x = keep ? clamp(b.x, tz.x0, tz.x1) : clamp(m.x - PUSH_OFF * s - 30 * s, tz.x0, tz.x1);
		if (Math.abs(b.x - m.x) < PUSH_OFF * s) b.x = m.x + (m.x - tz.x0 > PUSH_OFF * s ? -1 : 1) * PUSH_OFF * s;
		b.face = m.x >= b.x ? 1 : -1;
		b.y = b.ground = z.floorY;
		reset(b);
		if (w.reduced) b.pose = 'rest';
		else b.segs.push(rest(fresh ? 700 : 400));
		w.bots.tread = b;
	} else {
		w.bots.tread = null;
		w.marble = null;
	}

	// Hopper
	if (z.hopper) {
		const hz = z.hopper;
		const keep = !fresh && w.bots.hopper;
		const b = keep && w.bots.hopper ? w.bots.hopper : makeBot('hopper', 0, 0);
		b.segs = [];
		b.x = keep ? clamp(b.x, hz.x0, hz.x1) : lerp(hz.x0, hz.x1, 0.3 + rnd() * 0.4);
		b.y = b.ground = z.floorY;
		b.face = rnd() < 0.5 ? 1 : -1;
		b.perched = false;
		b.layer = 'desk';
		reset(b);
		if (w.reduced) b.pose = 'rest';
		else b.segs.push(rest(fresh ? 2600 : 600));
		w.bots.hopper = b;
	} else w.bots.hopper = null;

	// Drone and the sticky note it ferries about
	const dz = z.drone;
	if (dz && dz.pads.length) {
		const keep = !fresh && w.bots.drone;
		const b = keep && w.bots.drone ? w.bots.drone : makeBot('drone', 0, 0);
		b.segs = [];
		reset(b);
		b.tip = 26;
		b.open = 0;
		const sides = /** @type {const} */ (['right', 'left']).filter((k) => dz[k]);
		const side = sides.includes(b.side) ? b.side : sides[0];
		const col = /** @type {import('./zones.js').Span} */ (dz[side]);
		b.side = side;
		const pads = dz.pads.filter((p) => p.side === side);
		const pad = pads[Math.floor(rnd() * pads.length)] ?? dz.pads[0];
		if (w.reduced) {
			// parked on the desk, propeller still, the note set down beside it
			const spot = dz.sleep && side === 'right' ? dz.sleep : { x: pad.x, y: pad.y - 12 * s };
			b.x = spot.x;
			b.y = spot.y;
			b.prop = 'off';
			b.tip = 12;
			b.pose = w.night ? 'sleep' : 'rest';
			b.asleep = w.night;
			w.item = { x: clamp(spot.x - 26 * s, col.x0 - 20 * s, col.x1 + 20 * s), y: spot.y + 12 * s, held: false, rot: -8 };
		} else {
			b.x = keep ? clamp(b.x, col.x0, col.x1) : pad.x;
			b.y = keep ? clamp(b.y, col.y0, col.y1) : lerp(col.y0, col.y1, 0.4);
			b.prop = 'spin';
			b.asleep = false;
			b.pose = 'hover';
			b.ground = b.y;
			// a note left on the desk stays put if it's still in a margin; otherwise the drone has it
			const it = w.item;
			const ok = keep && it && !it.held && dz.pads.some((p) => Math.abs(p.x - it.x) < 14 * s && Math.abs(p.y - it.y) < 140 * s);
			if (!ok) w.item = { x: b.x, y: b.y + (b.tip + 6) * s, held: true, rot: 0 };
			b.segs.push(rest(fresh ? 1500 : 500));
		}
		b.ground = b.y;
		w.bots.drone = b;
	} else {
		w.bots.drone = null;
		w.item = null;
	}
}

/** @param {Bot} b */
function reset(b) {
	b.rot = 0;
	b.sx = b.sy = 1;
	b.pose = 'idle';
	b.coil = 0;
	b.arm = 0;
	b.mark = null;
	b.poke = b.interrupt = false;
	b.passing = false;
	b.look = { x: 0, y: 0 };
}

// ------------------------------------------------------------------ the loop

/** @param {World} w @param {number} dt @param {DeskEvent[]} events */
function step(w, dt, events) {
	w.clock += dt;
	for (const e of events) handle(w, e);
	const { tread, hopper, drone } = w.bots;
	for (const b of [tread, hopper, drone]) {
		if (!b) continue;
		if (!w.reduced) run(b, w, dt);
		if (w.clock > b.blinkAt) {
			b.blinkUntil = w.clock + (w.reduced ? 420 : 130);
			b.blinkAt = w.clock + (w.reduced ? 5000 : 2200) + w.rnd() * 4200;
		}
		if (b.mark && w.clock > b.mark.until) b.mark = null;
	}
	if (w.reduced) return;
	if (w.marble) roll(w, dt);
	if (w.item && w.item.held && drone) {
		w.item.x = drone.x;
		w.item.y = drone.y + (drone.tip + 6) * w.z.s;
		w.item.rot = lerp(w.item.rot, -drone.rot * 0.8, Math.min(1, dt / 120));
	}
}

/** What each robot says when poked. */
const PIPS = { tread: ['beep!', 'bzzt!', 'hi!'], hopper: ['boing!', 'hi!', 'wheee'], drone: ['beep!', 'bip bip'] };

/** @param {World} w @param {DeskEvent} e */
function handle(w, e) {
	const { tread, hopper, drone } = w.bots;
	if (e.type === 'poke') {
		const b = w.bots[e.bot];
		if (!b) return;
		const text = b.asleep ? '…?' : b.perched ? 'eep!' : PIPS[b.name][Math.floor(w.rnd() * PIPS[b.name].length)];
		say(w, b, text, 1500);
		if (w.reduced || b.poke) return;
		b.poke = true;
		b.interrupt = true;
		return;
	}
	if (e.type === 'turn') {
		if (w.reduced) return;
		for (const b of [tread, drone]) if (b && !b.asleep) b.glanceUntil = w.clock + 1300;
		// no climbing onto a moving page; the perch is re-measured once it lands
		w.nextBig = Math.max(w.nextBig, w.clock + 2500);
		if (!hopper) return;
		if (hopper.layer === 'above') {
			// on the book, or in the air on the way up: knocked off
			hopper.segs = [];
			release(w, hopper);
			w.stage = 'hopper';
			hopper.sx = hopper.sy = 1;
			hopper.segs.push(...tumble(w, hopper));
		} else if (w.stage === 'hopper') hopper.interrupt = true;
	}
}

/** Advance one robot's segment queue by dt. @param {Bot} b @param {World} w @param {number} dt */
function run(b, w, dt) {
	for (let guard = 0; guard < 40 && dt > 0; guard++) {
		/** @type {Seg | undefined} */
		let s = b.segs[0];
		if (b.interrupt && (!s || !s.started || s.soft)) {
			b.interrupt = false;
			clear(w, b);
			s = undefined;
		}
		if (!s) {
			think(b, w);
			s = b.segs[0];
			if (!s) return;
		}
		if (!s.started) {
			s.started = true;
			s.t = 0;
			s.start?.(b, w);
		}
		const t0 = /** @type {number} */ (s.t);
		const used = s.dur !== undefined ? Math.min(dt, s.dur - t0) : dt;
		s.t = t0 + used;
		dt -= used;
		s.tick?.(b, w, s.dur !== undefined ? (s.dur ? s.t / s.dur : 1) : s.t, used);
		const done = s.dur !== undefined ? s.t >= s.dur : !!s.until?.(b, w);
		if (done) {
			s.end?.(b, w);
			b.segs.shift();
		} else if (s.dur === undefined) return;
	}
}

/** Drop the queue at a resting point and leave the robot in a sane pose. @param {World} w @param {Bot} b */
function clear(w, b) {
	b.segs = [];
	if (!b.perched) release(w, b);
	b.rot = 0;
	b.sx = b.sy = 1;
	b.passing = false;
	b.arm = 0;
	if (b.name === 'tread' && w.marble) w.marble.held = false;
	if (b.name === 'hopper' && !b.perched) b.coil = 0;
	if (b.name === 'tread') b.y = w.z.floorY;
}

/** @param {World} w @param {Bot} b */
function canBig(w, b) {
	return !w.stage && w.clock >= w.nextBig && !!b;
}
/** @param {World} w @param {Bot} b */
function release(w, b) {
	if (w.stage !== b.name) return;
	w.stage = null;
	w.nextBig = w.clock + 8000 + w.rnd() * 12000;
}
/** @param {World} w @param {Bot} b @param {string} text @param {number} ms */
function say(w, b, text, ms) {
	b.mark = { text, id: ++w.markId, until: w.clock + ms };
}
/** @param {World} w @param {number} a @param {number} b */
const rand = (w, a, b) => a + w.rnd() * (b - a);

// ------------------------------------------------------------------ shared segments

/** A soft pause. Robots breathe, sway or hover while they wait. @param {number} ms @param {Seg['tick']} [tick] */
function rest(ms, tick) {
	return /** @type {Seg} */ ({ dur: ms, soft: true, tick });
}
/** Run `fn` once, instantly. @param {(b: Bot, w: World) => void} fn */
function now(fn) {
	return /** @type {Seg} */ ({ dur: 0, start: fn });
}
/** Tween any numeric fields of the bot. @param {number} ms @param {(b: Bot) => Partial<Record<'x'|'y'|'rot'|'sx'|'sy'|'coil'|'tip'|'open'|'arm', number>>} to */
function tween(ms, to, e = ease.inOut, extra = /** @type {Seg['tick']} */ (undefined)) {
	/** @type {Record<string, [number, number]>} */
	let span = {};
	return /** @type {Seg} */ ({
		dur: ms,
		start(b) {
			span = {};
			for (const [k, v] of Object.entries(to(b))) span[k] = [/** @type {any} */ (b)[k], /** @type {number} */ (v)];
		},
		tick(b, w, t, dt) {
			const k = e(t);
			for (const [f, [a, c]] of Object.entries(span)) /** @type {any} */ (b)[f] = lerp(a, c, k);
			extra?.(b, w, t, dt);
		}
	});
}
/** Turn round: a paper-flip squash through edge-on. @param {1 | -1} to */
function turn(to) {
	return /** @type {Seg} */ ({
		dur: 240,
		tick(b, w, t) {
			b.sx = 0.12 + 0.88 * Math.abs(Math.cos(Math.PI * t));
			if (t >= 0.5) b.face = to;
		},
		end(b) {
			b.sx = 1;
			b.face = to;
		}
	});
}

// ------------------------------------------------------------------ thinking

/** @param {Bot} b @param {World} w */
function think(b, w) {
	if (b.name === 'tread') thinkTread(b, w);
	else if (b.name === 'hopper') thinkHopper(b, w);
	else thinkDrone(b, w);
}

// ---------------------------------------------------------------- Treadbot

/** @param {Bot} b @param {World} w */
function thinkTread(b, w) {
	const s = w.z.s;
	const m = /** @type {NonNullable<World['marble']>} */ (w.marble);
	const mz = /** @type {NonNullable<Zones['marble']>} */ (w.z.marble);
	if (b.poke) {
		b.poke = false;
		b.segs.push(
			now((b) => (b.pose = 'wave')),
			tween(160, () => ({ sy: 0.86, sx: 1.1 }), ease.out),
			tween(380, () => ({ sy: 1, sx: 1, rot: 0 }), ease.outBack, (b, w, t) => (b.y = w.z.floorY - 10 * s * bump(t))),
			rest(900, (b, w, t) => (b.arm = Math.sin(t * Math.PI * 4))),
			now((b) => ((b.pose = 'idle'), (b.arm = 0))),
			rest(rand(w, 1200, 2400))
		);
		return;
	}
	const r = w.rnd();
	if (r < 0.62 && mz.x1 - mz.x0 > 60) push(b, w, m, mz, canBig(w, b) && w.rnd() < 0.55);
	else if (r < 0.82) b.segs.push(...lookAtViewer(w));
	else {
		// tinker: tap the antenna, a little chirp
		b.segs.push(
			now((b) => (b.pose = 'tinker')),
			rest(1400),
			now((b) => {
				b.pose = 'idle';
				if (w.rnd() < 0.5) say(w, b, '♪', 900);
			})
		);
	}
	b.segs.push(rest(rand(w, 1600, 4200), idleTread));
}

/** @param {Bot} b @param {World} w */
function idleTread(b, w) {
	b.rot = 0.6 * Math.sin(w.clock / 700 + b.x);
}

/** @param {World} w */
function lookAtViewer(w) {
	return [
		now((b) => (b.pose = 'look')),
		rest(rand(w, 1100, 1900)),
		now((b) => {
			b.pose = 'idle';
			if (w.rnd() < 0.3) say(w, b, '?', 900);
		})
	];
}

/** Drive along the floor to x, swerving in front of the marble if it's in the way. @param {Bot} b @param {World} w @param {number} x */
function drive(b, w, x, speed = 52) {
	const s = w.z.s;
	/** @type {Seg[]} */
	const out = [];
	const dir = /** @type {1 | -1} */ (Math.sign(x - b.x) || b.face);
	if (Math.abs(x - b.x) < 2) return out;
	out.push(now((b) => b.face !== dir && b.segs.splice(1, 0, turn(dir))));
	out.push(tween(130, () => ({ rot: -3 * dir }), ease.out));
	let x0 = 0;
	let pass = false;
	out.push({
		start(b, w) {
			x0 = b.x;
			const m = w.marble;
			pass = !!m && !m.held && (m.x - b.x) * dir > 0 && (m.x - x) * dir > -PUSH_OFF * s;
			b.passing = pass;
			b.pose = 'drive';
			/** @type {Seg} */ (this).dur = Math.max(450, (Math.abs(x - b.x) / (speed * s)) * 1000);
		},
		dur: 1000,
		tick(b, w, t) {
			const px = b.x;
			b.x = lerp(x0, x, ease.inOut(t));
			b.dist += (b.x - px) * b.face;
			b.rot = lerp(-3, 2.5, Math.min(1, t * 4)) * dir;
			// going round the marble: swing back up the desk and pass behind it
			b.y = w.z.floorY - (pass ? 9 * s * bump(t) : 0);
		},
		end(b, w) {
			b.passing = false;
			b.y = w.z.floorY;
		}
	});
	out.push(settle());
	return out;
}
/** Stop wobble: the body pitches forward and rocks back to rest. */
function settle() {
	return /** @type {Seg} */ ({
		dur: 380,
		start(b) {
			b.pose = b.pose === 'push' ? 'push' : 'idle';
		},
		tick(b, w, t) {
			b.rot = b.face * 5 * (1 - t) * Math.cos(t * Math.PI * 2.5);
		},
		end(b) {
			b.rot = 0;
		}
	});
}

/**
 * Push the marble somewhere. Big version: shove it too hard, watch it roll off, chase it
 * down, nip round the far side and bump it back.
 * @param {Bot} b @param {World} w @param {NonNullable<World['marble']>} m @param {NonNullable<Zones['marble']>} mz @param {boolean} big
 */
function push(b, w, m, mz, big) {
	const s = w.z.s;
	const off = PUSH_OFF * s;
	// Push toward the side with more room, a random distance.
	const room = { [1]: mz.x1 - m.x, [-1]: m.x - mz.x0 };
	const dir = /** @type {1 | -1} */ (room[1] >= room[-1] ? 1 : -1);
	const dist = Math.min(room[dir], rand(w, 50, 150) * s);
	if (dist < 24) return void b.segs.push(...lookAtViewer(w));
	const target = m.x + dir * dist;
	if (big) w.stage = 'tread';

	b.segs.push(...drive(b, w, m.x - dir * off));
	b.segs.push(now((b) => b.face !== dir && b.segs.splice(1, 0, turn(dir))));
	// anticipation: lean back, then lean in and take the marble
	b.segs.push(
		now((b) => (b.pose = 'push')),
		tween(200, () => ({ rot: -4 * dir }), ease.out),
		tween(120, () => ({ rot: 2 * dir }), ease.in),
		now((b, w) => void (w.marble && (w.marble.held = true)))
	);
	const pause = !big && w.rnd() < 0.3;
	const mid = pause ? m.x + dir * dist * rand(w, 0.35, 0.6) : target;
	const pushTo = (/** @type {number} */ mx, /** @type {number} */ speed) => {
		let x0 = 0;
		let goal = 0;
		return /** @type {Seg} */ ({
			dur: 1000,
			start(b, w) {
				x0 = b.x;
				goal = mx - dir * off;
				this.dur = Math.max(500, (Math.abs(goal - x0) / (speed * s)) * 1000);
			},
			tick(b, w, t) {
				const px = b.x;
				b.x = lerp(x0, goal, ease.inOut(t));
				b.dist += (b.x - px) * b.face;
				b.rot = dir * (2 + Math.sin(t * 20) * 0.6);
				const mb = /** @type {NonNullable<World['marble']>} */ (w.marble);
				mb.x = b.x + dir * off;
			}
		});
	};
	b.segs.push(pushTo(mid, 34));
	if (pause) {
		b.segs.push(now((b, w) => w.marble && (w.marble.held = false)), settle(), ...lookAtViewer(w), now((b) => (b.pose = 'push')));
		b.segs.push(tween(160, () => ({ rot: -3 * dir }), ease.out), now((b, w) => w.marble && (w.marble.held = true)), pushTo(target, 34));
	}
	if (!big) {
		b.segs.push(now((b, w) => w.marble && (w.marble.held = false)), settle(), now((b) => (b.pose = 'idle')));
		return;
	}
	// The shove: a lunge, the marble shoots off, a startled "!"
	b.segs.push(
		tween(180, () => ({ rot: -5 * dir }), ease.out),
		tween(130, (b) => ({ x: b.x + dir * 7 * s, rot: 7 * dir }), ease.in, (b, w) => {
			const mb = /** @type {NonNullable<World['marble']>} */ (w.marble);
			mb.x = b.x + dir * off;
		}),
		now((b, w) => {
			const mb = /** @type {NonNullable<World['marble']>} */ (w.marble);
			mb.held = false;
			mb.vx = dir * rand(w, 150, 210) * s;
			b.pose = 'oops';
			say(w, b, '!', 900);
		}),
		tween(160, () => ({ sy: 1.12, sx: 0.92, rot: -2 * dir }), ease.out),
		tween(260, () => ({ sy: 1, sx: 1, rot: 0 }), ease.outBack),
		rest(380)
	);
	// The chase: follow until the marble stops, staying behind it
	b.segs.push({
		start(b) {
			b.pose = 'chase';
		},
		tick(b, w, t, dt) {
			const mb = /** @type {NonNullable<World['marble']>} */ (w.marble);
			const goal = mb.x - dir * off;
			const stepMax = (96 * s * dt) / 1000;
			const px = b.x;
			const want = goal - b.x;
			if (want * dir > 0) b.face = dir;
			b.x += clamp(want, -stepMax, stepMax);
			b.dist += (b.x - px) * b.face;
			b.rot = clamp((b.x - px) / (stepMax || 1), -1, 1) * 3.5;
		},
		until(b, w) {
			const mb = /** @type {NonNullable<World['marble']>} */ (w.marble);
			return mb.vx === 0 && Math.abs(mb.x - dir * off - b.x) < 1.5;
		},
		end(b) {
			b.pose = 'idle';
		}
	});
	b.segs.push(settle(), now((b) => say(w, b, 'hmm', 900)), rest(700));
	// Round the far side and bump it back toward the middle
	b.segs.push({
		dur: 0,
		start(b, w) {
			const mb = /** @type {NonNullable<World['marble']>} */ (w.marble);
			const back = /** @type {1 | -1} */ (-dir);
			const far = clamp(mb.x - back * off, /** @type {any} */ (w.z.tread).x0, /** @type {any} */ (w.z.tread).x1);
			b.segs.splice(
				1,
				0,
				...drive(b, w, far, 60),
				now((b) => b.face !== back && b.segs.splice(1, 0, turn(back))),
				now((b) => (b.pose = 'push')),
				tween(240, () => ({ rot: -5 * back }), ease.out),
				tween(110, (b) => ({ x: b.x + back * 6 * s, rot: 6 * back }), ease.in),
				now((b, w) => {
					const mb = /** @type {NonNullable<World['marble']>} */ (w.marble);
					if (Math.abs(mb.x - b.x) <= off + 8 * s) mb.vx = back * rand(w, 70, 110) * s;
				}),
				tween(300, (b) => ({ x: b.x - back * 6 * s, rot: 0 }), ease.outBack),
				now((b) => (b.pose = 'idle'))
			);
		}
	});
	b.segs.push(now((b, w) => release(w, b)));
}

/** Marble physics: rolling friction, soft bounces off the zone ends and off Treadbot. @param {World} w @param {number} dt */
function roll(w, dt) {
	const m = /** @type {NonNullable<World['marble']>} */ (w.marble);
	const z = /** @type {NonNullable<Zones['marble']>} */ (w.z.marble);
	const s = w.z.s;
	const px = m.x;
	if (!m.held && m.vx) {
		m.x += (m.vx * dt) / 1000;
		m.vx *= Math.exp((-1.5 * dt) / 1000);
		if (m.x < z.x0) (m.x = z.x0), (m.vx = Math.abs(m.vx) * 0.45);
		if (m.x > z.x1) (m.x = z.x1), (m.vx = -Math.abs(m.vx) * 0.45);
		if (Math.abs(m.vx) < 4 * s) m.vx = 0;
	}
	const b = w.bots.tread;
	if (b && !m.held && !b.passing) {
		const off = PUSH_OFF * s;
		const side = Math.sign(m.x - b.x) || 1;
		if (Math.abs(m.x - b.x) < off) {
			m.x = clamp(b.x + side * off, z.x0, z.x1);
			if (m.vx * side < 0) m.vx = -m.vx * 0.35;
		}
	}
	m.angle += ((m.x - px) / (MARBLE_R * s)) * (180 / Math.PI);
}

// ---------------------------------------------------------------- Hopper

/** @param {Bot} b @param {World} w */
function thinkHopper(b, w) {
	const z = w.z;
	const s = z.s;
	const hz = /** @type {NonNullable<Zones['hopper']>} */ (z.hopper);
	if (b.poke) {
		b.poke = false;
		if (b.perched) {
			b.segs.push(
				now((b) => (b.pose = 'wave')),
				tween(140, () => ({ sy: 1.12, sx: 0.92 }), ease.out),
				tween(320, () => ({ sy: 1, sx: 1 }), ease.outBack),
				rest(1200),
				now((b) => (b.pose = 'sit'))
			);
			b.segs.push(...sitAWhile(b, w, 2500), ...getDown(w));
			return;
		}
		// a spin jump on the spot
		b.segs.push(
			...hop(w, b.x, z.floorY, 34 * s, { spin: 360 * b.face }),
			now((b) => (b.pose = 'wave')),
			rest(1100),
			now((b) => (b.pose = 'idle')),
			rest(rand(w, 1500, 3000), breathe)
		);
		return;
	}
	const perch = z.perches.length && canBig(w, b) && w.rnd() < 0.6 ? z.perches[Math.floor(w.rnd() * z.perches.length)] : null;
	if (perch) {
		w.stage = 'hopper';
		const px = clamp(b.x, Math.max(perch.x0, hz.x0), Math.min(perch.x1, hz.x1));
		b.segs.push(...hopTo(b, w, px, b.x));
		// the big jump up onto the book's bottom edge
		const lx = clamp(px + (w.rnd() < 0.5 ? -1 : 1) * 10 * s, perch.x0, perch.x1);
		b.segs.push(
			now((b) => (b.pose = 'ready')),
			rest(500),
			now((b) => (b.layer = 'above')),
			...hop(w, lx, perch.y, PERCH_HOP * s, { crouch: 300, air: 560, deep: true }),
			now((b) => ((b.perched = true), (b.pose = 'idle'))),
			rest(300),
			// sit down: the body drops onto the edge, the spring swings out over it
			tween(320, () => ({ y: perch.y + 15 * s, coil: 0.3 }), ease.inOut, (b, w, t) => {
				b.sy = 1 - 0.1 * bump(t);
				if (t > 0.5) b.pose = 'sit';
			})
		);
		b.segs.push(...sitAWhile(b, w, rand(w, 5500, 9000)), ...getDown(w));
		return;
	}
	if (b.perched) return void b.segs.push(...getDown(w));
	const r = w.rnd();
	if (r < 0.7) {
		const span = hz.x1 - hz.x0;
		let x = lerp(hz.x0, hz.x1, w.rnd());
		if (Math.abs(x - b.x) < Math.min(40 * s, span / 3)) x = b.x > (hz.x0 + hz.x1) / 2 ? hz.x0 + w.rnd() * span * 0.3 : hz.x1 - w.rnd() * span * 0.3;
		b.segs.push(...hopTo(b, w, x, b.x));
	} else {
		// wind the key: a little shimmy while it ratchets round
		b.segs.push(
			now((b) => (b.pose = 'wind')),
			rest(1400, (b, w, t, dt) => {
				b.key += dt * 0.5;
				b.rot = 3 * Math.sin(t / 90);
			}),
			now((b) => ((b.pose = 'idle'), (b.rot = 0)))
		);
	}
	b.segs.push(rest(rand(w, 1400, 4200), breathe));
}

/** Stand up on the edge and hop back down to the desk. @param {World} w */
function getDown(w) {
	const s = w.z.s;
	const seat = w.z.perches[0]?.y ?? w.z.floorY;
	return [
		now((b) => ((b.pose = 'idle'), (b.look = { x: 0, y: 0 }))),
		tween(260, () => ({ y: seat, coil: 0, sy: 1 }), ease.outBack),
		rest(240),
		/** @type {Seg} */ ({
			dur: 0,
			start(b, w) {
				const hz = /** @type {NonNullable<Zones['hopper']>} */ (w.z.hopper);
				b.perched = false;
				const x = clamp(b.x - 26 * s, hz.x0, hz.x1);
				if (b.face !== -1) b.segs.splice(1, 0, turn(-1));
				b.segs.splice(b.face !== -1 ? 2 : 1, 0, ...hop(w, x, w.z.floorY, 16 * s, { air: 460 }), now((b) => ((b.layer = 'desk'), release(w, b))));
			}
		}),
		rest(rand(w, 1500, 3500), breathe)
	];
}

/** @param {Bot} b @param {World} w */
function breathe(b, w) {
	b.sy = 1 + 0.018 * Math.sin(w.clock / 380);
	b.sx = 2 - b.sy;
}

/** A chain of floor hops to x, at most ~32px each. @param {Bot} b @param {World} w @param {number} x @param {number} from */
function hopTo(b, w, x, from) {
	const s = w.z.s;
	const n = Math.max(1, Math.ceil(Math.abs(x - from) / (32 * s)));
	/** @type {Seg[]} */
	const out = [];
	if (Math.abs(x - from) < 3) return out;
	const dir = /** @type {1 | -1} */ (Math.sign(x - from));
	out.push(now((b) => b.face !== dir && b.segs.splice(1, 0, turn(dir))));
	for (let i = 1; i <= n; i++) {
		out.push(...hop(w, lerp(from, x, i / n), w.z.floorY, (14 + w.rnd() * 6) * s));
		if (i < n) out.push(rest(60 + w.rnd() * 120));
	}
	return out;
}

/**
 * One hop: crouch (anticipation), stretch into the air, land in a squash, spring back.
 * @param {World} w @param {number} x @param {number} y foot position to land at
 * @param {number} h extra height above the higher end of the arc
 * @param {{ crouch?: number, air?: number, deep?: boolean, spin?: number }} [o]
 */
function hop(w, x, y, h, o = {}) {
	const crouch = o.crouch ?? 140;
	const air = o.air ?? 340;
	let x0 = 0;
	let y0 = 0;
	let g0 = 0;
	let dir = 1;
	/** @type {Seg[]} */
	const segs = [
		tween(crouch, () => ({ sy: o.deep ? 0.72 : 0.8, sx: o.deep ? 1.2 : 1.14, coil: o.deep ? 0.75 : 0.55 }), ease.out, (b, w, t) => {
			b.pose = 'crouch';
			b.rot = o.deep ? Math.sin(t * Math.PI * 3) * 2 : 0;
		}),
		{
			dur: air,
			air: true,
			start(b) {
				x0 = b.x;
				y0 = b.y;
				g0 = b.ground;
				dir = Math.sign(x - x0) || b.face;
				b.pose = 'air';
			},
			tick(b, w, t, dt) {
				const top = Math.min(y0, y) - h;
				// a parabola through (0, y0), (1, y) with its peak at `top`
				const a = y0 - top;
				const c = y - top;
				const tp = Math.sqrt(a) / (Math.sqrt(a) + Math.sqrt(c) || 1);
				b.x = lerp(x0, x, t);
				b.y = t < tp ? top + a * ((t - tp) / tp) ** 2 : top + c * ((t - tp) / (1 - tp || 1)) ** 2;
				b.ground = lerp(g0, y, ease.inOut(t));
				const e = Math.abs(2 * t - 1);
				b.sy = 1 + 0.17 * e ** 1.5;
				b.sx = 1 / Math.sqrt(b.sy);
				b.coil = t < 0.5 ? -0.35 * (1 - t * 2) : -0.25 * (t * 2 - 1);
				b.rot = o.spin ? o.spin * ease.inOut(t) : dir * 8 * (0.5 - t);
				b.key += dt * 0.6;
			},
			end(b) {
				b.x = x;
				b.y = b.ground = y;
				b.rot = 0;
			}
		},
		tween(100, () => ({ sy: o.deep ? 0.7 : 0.76, sx: o.deep ? 1.22 : 1.16, coil: 0.65 }), ease.out, (b) => (b.pose = 'land')),
		tween(260, () => ({ sy: 1, sx: 1, coil: 0 }), ease.outBack, (b) => (b.pose = 'idle'))
	];
	return segs;
}

/** Sitting on the edge: legs swing, it looks about, once in a while at you. @param {Bot} b @param {World} w @param {number} ms */
function sitAWhile(b, w, ms) {
	/** @type {Seg[]} */
	const out = [];
	let left = ms;
	while (left > 0) {
		const d = Math.min(left, rand(w, 1200, 2400));
		const lx = [-1, 0, 1, 0][Math.floor(w.rnd() * 4)];
		const ly = w.rnd() < 0.3 ? 1 : 0;
		out.push(now((b) => ((b.look = { x: lx, y: ly }), (b.pose = 'sit'))), rest(d));
		left -= d;
	}
	out.push(now((b) => (b.look = { x: 0, y: 0 })));
	return out;
}

/** Knocked off the book by a page turn: pop, spin, fall, bounce, dizzy. @param {World} w @param {Bot} b */
function tumble(w, b) {
	const z = w.z;
	const s = z.s;
	const hz = /** @type {NonNullable<Zones['hopper']>} */ (z.hopper);
	const x1 = clamp(b.x - 46 * s, hz.x0, hz.x1);
	const x2 = clamp(x1 - 14 * s, hz.x0, hz.x1);
	let x0 = 0;
	let y0 = 0;
	let g0 = 0;
	b.perched = false;
	b.look = { x: 0, y: 0 };
	/** @type {Seg[]} */
	const segs = [
		now((b) => (say(w, b, 'wah!', 1100), (b.pose = 'tumble'))),
		{
			dur: 720,
			air: true,
			start(b) {
				x0 = b.x;
				y0 = b.y;
				g0 = b.ground;
			},
			tick(b, w, t, dt) {
				const top = y0 - 8 * s;
				const tp = 0.18;
				b.x = lerp(x0, x1, ease.out(t));
				b.y = t < tp ? top + (y0 - top) * ((t - tp) / tp) ** 2 : top + (z.floorY - top) * ((t - tp) / (1 - tp)) ** 2;
				b.ground = lerp(g0, z.floorY, t);
				b.rot = -540 * ease.out(t);
				b.key += dt * 1.2;
				b.coil = -0.3;
			},
			end(b) {
				b.x = x1;
				b.y = b.ground = z.floorY;
				b.rot = 0;
				b.layer = 'desk';
			}
		},
		tween(90, () => ({ sy: 0.68, sx: 1.25, coil: 0.7 }), ease.out),
		...hop(w, x2, z.floorY, 9 * s, { crouch: 1, air: 260 }),
		now((b) => (b.pose = 'dizzy')),
		rest(1700, (b, w, t) => (b.rot = 6 * Math.sin(t / 110))),
		tween(320, () => ({ rot: 0 }), ease.out, (b, w, t) => (b.sx = 1 - 0.12 * Math.abs(Math.sin(t * Math.PI * 4)))),
		now((b, w) => ((b.pose = 'idle'), (b.sx = 1), release(w, b))),
		rest(rand(w, 1800, 3000), breathe)
	];
	return segs;
}

// ---------------------------------------------------------------- Drone

/** @param {Bot} b @param {World} w */
function thinkDrone(b, w) {
	const z = w.z;
	const s = z.s;
	const dz = /** @type {NonNullable<Zones['drone']>} */ (z.drone);
	const item = /** @type {NonNullable<World['item']>} */ (w.item);

	if (b.poke) {
		b.poke = false;
		if (b.asleep) {
			b.segs.push(
				now((b) => (b.pose = 'groggy')),
				rest(1500),
				now((b) => (b.pose = 'sleep')),
				sleepSeg()
			);
			return;
		}
		b.segs.push(
			tween(160, (b) => ({ y: b.y + 5 * s }), ease.out),
			tween(620, (b) => ({ y: b.y - 5 * s, rot: 360 * b.face }), ease.inOut),
			now((b) => (b.rot = 0)),
			rest(rand(w, 900, 1600), hover)
		);
		return;
	}

	// nightfall: set the note down, land by the can, fall asleep
	if (w.night && dz.sleep && !b.asleep) {
		const sl = dz.sleep;
		if (item.held) {
			const pad = nearestPad(dz, b, 'right');
			b.segs.push(...flyTo(b, w, pad.x, pad.y - PAD_HOVER * s, 'right'), ...drop(w, pad));
			return;
		}
		b.segs.push(
			...flyTo(b, w, sl.x, sl.y - 30 * s, 'right'),
			now((b) => ((b.pose = 'landing'), (b.prop = 'slow'))),
			tween(900, () => ({ y: sl.y, tip: 12 }), ease.inOut),
			tween(140, () => ({ sy: 0.86, sx: 1.08 }), ease.out),
			tween(300, () => ({ sy: 1, sx: 1 }), ease.outBack),
			now((b) => ((b.prop = 'off'), (b.pose = 'yawn'))),
			rest(1300),
			now((b) => ((b.asleep = true), (b.pose = 'sleep'))),
			sleepSeg()
		);
		return;
	}
	if (b.asleep) {
		if (w.night) return void b.segs.push(sleepSeg());
		// morning: wake, stretch, take off
		b.segs.push(
			now((b) => ((b.pose = 'wake'), say(w, b, '!', 900))),
			tween(260, () => ({ sy: 1.12, sx: 0.92 }), ease.out),
			tween(320, () => ({ sy: 1, sx: 1 }), ease.outBack),
			now((b) => ((b.prop = 'slow'), (b.asleep = false))),
			rest(500),
			now((b) => ((b.prop = 'spin'), (b.pose = 'hover'))),
			tween(700, (b) => ({ y: b.y - 30 * s, tip: 26 }), ease.inOut),
			rest(800, hover)
		);
		return;
	}

	if (item.held) {
		// deliver: to a pad on this side, or (big) across the top to the other margin
		const other = b.side === 'right' ? 'left' : 'right';
		const cross = dz.topY !== null && dz[other] && dz.pads.some((p) => p.side === other) && canBig(w, b) && w.rnd() < 0.6;
		const side = cross ? other : b.side;
		const pads = dz.pads.filter((p) => p.side === side && Math.hypot(p.x - item.x, p.y - item.y) > 30 * s);
		const pad = pads.length ? pads[Math.floor(w.rnd() * pads.length)] : nearestPad(dz, b, side);
		if (cross) w.stage = 'drone';
		b.segs.push(...flyTo(b, w, pad.x, pad.y - PAD_HOVER * s, side), ...drop(w, pad));
		if (cross) b.segs.push(now((b, w) => release(w, b)));
		b.segs.push(rest(rand(w, 300, 700), hover));
		// drift off a little and loiter
		const col = /** @type {import('./zones.js').Span} */ (dz[side]);
		const hx = clamp(pad.x + (w.rnd() < 0.5 ? -1 : 1) * rand(w, 10, 30) * s, col.x0, col.x1);
		const hy = clamp(pad.y - PAD_HOVER * s - rand(w, 50, 110) * s, col.y0, col.y1);
		b.segs.push(...flyTo(b, w, hx, hy, side), now((b) => (b.pose = 'hover')), rest(rand(w, 2500, 6000), hover));
		return;
	}
	// fetch the note again
	const side = item.x < z.cover.x ? 'left' : 'right';
	b.segs.push(...flyTo(b, w, item.x, item.y - PAD_HOVER * s, side), ...grab(w), rest(rand(w, 500, 1200), hover));
}

/** @param {NonNullable<Zones['drone']>} dz @param {Bot} b @param {'left' | 'right'} side */
function nearestPad(dz, b, side) {
	const pads = dz.pads.filter((p) => p.side === side);
	return (pads.length ? pads : dz.pads).reduce((a, p) => (Math.hypot(p.x - b.x, p.y - b.y) < Math.hypot(a.x - b.x, a.y - b.y) ? p : a));
}

/** @param {Bot} b @param {World} w */
function hover(b, w) {
	b.rot = 2 * Math.sin(w.clock / 600 + 1);
	const g = Math.sin(w.clock / 1900);
	b.look = { x: 0, y: g > 0.55 ? 1 : 0 };
}

function sleepSeg() {
	return /** @type {Seg} */ ({ soft: true, until: (b, w) => !w.night || b.poke, tick: (b, w) => (b.sy = 1 + 0.025 * Math.sin(w.clock / 900)) });
}

/**
 * Fly to (x, y) in a margin, crossing by the top lane if it means changing sides. The
 * route is planned when the flight starts, since earlier legs may have changed sides.
 * @param {Bot} b @param {World} w @param {number} x @param {number} y @param {'left' | 'right'} side
 */
function flyTo(b, w, x, y, side) {
	return [
		/** @type {Seg} */ ({
			dur: 0,
			start(b, w) {
				const dz = /** @type {NonNullable<Zones['drone']>} */ (w.z.drone);
				/** @type {Seg[]} */
				const legs = [];
				if (side !== b.side && dz.topY !== null && dz[side] && dz[b.side]) {
					const lane = dz.topY;
					const col = /** @type {import('./zones.js').Span} */ (dz[b.side]);
					const dest = /** @type {import('./zones.js').Span} */ (dz[side]);
					const out = b.side === 'left' ? col.x1 : col.x0;
					const into = side === 'left' ? dest.x1 : dest.x0;
					legs.push(fly(out, Math.max(b.y, col.y0)), fly(out, lane), fly(into, lane, 1.25), now((b) => (b.side = side)));
				}
				legs.push(fly(x, y), now((b) => (b.pose = 'hover')));
				b.pose = 'fly';
				b.segs.splice(1, 0, ...legs);
			}
		})
	];
}

/** One flight leg, leaning into the motion. @param {number} x @param {number} y */
function fly(x, y, fast = 1) {
	let x0 = 0;
	let y0 = 0;
	let dir = 1;
	return /** @type {Seg} */ ({
		dur: 1000,
		start(b, w) {
			x0 = b.x;
			y0 = b.y;
			const d = Math.hypot(x - x0, y - y0);
			dir = Math.abs(x - x0) > 6 ? Math.sign(x - x0) : 0;
			if (dir && dir !== b.face) b.face = /** @type {1 | -1} */ (dir);
			this.dur = d < 1 ? 0 : Math.max(500, (d / (74 * fast * w.z.s)) * 1000);
		},
		tick(b, w, t) {
			b.x = lerp(x0, x, ease.inOut(t));
			b.y = lerp(y0, y, ease.inOut(t));
			// lean forward while accelerating, back as it brakes
			b.rot = dir * 11 * Math.sin(Math.PI * 2 * Math.min(t, 0.999)) * (t < 0.5 ? 1 : 0.55);
		},
		end(b) {
			b.rot = 0;
		}
	});
}

/** Lower the claw, let go of the note, lift. @param {World} w @param {{ x: number, y: number }} pad */
function drop(w, pad) {
	const s = w.z.s;
	return [
		now((b) => (b.pose = 'lower')),
		tween(520, (b) => ({ tip: 38, y: pad.y - PAD_HOVER * s }), ease.inOut),
		rest(160),
		tween(220, () => ({ open: 1 }), ease.out),
		now((b, w) => {
			const it = /** @type {NonNullable<World['item']>} */ (w.item);
			it.held = false;
			it.x = b.x;
			it.y = pad.y;
		}),
		tween(160, () => ({ y: pad.y - PAD_HOVER * s - 4 * s }), ease.out),
		tween(460, () => ({ tip: 26, open: 0 }), ease.inOut),
		now((b) => (b.pose = 'hover'))
	];
}
/** Lower the open claw over the note, close it, lift. @param {World} w */
function grab(w) {
	return [
		now((b) => (b.pose = 'lower')),
		tween(200, () => ({ open: 1 }), ease.out),
		tween(520, () => ({ tip: 38 }), ease.inOut),
		rest(200),
		tween(200, () => ({ open: 0 }), ease.in),
		now((b, w) => {
			const it = /** @type {NonNullable<World['item']>} */ (w.item);
			it.held = true;
			b.pose = 'lift';
		}),
		tween(160, (b) => ({ y: b.y + 3 * w.z.s }), ease.out),
		tween(520, (b) => ({ tip: 26, y: b.y - 3 * w.z.s }), ease.inOut),
		now((b) => (b.pose = 'hover'))
	];
}

// ------------------------------------------------------------------ output

/**
 * @typedef {{
 *   x: number, y: number, face: 1 | -1, rot: number, sx: number, sy: number, pose: string,
 *   look: { x: number, y: number }, blink: boolean, mark: { text: string, id: number } | null,
 *   layer: 'desk' | 'above', ground: number, shadow: number, s: number, behind: boolean,
 *   dist: number, arm: number, key: number, coil: number, tip: number, open: number, prop: string, bob: number,
 *   t: number
 * }} BotView
 */

/** What to draw this frame. @param {World} w */
function view(w) {
	const s = w.z.s;
	/** @param {Bot | null} b @returns {BotView | null} */
	const v = (b) => {
		if (!b) return null;
		let look = b.look;
		if (w.clock < b.glanceUntil) {
			const cx = w.z.cover.x + w.z.cover.w / 2;
			const cy = w.z.cover.y + w.z.cover.h / 2;
			look = { x: Math.sign(cx - b.x) * b.face, y: cy < b.y - 60 ? -1 : 0 };
		}
		if (b.pose === 'look') look = { x: 0, y: 1 };
		const lift = Math.max(0, b.ground - b.y);
		const flying = b.name === 'drone' && b.prop !== 'off';
		const bob = flying && !w.reduced ? 2.2 * s * Math.sin(w.clock / 330 + 0.7) : 0;
		return {
			x: b.x,
			y: b.y + bob,
			face: b.face,
			rot: b.rot,
			sx: b.sx,
			sy: b.sy,
			pose: b.pose,
			look,
			blink: w.clock < b.blinkUntil,
			mark: b.mark ? { text: b.mark.text, id: b.mark.id } : null,
			layer: b.layer,
			ground: b.name === 'drone' ? b.y + droneGap(b) * s : b.ground,
			shadow: b.name === 'drone' ? lerp(0.95, 0.35, (droneGap(b) - 13) / 61) : clamp(1 - lift / (110 * s), 0.35, 1),
			behind: b.passing,
			s,
			dist: b.dist,
			arm: b.arm,
			key: b.key,
			coil: b.coil,
			tip: b.tip,
			open: b.open,
			prop: b.prop,
			bob,
			t: w.clock
		};
	};
	return {
		tread: v(w.bots.tread),
		hopper: v(w.bots.hopper),
		drone: v(w.bots.drone),
		marble: w.marble ? { x: w.marble.x, y: w.z.floorY - MARBLE_R * s, r: MARBLE_R * s, angle: w.marble.angle } : null,
		t: w.clock,
		item: w.item ? { ...w.item } : null,
		reduced: w.reduced
	};
}

/** Drone height above its shadow (unscaled px): 13 when landed, 74 in flight. @param {Bot} b */
function droneGap(b) {
	return 13 + 61 * clamp((b.tip - 12) / 14, 0, 1);
}

/** Screen rect a robot occupies in a view, for tests and hit areas. @param {'tread' | 'hopper' | 'drone'} name @param {BotView} v */
export function rectOf(name, v) {
	const b = BOX[name];
	const s = v.s;
	const bottom = name === 'drone' ? b.b + (v.tip - 26) : b.b;
	return { x: v.x + b.l * s, y: v.y + b.t * s, w: (b.r - b.l) * s, h: (bottom - b.t) * s };
}
