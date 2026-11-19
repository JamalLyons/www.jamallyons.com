// Atlanta sunrise/sunset and the room's lighting state.
//
// Plain JavaScript (types in JSDoc) on purpose: the same source is inlined into the
// document head so the first paint already has the right lighting. Keep it free of
// imports and keep every top-level statement a `const` or `function`.
//
// Sun times use the NOAA-style sunrise equation (about a minute of error at Atlanta's
// latitude). They are absolute instants, so the visitor's own timezone never matters:
// the only use of `America/New_York` is to decide which Atlanta calendar day "now" is in.

export const ATLANTA = { lat: 33.749, lon: -84.388, timeZone: 'America/New_York' };

const DAY_MS = 86400000;
const J1970 = 2440587.5;
const J2000 = 2451545;
const RAD = Math.PI / 180;

/**
 * Atlanta's calendar date at an instant.
 * @param {number} ms epoch milliseconds
 * @param {string} [timeZone]
 * @returns {{ y: number, m: number, d: number }}
 */
export function localDate(ms, timeZone = ATLANTA.timeZone) {
	const parts = new Intl.DateTimeFormat('en-US', {
		timeZone,
		year: 'numeric',
		month: 'numeric',
		day: 'numeric'
	}).formatToParts(new Date(ms));
	/** @param {string} type */
	const get = (type) => Number(parts.find((p) => p.type === type)?.value);
	return { y: get('year'), m: get('month'), d: get('day') };
}

/**
 * Sunrise and sunset for a calendar day at a place, as epoch milliseconds.
 * @param {number} y
 * @param {number} m 1-12
 * @param {number} d
 * @param {number} [lat]
 * @param {number} [lon] east positive
 * @returns {{ sunrise: number, sunset: number }}
 */
export function sunTimes(y, m, d, lat = ATLANTA.lat, lon = ATLANTA.lon) {
	const jdNoon = Date.UTC(y, m - 1, d, 12) / DAY_MS + J1970;
	const n = Math.round(jdNoon - J2000 + 0.0008);
	const jStar = n - lon / 360;
	const M = (357.5291 + 0.98560028 * jStar) % 360;
	const C = 1.9148 * Math.sin(M * RAD) + 0.02 * Math.sin(2 * M * RAD) + 0.0003 * Math.sin(3 * M * RAD);
	const lambda = (M + C + 180 + 102.9372) % 360;
	const transit = J2000 + jStar + 0.0053 * Math.sin(M * RAD) - 0.0069 * Math.sin(2 * lambda * RAD);
	const sinDec = Math.sin(lambda * RAD) * Math.sin(23.4397 * RAD);
	const cosDec = Math.cos(Math.asin(sinDec));
	const cosH = (Math.sin(-0.833 * RAD) - Math.sin(lat * RAD) * sinDec) / (Math.cos(lat * RAD) * cosDec);
	const h = Math.acos(Math.min(1, Math.max(-1, cosH))) / RAD;
	const toMs = (/** @type {number} */ jd) => Math.round((jd - J1970) * DAY_MS);
	return { sunrise: toMs(transit - h / 360), sunset: toMs(transit + h / 360) };
}

/**
 * The room's lighting at an instant, and when it next changes.
 * @param {number} ms epoch milliseconds
 * @returns {{ state: 'day' | 'night', sunrise: number, sunset: number, next: number }}
 */
export function lightAt(ms) {
	const { y, m, d } = localDate(ms);
	const { sunrise, sunset } = sunTimes(y, m, d);
	if (ms < sunrise) return { state: 'night', sunrise, sunset, next: sunrise };
	if (ms < sunset) return { state: 'day', sunrise, sunset, next: sunset };
	const t = new Date(Date.UTC(y, m - 1, d + 1));
	const tomorrow = sunTimes(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
	return { state: 'night', sunrise, sunset, next: tomorrow.sunrise };
}

/** How long before and after sunrise/sunset the window glows. */
export const GLOW_MS = 30 * 60000;

/**
 * The sky's colour at an instant: a warm glow for half an hour either side of sunrise
 * (`dawn`) and sunset (`dusk`), otherwise none. `next` is when that changes.
 * @param {number} ms epoch milliseconds
 * @returns {{ sky: 'dawn' | 'dusk' | null, next: number }}
 */
export function skyAt(ms) {
	const { y, m, d } = localDate(ms);
	const today = sunTimes(y, m, d);
	const t = new Date(Date.UTC(y, m - 1, d + 1));
	const tomorrow = sunTimes(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
	/** @type {Array<[number, 'dawn' | 'dusk']>} */
	const glows = [
		[today.sunrise, 'dawn'],
		[today.sunset, 'dusk'],
		[tomorrow.sunrise, 'dawn']
	];
	for (const [at, sky] of glows) {
		if (ms < at - GLOW_MS) return { sky: null, next: at - GLOW_MS };
		if (ms < at + GLOW_MS) return { sky, next: at + GLOW_MS };
	}
	return { sky: null, next: tomorrow.sunrise - GLOW_MS };
}
