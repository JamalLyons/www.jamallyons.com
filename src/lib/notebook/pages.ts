// The notebook's page order. Desktop shows pages in pairs: page 0 is the inside front
// cover (left), page N-1 the inside back cover (right), and every sheet in between has
// a front (right-hand page) and a back (left-hand page once turned).
// Page metadata lives in manifest.js; this file only joins each id to its component.
import type { Component } from 'svelte';
import { type PageId, pageMeta } from './manifest.js';
import About from './pages/About.svelte';
import Contact from './pages/Contact.svelte';
import Contents from './pages/Contents.svelte';
import ConvexTypegen from './pages/ConvexTypegen.svelte';
import DotfileSync from './pages/DotfileSync.svelte';
import Ferros from './pages/Ferros.svelte';
import Intro from './pages/Intro.svelte';
import Projects from './pages/Projects.svelte';
import Workbench from './pages/Workbench.svelte';
import Writing from './pages/Writing.svelte';

export { pageNumber } from './manifest.js';

// Keyed by id, so a page without a component (or a stray one) is a type error.
const components: Record<PageId, Component> = {
	contents: Contents,
	intro: Intro,
	about: About,
	workbench: Workbench,
	projects: Projects,
	ferros: Ferros,
	'convex-typegen': ConvexTypegen,
	'dotfile-sync': DotfileSync,
	writing: Writing,
	contact: Contact
};

export type PageDef = { id: PageId; title: string; component: Component };

export const pages: PageDef[] = pageMeta.map((p) => ({ id: p.id, title: p.title, component: components[p.id] }));

/** Phones read one page at a time and start on the introduction, then the contents. */
export const mobileOrder = [1, 0, ...pages.keys()].filter((v, i, all) => all.indexOf(v) === i);
