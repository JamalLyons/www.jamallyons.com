// Test hooks for the room lighting, read from the page URL.
//   ?light=day | ?light=night      pin the lighting
//   ?sky=dawn | ?sky=dusk | ?sky=none  pin the window glow
//   ?cycle=12                      flip day/night every 12 seconds to watch the transitions
//   ?at=2026-06-21T20:50:00-04:00  pretend the clock started at that instant (time keeps running)
// Inlined into the document head together with sun.js, so keep it import-free.

/**
 * @param {string} search location.search
 * @returns {{ offset: number, force: 'day' | 'night' | null, sky: 'dawn' | 'dusk' | 'none' | null, cycle: number }}
 */
export function overrides(search) {
	const q = new URLSearchParams(search);
	const at = Date.parse(q.get('at') ?? '');
	const light = q.get('light');
	const sky = q.get('sky');
	const cycle = Number(q.get('cycle'));
	return {
		offset: Number.isNaN(at) ? 0 : at - Date.now(),
		force: light === 'day' || light === 'night' ? light : null,
		sky: sky === 'dawn' || sky === 'dusk' || sky === 'none' ? sky : null,
		cycle: cycle >= 4 ? cycle : 0
	};
}
