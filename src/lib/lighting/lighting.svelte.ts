import { overrides } from './overrides.js';
import { ATLANTA, lightAt } from './sun.js';

/** Live room lighting. `html[data-light]` drives the CSS; this mirrors it for the UI. */
export const room = $state({ light: 'day' as 'day' | 'night', clock: '' });

const clockFmt = new Intl.DateTimeFormat('en-US', {
	timeZone: ATLANTA.timeZone,
	hour: 'numeric',
	minute: '2-digit'
});

/** Keeps `html[data-light]` in step with Atlanta's sun. Returns a cleanup function. */
export function startLighting(): () => void {
	const { offset, force } = overrides(location.search);
	const html = document.documentElement;
	let flip: ReturnType<typeof setTimeout> | undefined;
	let clock: ReturnType<typeof setInterval> | undefined;

	const update = () => {
		clearTimeout(flip);
		const now = Date.now() + offset;
		room.clock = clockFmt.format(now);
		const { state, next } = lightAt(now);
		room.light = force ?? state;
		html.dataset.light = room.light;
		// Re-check at the next sunrise/sunset, and at least hourly in case the device slept.
		if (!force) flip = setTimeout(update, Math.min(next - now + 250, 3600000));
	};

	update();
	clock = setInterval(() => (room.clock = clockFmt.format(Date.now() + offset)), 15000);
	document.addEventListener('visibilitychange', update);
	return () => {
		clearTimeout(flip);
		clearInterval(clock);
		document.removeEventListener('visibilitychange', update);
	};
}
