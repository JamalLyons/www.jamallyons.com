import { overrides } from './overrides.js';
import { lightAt, PLACE, skyAt } from './sun.js';

/** Live room lighting. `html[data-light]` drives the CSS; this mirrors it for the UI. */
export const room = $state({ light: 'day' as 'day' | 'night', clock: '', place: PLACE.name });

const clockFmt = new Intl.DateTimeFormat('en-US', {
	timeZone: PLACE.timeZone,
	hour: 'numeric',
	minute: '2-digit'
});

/** Keeps `html[data-light]` in step with the sun at `PLACE`. Returns a cleanup function. */
export function startLighting(): () => void {
	const { offset, force, sky: pinnedSky, cycle } = overrides(location.search);
	const html = document.documentElement;
	let flip: ReturnType<typeof setTimeout> | undefined;
	let clock: ReturnType<typeof setInterval> | undefined;

	const update = () => {
		clearTimeout(flip);
		const now = Date.now() + offset;
		room.clock = clockFmt.format(now);
		const light = lightAt(now);
		const glow = skyAt(now);
		room.light = force ?? light.state;
		html.dataset.light = room.light;
		const sky = pinnedSky ?? glow.sky;
		if (sky && sky !== 'none') html.dataset.sky = sky;
		else delete html.dataset.sky;
		// Re-check at the next change (glow start, sunrise/sunset, glow end), and at least
		// hourly in case the device slept.
		const next = Math.min(force ? Infinity : light.next, pinnedSky ? Infinity : glow.next);
		if (next !== Infinity && !cycle) flip = setTimeout(update, Math.min(next - now + 250, 3600000));
	};

	update();
	// Enable the sunrise/sunset transitions only after the first frames have painted.
	requestAnimationFrame(() => requestAnimationFrame(() => html.classList.add('lit')));
	// ?cycle=<seconds> flips day/night on a loop so the sunrise and sunset sequences can be watched.
	if (cycle) {
		clock = setInterval(() => {
			room.light = room.light === 'day' ? 'night' : 'day';
			html.dataset.light = room.light;
			html.dataset.sky = room.light === 'night' ? 'dusk' : 'dawn';
		}, cycle * 1000);
		return () => clearInterval(clock);
	}
	clock = setInterval(() => (room.clock = clockFmt.format(Date.now() + offset)), 15000);
	document.addEventListener('visibilitychange', update);
	return () => {
		clearTimeout(flip);
		clearInterval(clock);
		document.removeEventListener('visibilitychange', update);
	};
}
