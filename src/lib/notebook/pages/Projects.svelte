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
