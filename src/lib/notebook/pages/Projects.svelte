<script lang="ts">
	import { projects } from '#lib/content.js';
	import { pageNumber } from '../pages.js';

	const featured: Record<string, string> = {
		Ferros: 'ferros',
		'Convex Typegen': 'convex-typegen',
		'dotfile-sync': 'dotfile-sync'
	};
</script>

<h2 class="hand-title">Projects</h2>

<ul class="project-index">
	{#each projects as p (p.href)}
		<li>
			<div class="pi-head">
				<a href={p.href} target="_blank" rel="noopener" class="pi-name">{p.name}<span aria-hidden="true"> ↗</span></a>
				{#if featured[p.name]}
					<a class="pi-page" href="#{featured[p.name]}">sketch, p. {pageNumber(featured[p.name])}</a>
				{/if}
			</div>
			<p class="pi-desc">{p.description}</p>
		</li>
	{/each}
</ul>
<a class="more-link" href="https://github.com/jamallyons?tab=repositories" target="_blank" rel="noopener"
	>and more on GitHub ↗</a
>
