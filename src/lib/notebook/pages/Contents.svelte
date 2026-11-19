<script lang="ts">
	import { pageNumber, tocEntries as entries } from '../manifest.js';
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

<style>
	.toc {
		list-style: none;
		padding: 0;
		margin-top: 0.5em !important;
	}
	.toc li {
		margin-bottom: 0.55em;
	}
	.toc li.sub {
		padding-left: 1.4em;
		margin-top: -0.25em;
	}
	.toc a {
		display: flex;
		align-items: baseline;
		gap: 0.4em;
		text-decoration: none;
		font-family: var(--font-hand);
		font-size: calc(var(--fs) * 1.75);
		line-height: 1.15;
		font-weight: 600;
	}
	.toc li.sub a {
		font-size: calc(var(--fs) * 1.45);
		font-weight: 500;
	}
	.toc a:hover .toc-label {
		text-decoration: underline wavy var(--red-pen) 1.5px;
		text-underline-offset: 5px;
	}
	.toc-dots {
		flex: 1;
		border-bottom: 2px dotted var(--pencil);
		transform: translateY(-0.25em);
		min-width: 1em;
	}
	.toc-num {
		font-size: 0.9em;
		color: var(--ink-soft);
	}
	.toc-note {
		display: block;
		font-size: 0.82em;
		line-height: 1.4;
		color: var(--pencil);
	}
	.toc-tip {
		margin-top: 1em !important;
		color: var(--pencil);
		font-size: calc(var(--fs) * 1.15);
	}
	.toc-doodle {
		width: 46%;
		margin: 0.5em 0 0 auto;
		opacity: 0.6;
	}
</style>
