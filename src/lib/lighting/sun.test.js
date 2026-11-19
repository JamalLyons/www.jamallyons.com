import assert from 'node:assert/strict';
import { test } from 'node:test';
import { overrides } from './overrides.js';
import { GLOW_MS, lightAt, localDate, skyAt, sunTimes } from './sun.js';

const MIN = 60000;

/** Atlanta wall-clock time of an instant, e.g. "07:42 EST". */
const atl = (/** @type {number} */ ms) =>
	new Intl.DateTimeFormat('en-US', {
		timeZone: 'America/New_York',
		hour: '2-digit',
		minute: '2-digit',
		hourCycle: 'h23',
		timeZoneName: 'short'
	}).format(ms);

// Atlanta (33.75 N, 84.39 W) times rounded to the minute. Solstice rows match published
// almanac times; the DST rows pin the EST/EDT switch.
const fixtures = [
	{ date: [2026, 1, 15], rise: '07:42 EST', set: '17:51 EST' },
	{ date: [2026, 3, 7], rise: '06:59 EST', set: '18:38 EST' }, // last day of standard time
	{ date: [2026, 3, 8], rise: '07:57 EDT', set: '19:39 EDT' }, // DST starts
	{ date: [2026, 6, 21], rise: '06:27 EDT', set: '20:51 EDT' },
	{ date: [2026, 11, 1], rise: '06:56 EST', set: '17:45 EST' }, // DST ends
	{ date: [2026, 12, 21], rise: '07:38 EST', set: '17:32 EST' }
];

test('sunrise and sunset match Atlanta reference times within 2 minutes', () => {
	for (const { date, rise, set } of fixtures) {
		const [y, m, d] = date;
		const { sunrise, sunset } = sunTimes(y, m, d);
		/** @type {Array<[number, string]>} */
		const pairs = [
			[sunrise, rise],
			[sunset, set]
		];
		for (const [got, want] of pairs) {
			const [hh, mm] = want.split(/[: ]/).map(Number);
			const [gh, gm] = atl(got).split(/[: ]/).map(Number);
			const diff = Math.abs(gh * 60 + gm - (hh * 60 + mm));
			assert.ok(diff <= 2, `${date.join('-')}: got ${atl(got)}, want ${want}`);
			assert.equal(atl(got).slice(-3), want.slice(-3), 'timezone abbreviation');
		}
	}
});

test('lighting flips at sunrise and sunset, standard and daylight time', () => {
	for (const [y, m, d] of [
		[2026, 1, 15],
		[2026, 3, 8],
		[2026, 6, 21],
		[2026, 11, 1]
	]) {
		const { sunrise, sunset } = sunTimes(y, m, d);
		assert.equal(lightAt(sunrise - MIN).state, 'night');
		assert.equal(lightAt(sunrise + MIN).state, 'day');
		assert.equal(lightAt(sunset - MIN).state, 'day');
		assert.equal(lightAt(sunset + MIN).state, 'night');
		assert.equal(lightAt(sunrise - MIN).next, sunrise);
		assert.equal(lightAt(sunset - MIN).next, sunset);
	}
});

test('after sunset the next change is the following Atlanta sunrise', () => {
	const { sunset } = sunTimes(2026, 3, 7);
	const next = sunTimes(2026, 3, 8).sunrise;
	assert.equal(lightAt(sunset + MIN).next, next);
	assert.equal(lightAt(next - MIN).state, 'night');
});

test('uses the Atlanta calendar day, not the UTC day', () => {
	// 23:30 EST on Jan 15 is already Jan 16 in UTC.
	const ms = Date.parse('2026-01-16T04:30:00Z');
	assert.deepEqual(localDate(ms), { y: 2026, m: 1, d: 15 });
	assert.equal(lightAt(ms).state, 'night');
	assert.equal(lightAt(ms).next, sunTimes(2026, 1, 16).sunrise);
});

test('the same instant gives the same state for any visitor timezone', () => {
	const instant = Date.parse('2026-06-21T12:00:00-04:00');
	const original = process.env.TZ;
	try {
		const states = ['UTC', 'Asia/Tokyo', 'America/Los_Angeles', 'Australia/Sydney'].map((tz) => {
			process.env.TZ = tz;
			return lightAt(instant).state;
		});
		assert.deepEqual(states, ['day', 'day', 'day', 'day']);
	} finally {
		process.env.TZ = original;
	}
});

test('URL overrides pin or shift the clock', () => {
	assert.deepEqual(overrides('?light=night'), { offset: 0, force: 'night', sky: null, cycle: 0 });
	assert.equal(overrides('?sky=dusk').sky, 'dusk');
	assert.equal(overrides('?sky=noon').sky, null);
	assert.equal(overrides('?light=purple').force, null);
	const { offset } = overrides('?at=2026-06-21T20:50:00-04:00');
	assert.ok(Math.abs(Date.now() + offset - Date.parse('2026-06-21T20:50:00-04:00')) < 1000);
	assert.equal(lightAt(Date.now() + offset).state, 'day');
});

test('the window glows for half an hour either side of sunrise and sunset', () => {
	const { sunrise, sunset } = sunTimes(2026, 6, 21);
	assert.equal(skyAt(sunrise - GLOW_MS - MIN).sky, null);
	assert.equal(skyAt(sunrise - GLOW_MS - MIN).next, sunrise - GLOW_MS);
	assert.equal(skyAt(sunrise).sky, 'dawn');
	assert.equal(skyAt(sunrise).next, sunrise + GLOW_MS);
	assert.equal(skyAt(sunrise + GLOW_MS + MIN).sky, null);
	assert.equal(skyAt(sunrise + GLOW_MS + MIN).next, sunset - GLOW_MS);
	assert.equal(skyAt(sunset - MIN).sky, 'dusk');
	assert.equal(skyAt(sunset + MIN).sky, 'dusk');
	const tomorrow = sunTimes(2026, 6, 22).sunrise;
	assert.equal(skyAt(sunset + GLOW_MS + MIN).sky, null);
	assert.equal(skyAt(sunset + GLOW_MS + MIN).next, tomorrow - GLOW_MS);
});

test('lighting follows a place passed in, not only the default', () => {
	const reykjavik = { name: 'Reykjavik', lat: 64.146, lon: -21.942, timeZone: 'Atlantic/Reykjavik' };
	// Midsummer: a day over 20 hours long.
	const { sunrise, sunset } = sunTimes(2026, 6, 21, reykjavik.lat, reykjavik.lon);
	assert.ok(sunset - sunrise > 20 * 60 * MIN);
	// 16:00 UTC on Dec 21 is daytime in Atlanta (11:00 EST) but after Reykjavik's ~15:30 sunset.
	const at = Date.UTC(2026, 11, 21, 16);
	assert.equal(lightAt(at).state, 'day');
	assert.equal(lightAt(at, reykjavik).state, 'night');
	assert.equal(skyAt(Date.UTC(2026, 11, 21, 15, 45), reykjavik).sky, 'dusk');
});
