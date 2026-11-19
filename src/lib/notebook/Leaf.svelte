<script lang="ts">
	// The sheet being turned. It is hinged at the spine and split into two panels so the
	// outer half can bend against the inner half. Each panel shows its slice of the front
	// (right-hand) page and the back (left-hand) page. Fingers ride on the outer panel.
	import Fingers from './Fingers.svelte';
	import Page from './Page.svelte';

	let { front, back, dir }: { front: number; back: number; dir: 1 | -1 } = $props();
</script>

<div class="leaf" aria-hidden="true" inert>
	<div class="seg seg-a">
		<div class="face front"><div class="slice"><Page index={front} side="right" /></div></div>
		<div class="face back"><div class="slice shift"><Page index={back} side="left" /></div></div>
		<div class="seg seg-b">
			<div class="face front">
				<div class="slice shift"><Page index={front} side="right" /></div>
				{#if dir === 1}<Fingers side="right" />{/if}
			</div>
			<div class="face back">
				<div class="slice"><Page index={back} side="left" /></div>
				{#if dir === -1}<Fingers side="left" />{/if}
			</div>
		</div>
	</div>
</div>
