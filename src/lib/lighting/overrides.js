// Test hooks for the room lighting, read from the page URL.
//   ?light=day | ?light=night      pin the lighting
//   ?at=2026-06-21T20:50:00-04:00  pretend the clock started at that instant (time keeps running)
// Inlined into the document head together with sun.js, so keep it import-free.

/**
 * @param {string} search location.search
 * @returns {{ offset: number, force: 'day' | 'night' | null }}
 */
export function overrides(search) {
	const q = new URLSearchParams(search);
	const at = Date.parse(q.get('at') ?? '');
	const light = q.get('light');
	return {
		offset: Number.isNaN(at) ? 0 : at - Date.now(),
		force: light === 'day' || light === 'night' ? light : null
	};
}
