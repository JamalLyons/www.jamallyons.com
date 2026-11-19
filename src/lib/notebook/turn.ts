// Page-turn choreography. Pure timing math lives here; the component only applies the
// frames as CSS custom properties on the book element.

export type Frame = {
	/** leaf rotation around the spine: 0 = lying on the right, -180 = lying on the left */
	angle: number;
	/** extra rotation of the outer half of the leaf, relative to the inner half */
	bend: number;
	/** 0 hidden, 1 fully on the corner */
	fingers: number;
};

const easeOut = (t: number) => 1 - (1 - t) ** 3;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

/** Phases of a turn: reach, catch the corner, turn, settle. Durations in ms. */
export const phases = [
	{ name: 'reach', ms: 200 },
	{ name: 'catch', ms: 220 },
	{ name: 'turn', ms: 640 },
	{ name: 'settle', ms: 180 }
] as const;

const LIFT = 14;
const OVERSHOOT = 3;

/** The frame at time `t` (0-1) within `phase`, for a forward (1) or backward (-1) turn. */
export function frame(dir: 1 | -1, phase: (typeof phases)[number]['name'], t: number): Frame {
	const start = dir === 1 ? 0 : -180;
	const s = dir === 1 ? -1 : 1; // the leaf's rotation direction
	switch (phase) {
		case 'reach':
			return { angle: start, bend: 0, fingers: easeOut(t) };
		case 'catch': {
			// The fingertips lift the corner, so the outer half leads.
			const e = easeOut(t);
			return { angle: start + s * LIFT * e, bend: s * 10 * e, fingers: 1 };
		}
		case 'turn': {
			// The outer half trails behind the spine half, then flattens out.
			const p = easeInOut(t);
			return {
				angle: start + s * (LIFT + (180 - LIFT + OVERSHOOT) * p),
				bend: s * 10 * (1 - p) - s * 24 * Math.sin(Math.PI * p),
				fingers: Math.max(0, 1 - t / 0.3)
			};
		}
		case 'settle':
			return { angle: start + s * (180 + OVERSHOOT - OVERSHOOT * easeOut(t)), bend: 0, fingers: 0 };
	}
}

/** CSS custom properties for a frame, including the shadow the leaf casts on each page. */
export function frameStyle({ angle, bend, fingers }: Frame): Record<string, string> {
	const rad = (angle * Math.PI) / 180;
	const over = Math.cos(rad); // >0 while the leaf is over the right page, <0 over the left
	const lift = Math.abs(Math.sin(rad));
	// Which face of each panel points at the reader. WebKit (iOS Safari) does not reliably
	// honour backface-visibility inside nested preserve-3d panels, so mirrored text bleeds
	// through mid-turn; the faces are switched explicitly instead.
	const facing = (deg: number) => (Math.cos((deg * Math.PI) / 180) >= 0 ? 'front' : 'back');
	const showA = facing(angle);
	const showB = facing(angle + bend);
	return {
		'--a-front': showA === 'front' ? 'visible' : 'hidden',
		'--a-back': showA === 'back' ? 'visible' : 'hidden',
		'--b-front': showB === 'front' ? 'visible' : 'hidden',
		'--b-back': showB === 'back' ? 'visible' : 'hidden',
		'--a': `${angle.toFixed(2)}deg`,
		'--bend': `${bend.toFixed(2)}deg`,
		'--lift': lift.toFixed(3),
		'--fingers': fingers.toFixed(3),
		'--cast-r': over > 0 ? (lift * 0.6).toFixed(3) : '0',
		'--cast-r-w': `${(Math.max(0, over) * 100 + lift * 22).toFixed(1)}%`,
		'--cast-l': over < 0 ? (lift * 0.6).toFixed(3) : '0',
		'--cast-l-w': `${(Math.max(0, -over) * 100 + lift * 22).toFixed(1)}%`
	};
}
