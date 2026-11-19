// Which pages show where. Desktop reads the book in spreads (pages 2s and 2s+1 side by
// side); phones read one page at a time in their own order. Every page-index decision
// the notebook makes goes through here; Notebook.svelte only applies the answers.
//
// Plain JavaScript (types in JSDoc) so `node --test` can load it.

/**
 * @typedef {object} Turn a leaf turning from one spread to another
 * @property {1 | -1} dir 1 forward, -1 back
 * @property {number} to the spread the turn lands on
 * @property {number} front page on the leaf's front (the right-hand side before a forward turn)
 * @property {number} back page on the leaf's back
 * @property {number} left page lying under the leaf on the left while it turns
 * @property {number} right page lying under the leaf on the right while it turns
 */

/**
 * @typedef {object} Book desktop navigation state
 * @property {number} spread the spread lying open (the one a turn starts from)
 * @property {Turn} [turning] the turn in progress
 * @property {number} [queued] spread requested mid-turn, turned to once this one lands
 */

/** @param {Book} book */
const aim = (book) => book.queued ?? book.turning?.to ?? book.spread;

/** @param {number} n @param {number} max */
const clamp = (n, max) => Math.max(0, Math.min(max, n));

/**
 * @param {readonly { id: string, title: string }[]} pages in book order
 * @param {{ start?: string, contents?: string }} [ids] phones open on `start`, then `contents`
 */
export function navigation(pages, { start = 'intro', contents = 'contents' } = {}) {
	/** @param {string} id page index, or undefined for an unknown id */
	const find = (id) => {
		const i = pages.findIndex((p) => p.id === id.replace(/^#/, ''));
		return i < 0 ? undefined : i;
	};
	const known = (/** @type {string} */ id) => {
		const i = find(id);
		if (i === undefined) throw new Error(`Unknown notebook page: ${id}`);
		return i;
	};

	// Every spread is a left and a right page, from the inside front cover to the inside
	// back cover. An odd count would leave the last spread without a right page.
	if (pages.length % 2) throw new Error(`The notebook needs an even page count, got ${pages.length}`);
	const lastSpread = pages.length / 2 - 1;
	/** @param {number} s */
	const spreadPages = (s) => ({ left: s * 2, right: s * 2 + 1 });
	/** @param {number} i */
	const spreadOfIndex = (i) => Math.floor(i / 2);

	// Phones: the start page, then the contents, then everything else in book order.
	const first = [known(start), known(contents)];
	const order = [...first, ...pages.map((_, i) => i).filter((i) => !first.includes(i))];
	const lastPosition = order.length - 1;

	/**
	 * The leaf and the pages under it for a turn between two spreads. The leaf carries
	 * the lower spread's right page on its front and the higher spread's left page on its
	 * back; underneath lie the lower spread's left page and the higher spread's right.
	 * @param {number} from
	 * @param {number} to
	 * @returns {Turn | undefined} undefined when there is nothing to turn
	 */
	const turn = (from, to) => {
		if (from === to) return undefined;
		const lo = spreadPages(Math.min(from, to));
		const hi = spreadPages(Math.max(from, to));
		return { dir: from < to ? 1 : -1, to, front: lo.right, back: hi.left, left: lo.left, right: hi.right };
	};

	return {
		/** Phones' reading order, as page indexes. */
		order,
		lastSpread,
		lastPosition,
		contentsSpread: spreadOfIndex(known(contents)),
		contentsPosition: order.indexOf(known(contents)),

		/** @param {number} pos */
		clampPosition: (pos) => clamp(pos, lastPosition),

		spreadPages,
		/** @param {string} id spread showing that page; undefined when unknown */
		spreadOf(id) {
			const i = find(id);
			return i === undefined ? undefined : spreadOfIndex(i);
		},
		/** @param {string} id phone position of that page; undefined when unknown */
		positionOf(id) {
			const i = find(id);
			return i === undefined ? undefined : order.indexOf(i);
		},
		/** @param {number} pos */
		pageAt: (pos) => order[pos],

		/** Where the book is headed: relative moves made mid-turn count from here. */
		aim,

		/**
		 * Ask for a spread. Mid-turn the request is queued (the latest wins); otherwise the
		 * book starts turning, or jumps straight there when `instant`.
		 * @param {Book} book
		 * @param {number} target clamped to the book
		 * @param {boolean} [instant]
		 * @returns {Book} the same object when nothing changes
		 */
		request(book, target, instant = false) {
			target = clamp(target, lastSpread);
			if (book.turning) return { ...book, queued: target };
			if (target === book.spread) return book;
			if (instant) return { spread: target };
			return { spread: book.spread, turning: turn(book.spread, target) };
		},

		/**
		 * The turn in progress has landed.
		 * @param {Book} book
		 * @returns {{ book: Book, next?: number }} `next` is the queued request, to make now
		 */
		land(book) {
			return { book: { spread: book.turning?.to ?? book.spread }, next: book.queued };
		},

		/** @param {number} s hash to write for a spread: empty for the first, else its left page */
		spreadHash: (s) => (s === 0 ? '' : `#${pages[spreadPages(s).left].id}`),
		/** @param {number} pos hash to write for a phone position: empty for the first */
		positionHash: (pos) => (pos === 0 ? '' : `#${pages[order[pos]].id}`),

		/** @param {number} s screen-reader text for a spread */
		spreadLabel(s) {
			const { left, right } = spreadPages(s);
			return `Pages ${left + 1} and ${right + 1}: ${pages[left].title}, ${pages[right].title}`;
		},
		/** @param {number} pos screen-reader text for a phone position */
		positionLabel(pos) {
			const i = order[pos];
			return `Page ${i + 1}: ${pages[i].title}`;
		},

		/** @param {number} s desktop pager, e.g. "3–4 of 10" */
		pager(s) {
			const { left, right } = spreadPages(s);
			return `${left + 1}–${right + 1} of ${pages.length}`;
		}
	};
}
