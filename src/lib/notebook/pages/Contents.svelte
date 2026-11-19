<script lang="ts">
	import { pageNumber } from '../pages.js';

	const entries = [
		{ id: 'about', label: 'About', note: 'school, systems, the problems I like' },
		{ id: 'projects', label: 'Projects', note: 'everything I am building' },
		{ id: 'ferros', label: 'Ferros', note: 'a Rust-native debugger', sub: true },
		{ id: 'convex-typegen', label: 'Convex Typegen', note: 'schema → Rust types', sub: true },
		{ id: 'dotfile-sync', label: 'dotfile-sync', note: 'a Mac, set up from one repo', sub: true },
		{ id: 'writing', label: 'Writing', note: 'articles and tutorials' },
		{ id: 'contact', label: 'Contact', note: 'say hello' }
	];
</script>

<h2 class="hand-title">Contents</h2>
<nav aria-label="Notebook contents">
	<ol class="toc">
		{#each entries as e (e.id)}
			<li class:sub={e.sub}>
				<a href="#{e.id}">
					<span class="toc-label">{e.label}</span>
					<span class="toc-dots" aria-hidden="true"></span>
					<span class="toc-num"><span class="sr-only">page </span>{pageNumber(e.id)}</span>
				</a>
				<span class="toc-note">{e.note}</span>
			</li>
		{/each}
	</ol>
</nav>

<p class="margin-note toc-tip" aria-hidden="true">
	tip: grab a corner, or use <kbd>←</kbd> <kbd>→</kbd>
</p>

<svg class="sketch toc-doodle" viewBox="0 0 220 90" aria-hidden="true">
	<g class="ink" fill="none">
		<path d="M10 70 q30 -50 60 -10 t60 -5 t70 -30" />
		<path d="M190 18 l12 7 l-13 6" />
		<circle cx="22" cy="72" r="5" />
	</g>
</svg>
