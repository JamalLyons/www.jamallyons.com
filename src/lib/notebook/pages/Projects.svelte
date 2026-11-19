<script lang="ts">
	import { projects } from '#lib/content.js';
	import { pageNumber, sketchFor } from '../manifest.js';
</script>

<h2 class="hand-title">Projects</h2>

<ul class="project-index">
	{#each projects as p (p.slug)}
		{@const sketch = sketchFor(p.slug)}
		<li>
			<div class="pi-head">
				<a href={p.href} target="_blank" rel="noopener" class="pi-name">{p.name}<span aria-hidden="true"> ↗</span></a>
				{#if sketch}
					<a class="pi-page" href="#{sketch.id}">sketch, p. {pageNumber(sketch.id)}</a>
				{/if}
			</div>
			<p class="pi-desc">{p.description}</p>
		</li>
	{/each}
</ul>
<a class="more-link" href="https://github.com/jamallyons?tab=repositories" target="_blank" rel="noopener"
	>and more on GitHub ↗</a
>

<style>
	.project-index {
		list-style: none;
		padding: 0;
	}
	.project-index li {
		padding: 0.35em 0 0.45em;
		border-bottom: 1px dashed color-mix(in oklab, var(--ink-soft) 30%, transparent);
	}
	.pi-head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 0.6em;
		flex-wrap: wrap;
	}
	.pi-name {
		font-weight: 650;
		font-size: 1.02em;
	}
	.pi-page {
		font-family: var(--font-hand);
		font-size: 1.2em;
		color: var(--red-pen) !important;
		text-decoration: none !important;
		white-space: nowrap;
	}
	.pi-page:hover {
		text-decoration: underline !important;
	}
	.pi-desc {
		font-size: 0.84em;
		line-height: 1.45;
		color: var(--ink-soft);
	}
	.more-link {
		display: inline-block;
		margin-top: 0.6em;
		font-family: var(--font-hand);
		font-size: 1.35em;
	}
</style>
