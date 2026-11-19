import assert from 'node:assert/strict';
import { test } from 'node:test';
import { pageMeta } from './manifest.js';
import { navigation } from './navigation.js';

/** @type {readonly { id: string, title: string }[]} */
const pages = pageMeta;
const nav = navigation(pages);
const n = pages.length;

test('every page shows on exactly one desktop spread', () => {
	assert.equal(nav.lastSpread, Math.ceil(n / 2) - 1);
	const seen = [];
	for (let s = 0; s <= nav.lastSpread; s++) {
		const { left, right } = nav.spreadPages(s);
		seen.push(left, right);
		assert.equal(nav.spreadOf(pages[left].id), s);
		if (right < n) assert.equal(nav.spreadOf(pages[right].id), s);
	}
	assert.deepEqual(
		seen.filter((i) => i < n),
		pages.map((_, i) => i)
	);
});

test('spreads at both ends', () => {
	assert.deepEqual(nav.spreadPages(0), { left: 0, right: 1 });
	assert.deepEqual(nav.spreadPages(nav.lastSpread), { left: n - 2, right: n - 1 });
	assert.equal(nav.clampSpread(-3), 0);
	assert.equal(nav.clampSpread(nav.lastSpread + 4), nav.lastSpread);
});

test('phones read intro, then contents, then the rest in book order', () => {
	const ids = nav.order.map((i) => pages[i].id);
	assert.deepEqual(ids.slice(0, 2), ['intro', 'contents']);
	assert.deepEqual(
		ids.slice(2),
		pages.map((p) => p.id).filter((id) => id !== 'intro' && id !== 'contents')
	);
	assert.equal(nav.contentsPosition, 1);
	assert.equal(nav.contentsSpread, 0);
	assert.equal(nav.lastPosition, n - 1);
	for (const [pos, i] of nav.order.entries()) {
		assert.equal(nav.positionOf(pages[i].id), pos);
		assert.equal(nav.pageAt(pos), i);
	}
	assert.equal(nav.clampPosition(-1), 0);
	assert.equal(nav.clampPosition(n), n - 1);
});

test('turn leaf faces for forward and backward jumps', () => {
	for (let s = 0; s <= nav.lastSpread; s++) {
		for (let t = 0; t <= nav.lastSpread; t++) {
			const turn = nav.turn(s, t);
			if (s === t) assert.equal(turn, undefined);
			else if (t > s)
				assert.deepEqual(turn, { dir: 1, to: t, front: 2 * s + 1, back: 2 * t, left: 2 * s, right: 2 * t + 1 });
			else assert.deepEqual(turn, { dir: -1, to: t, front: 2 * t + 1, back: 2 * s, left: 2 * t, right: 2 * s + 1 });
		}
	}
	assert.deepEqual(nav.turn(0, 3), { dir: 1, to: 3, front: 1, back: 6, left: 0, right: 7 });
	assert.deepEqual(nav.turn(4, 1), { dir: -1, to: 1, front: 3, back: 8, left: 2, right: 9 });
});

test('hashes: empty for the first spread or position, else a page id', () => {
	assert.equal(nav.spreadHash(0), '');
	assert.equal(nav.spreadHash(1), `#${pages[2].id}`);
	assert.equal(nav.spreadHash(nav.lastSpread), `#${pages[n - 2].id}`);
	assert.equal(nav.positionHash(0), '');
	assert.equal(nav.positionHash(1), '#contents');
	assert.equal(nav.positionHash(2), `#${pages[2].id}`);
});

test('hash ids resolve, with or without the #; unknown ones do not', () => {
	assert.equal(nav.find('#about'), 2);
	assert.equal(nav.find('about'), 2);
	for (const bad of ['', '#', '#nope', 'Contents']) {
		assert.equal(nav.find(bad), undefined);
		assert.equal(nav.spreadOf(bad), undefined);
		assert.equal(nav.positionOf(bad), undefined);
	}
});

test('announcements and pager text', () => {
	assert.equal(nav.spreadLabel(1), 'Pages 3 and 4: About, Problems I like');
	assert.equal(nav.positionLabel(0), 'Page 2: Jamal Lyons');
	assert.equal(nav.positionLabel(1), 'Page 1: Contents');
	assert.equal(nav.pager(1), '3–4 of 10');
});

test('a request with no turn running starts one; reduced motion jumps', () => {
	const book = { spread: 1 };
	assert.equal(nav.request(book, 1), book);
	assert.deepEqual(nav.request(book, 3), { spread: 1, turning: nav.turn(1, 3) });
	assert.deepEqual(nav.request(book, 3, true), { spread: 3 });
	assert.deepEqual(nav.request(book, 99), { spread: 1, turning: nav.turn(1, nav.lastSpread) });
	const first = { spread: 0 };
	assert.equal(nav.request(first, -1), first);
});

test('mid-turn requests queue, the latest wins, and land turns to them next', () => {
	let book = nav.request({ spread: 0 }, 1);
	assert.equal(nav.aim(book), 1);
	book = nav.request(book, nav.aim(book) + 1);
	assert.equal(book.queued, 2);
	assert.equal(book.spread, 0);
	assert.deepEqual(book.turning, nav.turn(0, 1));
	book = nav.request(book, nav.aim(book) + 1);
	assert.equal(nav.aim(book), 3);
	// even reduced motion waits for the running turn
	assert.equal(nav.request(book, 0, true).queued, 0);

	const landed = nav.land(book);
	assert.deepEqual(landed, { book: { spread: 1 }, next: 3 });
	assert.deepEqual(nav.request(landed.book, landed.next ?? -1), { spread: 1, turning: nav.turn(1, 3) });
	assert.deepEqual(nav.land(nav.request({ spread: 2 }, 0)), { book: { spread: 0 }, next: undefined });
});

test('queued moves clamp to the book', () => {
	const book = nav.request(nav.request({ spread: nav.lastSpread - 1 }, nav.lastSpread), nav.lastSpread + 5);
	assert.equal(book.queued, nav.lastSpread);
});
