import assert from 'node:assert/strict';
import { test } from 'node:test';
// Node strips the types from content.ts; it has no imports of its own.
import { projects } from '../content.ts';
import { pageMeta, pageNumber, sketchFor, tocEntries } from './manifest.js';

/** @type {readonly import('./manifest.js').PageMeta[]} */
const pages = pageMeta;
const ids = pages.map((p) => p.id);

test('page ids are unique', () => {
	assert.equal(new Set(ids).size, ids.length);
});

test('project slugs are unique', () => {
	const slugs = projects.map((p) => p.slug);
	assert.equal(new Set(slugs).size, slugs.length);
});

test('every sketch page illustrates a project in content.ts', () => {
	const slugs = new Set(projects.map((p) => p.slug));
	for (const p of pages) if (p.sketch) assert.ok(slugs.has(p.sketch.project), `${p.id}: ${p.sketch.project}`);
});

test('each project has at most one sketch page', () => {
	const drawn = pages.flatMap((p) => (p.sketch ? [p.sketch.project] : []));
	assert.equal(new Set(drawn).size, drawn.length);
	for (const slug of drawn) assert.equal(sketchFor(slug)?.sketch?.project, slug);
});

test('contents entries resolve to pages, in book order', () => {
	assert.ok(tocEntries.length > 0);
	const numbers = tocEntries.map((e) => pageNumber(e.id));
	for (const [i, n] of numbers.entries()) assert.equal(ids[n - 1], tocEntries[i].id);
	assert.deepEqual(numbers, [...numbers].sort((a, b) => a - b));
});

test('pageNumber is 1-based and throws on an unknown id', () => {
	assert.equal(pageNumber(ids[0]), 1);
	assert.equal(pageNumber(ids[ids.length - 1]), ids.length);
	assert.throws(() => pageNumber('no-such-page'), /Unknown notebook page/);
});
