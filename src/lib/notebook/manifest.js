// What the notebook knows about each page, in book order. Everything that refers to a
// page (contents, project index, sketch headers, navigation) reads it from here.
//
// Plain JavaScript (types in JSDoc) with no `.svelte` imports, so `node --test` can load
// it. pages.ts joins each id to its component.

/**
 * @typedef {object} PageMeta
 * @property {string} id hash anchor and plain-view section id
 * @property {string} title
 * @property {{ label?: string, note: string, sub?: boolean }} [toc] listed in the contents when set
 * @property {{ project: string, tagline: string }} [sketch] illustrates the project with this slug
 */

export const pageMeta = /** @satisfies {readonly PageMeta[]} */ (
	/** @type {const} */ ([
		{ id: 'contents', title: 'Contents' },
		{ id: 'intro', title: 'Jamal Lyons' },
		{ id: 'about', title: 'About', toc: { note: 'school, systems, the problems I like' } },
		{ id: 'workbench', title: 'Problems I like' },
		{ id: 'projects', title: 'Projects', toc: { note: 'everything I am building' } },
		{
			id: 'ferros',
			title: 'Ferros',
			toc: { note: 'a Rust-native debugger', sub: true },
			sketch: { project: 'ferros', tagline: 'a Rust-native debugger' }
		},
		{
			id: 'convex-typegen',
			title: 'Convex Typegen',
			toc: { note: 'schema → Rust types', sub: true },
			sketch: { project: 'convex-typegen', tagline: 'Convex schema → Rust types' }
		},
		{
			id: 'dotfile-sync',
			title: 'dotfile-sync',
			toc: { note: 'a Mac, set up from one repo', sub: true },
			sketch: { project: 'dotfile-sync', tagline: 'a Mac, set up from one repo' }
		},
		{ id: 'writing', title: 'Writing', toc: { note: 'articles and tutorials' } },
		{ id: 'contact', title: 'Contact', toc: { note: 'say hello' } }
	])
);

/** @typedef {(typeof pageMeta)[number]['id']} PageId */

/** @type {readonly PageMeta[]} */
const all = pageMeta;

/**
 * 1-based page number. Throws on an unknown id so a stale reference breaks the build.
 * @param {string} id
 */
export function pageNumber(id) {
	const i = all.findIndex((p) => p.id === id);
	if (i < 0) throw new Error(`Unknown notebook page: ${id}`);
	return i + 1;
}

/** Contents entries, in book order. */
export const tocEntries = all.flatMap((p) =>
	p.toc ? [{ id: p.id, label: p.toc.label ?? p.title, note: p.toc.note, sub: p.toc.sub ?? false }] : []
);

/**
 * The sketch page illustrating a project, if it has one.
 * @param {string} slug
 */
export const sketchFor = (slug) => all.find((p) => p.sketch?.project === slug);
