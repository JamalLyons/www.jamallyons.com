// The notebook's page order. Desktop shows pages in pairs: page 0 is the inside front
// cover (left), page N-1 the inside back cover (right), and every sheet in between has
// a front (right-hand page) and a back (left-hand page once turned).
import type { Component } from 'svelte';
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

export type PageDef = { id: string; title: string; component: Component };

export const pages: PageDef[] = [
	{ id: 'contents', title: 'Contents', component: Contents },
	{ id: 'intro', title: 'Jamal Lyons', component: Intro },
	{ id: 'about', title: 'About', component: About },
	{ id: 'workbench', title: 'Problems I like', component: Workbench },
	{ id: 'projects', title: 'Projects', component: Projects },
	{ id: 'ferros', title: 'Ferros', component: Ferros },
	{ id: 'convex-typegen', title: 'Convex Typegen', component: ConvexTypegen },
	{ id: 'dotfile-sync', title: 'dotfile-sync', component: DotfileSync },
	{ id: 'writing', title: 'Writing', component: Writing },
	{ id: 'contact', title: 'Contact', component: Contact }
];

export const pageNumber = (id: string) => pages.findIndex((p) => p.id === id) + 1;

/** Phones read one page at a time and start on the introduction, then the contents. */
export const mobileOrder = [1, 0, ...pages.keys()].filter((v, i, all) => all.indexOf(v) === i);
