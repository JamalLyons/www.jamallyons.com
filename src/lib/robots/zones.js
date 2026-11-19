// Where the desk robots may go, in screen pixels. The room art is an SVG cropped with
// `xMidYMid slice`, so how much desk shows round the book depends on the window's shape;
// the robots therefore live in a fixed screen-space overlay and derive their zones from
// the book's measured rect and the viewport, never from the SVG viewBox.
//
// Plain JavaScript (types in JSDoc) so `node --test` can load it.

/** @typedef {{ x: number, y: number, w: number, h: number }} Rect */
/**
 * What the page measures: viewport, the notebook (cover outline), the text blocks on the
 * open pages, the page controls under the book, and fixed UI to keep clear of.
 * @typedef {{
 *   vw: number, vh: number,
 *   cover: Rect,
 *   text: Rect[],
 *   controls: Rect | null,
 *   avoid: Rect[]
 * }} Layout
 */

/** Robot extents around their origin at scale 1, in px. */
export const BOX = {
	// origin: midpoint between the treads, on the desk
	tread: { l: -33, r: 35, t: -92, b: 0 },
	// origin: the foot. The spring is 18px tall, the capsule body 31px on top of it.
	hopper: { l: -18, r: 18, t: -49, b: 0 },
	// origin: body centre. Travelling, the claw (and the note in it) hangs to `b`;
	// lowered over a pad it reaches `lowB`.
	drone: { l: -24, r: 24, t: -27, b: 48, lowB: 60 }
};
/** Hopper spins round its body centre when it tumbles; this is the reach from there. */
export const TUMBLE_R = 34;
/** Hopper's body: centre height above the seat when sitting, and the hop up to the perch. */
export const SEAT_CENTRE = 15.5;
export const PERCH_HOP = 10;
/** The drone hovers this far above a note lying on the desk. */
export const PAD_HOVER = 44;
export const MARBLE_R = 7.5;
/** How far ahead of Treadbot's origin the marble sits while pushed. */
export const PUSH_OFF = 41;

const GAP = 6;
const FLOOR_LIFT = 10; // floor line sits this far above the bottom of the window

/** @param {Rect} a @param {Rect} b */
export function overlaps(a, b) {
	return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}
/** @param {Rect} r */
const right = (r) => r.x + r.w;
/** @param {Rect} r */
const bottom = (r) => r.y + r.h;

/**
 * Map a point in the room's 1600x1000 viewBox to the screen, matching `xMidYMid slice`.
 * @param {number} x @param {number} y @param {number} vw @param {number} vh
 */
export function roomToScreen(x, y, vw, vh) {
	const k = Math.max(vw / 1600, vh / 1000);
	return { x: (vw - 1600 * k) / 2 + x * k, y: (vh - 1000 * k) / 2 + y * k, k };
}

/**
 * @typedef {{ x0: number, x1: number, y0: number, y1: number }} Span  allowed origin positions
 * @typedef {{
 *   s: number,
 *   text: Rect[], cover: Rect, avoid: Rect[],
 *   floorY: number,
 *   tread: { x0: number, x1: number } | null,
 *   marble: { x0: number, x1: number } | null,
 *   hopper: { x0: number, x1: number } | null,
 *   perches: { x0: number, x1: number, y: number, edge: 'bottom' }[],
 *   drone: { left: Span | null, right: Span | null, topY: number | null, pads: { x: number, y: number, side: 'left' | 'right' }[], sleep: { x: number, y: number } | null } | null
 * }} Zones
 */

/**
 * Every zone the robots use, from one measured layout. Zones that don't fit come back
 * null (or empty), and the robot that needs them stays hidden.
 * @param {Layout} L
 * @returns {Zones}
 */
export function zonesFor(L) {
	const { vw, vh, cover, controls } = L;
	const text = L.text;
	const avoid = [...L.avoid];
	const floorY = vh - FLOOR_LIFT;

	// Robots scale with the window, and must fit (standing on the floor line) under the
	// book's cover. The page controls are dodged sideways, not shrunk under.
	const above = bottom(cover) + GAP;
	const s = Math.min(1.1, vh / 880, (floorY - above) / -BOX.tread.t);
	const floorOk = s >= 0.7;

	/** Widest stretch of the floor line, inside [a, b], clear of the avoid rects for a robot box. */
	const floorSpan = (/** @type {number} */ a, /** @type {number} */ b, /** @type {{l:number,r:number,t:number,b:number}} */ box, lift = 0) => {
		const band = { y: floorY + box.t * s - lift, h: (box.b - box.t) * s + lift };
		const blocks = avoid
			.filter((r) => r.y < band.y + band.h && band.y < bottom(r))
			.map((r) => [r.x - GAP - box.r * s, right(r) + GAP - box.l * s])
			.sort((p, q) => p[0] - q[0]);
		let best = null;
		let x = a;
		for (const [bx0, bx1] of [...blocks, [b, Infinity]]) {
			const end = Math.min(bx0, b);
			if (end - x > (best ? best.x1 - best.x0 : 0)) best = { x0: x, x1: end };
			x = Math.max(x, bx1);
		}
		return best;
	};

	let tread = null;
	let marble = null;
	let hopper = null;
	/** @type {Zones['perches']} */
	const perches = [];
	if (floorOk) {
		const c = controls ?? { x: vw / 2, y: 0, w: 0, h: 0 };
		// Treadbot and its marble take the floor right of the page controls...
		const t = floorSpan(right(c) + GAP - BOX.tread.l * s, vw - GAP - BOX.tread.r * s, BOX.tread);
		if (t && t.x1 - t.x0 >= 2 * PUSH_OFF * s + 80) {
			tread = t;
			marble = { x0: t.x0 + PUSH_OFF * s, x1: t.x1 - PUSH_OFF * s };
		}
		// ...Hopper the floor left of them; its hops reach above the strip, so it never
		// goes under the buttons.
		const hopLift = 22 * s;
		// Spinning (a poke, a tumble) it sweeps a circle wider than its upright box.
		const spin = { ...BOX.hopper, l: -28, r: 28 };
		const h = floorSpan(GAP - spin.l * s, c.x - GAP - spin.r * s, spin, hopLift);
		if (h && h.x1 - h.x0 >= 60) {
			hopper = h;
			// Perch: sitting on the cover's bottom edge, under the left page, clear of the
			// text above, the page-turn edge strip, and the controls (its spring dangles).
			const seat = bottom(cover) - 7 * s;
			// the highest it gets: the top of the hop up, or the tumble when a page turn knocks it off
			const reach = seat - Math.max(PERCH_HOP - BOX.hopper.t, SEAT_CENTRE + 8 + TUMBLE_R) * s;
			const drift = (TUMBLE_R + 50) * s; // the tumble carries it left of where it sat
			const blocks = text
				.filter((r) => bottom(r) > reach - 4)
				.map((r) => [r.x - BOX.hopper.r * s - 6, right(r) + drift + 6])
				.sort((p, q) => p[0] - q[0]);
			const a = Math.max(cover.x + 70 * s, h.x0);
			const b = Math.min(c.x - 28 * s, h.x1);
			let best = null;
			let x = a;
			for (const [bx0, bx1] of [...blocks, [b, Infinity]]) {
				const end = Math.min(bx0, b);
				if (end - x >= 24 && end - x > (best ? best.x1 - best.x0 : 0)) best = { x0: x, x1: end };
				x = Math.max(x, bx1);
			}
			if (best) perches.push({ ...best, y: seat, edge: 'bottom' });
		}
	}

	return { s: floorOk ? s : Math.min(1, Math.max(0.7, s)), text, cover, avoid, floorY, tread, marble, hopper, perches, drone: droneZones(L, floorOk ? s : 0.85) };
}

/**
 * Drone airspace: a column in each side margin, joined by a lane across the top band
 * when one fits under the fixed UI and above the book.
 * @param {Layout} L @param {number} s
 */
function droneZones(L, s) {
	const { vw, vh, cover } = L;
	const B = BOX.drone;
	const desk = roomToScreen(0, 252, vw, vh).y;

	/** Top edge of free air in [x0, x1]: below any fixed UI that sits there. */
	const ceiling = (/** @type {number} */ x0, /** @type {number} */ x1, /** @type {number} */ yMax) =>
		Math.max(0, ...L.avoid.filter((r) => r.x < x1 && right(r) > x0 && r.y < yMax / 2).map(bottom));
	/** Bottom edge of free air in [x0, x1]: above any fixed UI that sits low. */
	const floor = (/** @type {number} */ x0, /** @type {number} */ x1) =>
		Math.min(bottom(cover), ...L.avoid.filter((r) => r.x < x1 && right(r) > x0 && r.y > vh / 2).map((r) => r.y));

	/** @returns {Span | null} */
	const column = (/** @type {number} */ x0, /** @type {number} */ x1) => {
		const span = {
			x0: x0 + GAP - B.l * s,
			x1: x1 - GAP - B.r * s,
			y0: ceiling(x0, x1, vh) + GAP - B.t * s,
			y1: Math.min(floor(x0, x1), vh) - GAP - B.lowB * s
		};
		return span.x1 >= span.x0 && span.y1 - span.y0 > 120 ? span : null;
	};
	const left = column(0, cover.x);
	const right_ = column(right(cover), vw);
	if (!left && !right_) return null;

	// The top lane: the drone climbs to it at a column's inner edge, crosses above the
	// book (claw up), and drops down the other inner edge. It must clear the UI above and
	// the cover below.
	let topY = null;
	if (left && right_) {
		const reach = GAP + 2 * B.r * s;
		const lo = ceiling(cover.x - reach, right(cover) + reach, vh) + GAP - B.t * s;
		const hi = cover.y - GAP - B.b * s;
		if (hi >= lo && lo <= left.y1 && lo <= right_.y1) topY = Math.max(lo, Math.min(hi, Math.max(left.y0, right_.y0)));
	}

	/** @type {{ x: number, y: number, side: 'left' | 'right' }[]} */
	const pads = [];
	for (const [side, col] of /** @type {const} */ ([
		['left', left],
		['right', right_]
	])) {
		if (!col || (side === 'left' && topY === null && right_)) continue;
		// Pads are where items rest on the desk; the drone hovers 40s above them.
		const y0 = Math.max(col.y0 + PAD_HOVER * s, desk + 10 * s);
		const y1 = col.y1 + PAD_HOVER * s;
		if (y1 - y0 < 60) continue;
		const cx = (col.x0 + col.x1) / 2;
		for (const f of [0.08, 0.5, 0.92]) pads.push({ x: Math.round(cx + (f - 0.5) * Math.min(24, col.x1 - col.x0)), y: Math.round(y0 + (y1 - y0) * f), side });
	}

	// Night: the drone lands on the desk beside the energy drink can (right margin).
	let sleep = null;
	if (right_) {
		const canL = roomToScreen(1420, 402, vw, vh);
		const canR = roomToScreen(1468, 402, vw, vh);
		const y = canL.y - 13 * s;
		for (const x of [canL.x - 30 * s, canR.x + 30 * s]) {
			if (x >= right_.x0 && x <= right_.x1 && y >= right_.y0 && y <= right_.y1 + B.lowB * s - 12 * s) {
				sleep = { x, y };
				break;
			}
		}
		if (!sleep) sleep = { x: (right_.x0 + right_.x1) / 2, y: right_.y1 + (B.lowB - 12) * s };
	}

	return { left: pads.some((p) => p.side === 'left') ? left : null, right: right_, topY, pads, sleep };
}

/** Screen rect of a robot's box at an origin. @param {{l:number,r:number,t:number,b:number}} box @param {number} x @param {number} y @param {number} s */
export function boxAt(box, x, y, s) {
	return { x: x + box.l * s, y: y + box.t * s, w: (box.r - box.l) * s, h: (box.b - box.t) * s };
}
