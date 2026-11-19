<script lang="ts">
	import { fitPage } from './fit.js';
	import { pages } from './pages.js';

	let { index, side, live = false }: { index: number; side: 'left' | 'right'; live?: boolean } = $props();
	const page = $derived(pages[index]);
</script>

<!-- `live` pages are the readable ones; copies inside a turning leaf are decorative. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex (-1: focus target after a page turn, not a tab stop) -->
<article
	class="paper {side}"
	data-page={page.id}
	aria-label={live ? `Page ${index + 1}: ${page.title}` : undefined}
	tabindex={live ? -1 : undefined}
	{@attach fitPage}
>
	<div class="paper-inner">
		<page.component />
	</div>
	<p class="folio" aria-hidden="true">{index + 1}</p>
</article>
