<script lang="ts">
	// Two illustrated fingertips that pinch a page corner. Drawn for the bottom-right
	// corner; the left-hand version is mirrored in CSS.
	let { side, el = $bindable() }: { side: 'left' | 'right'; el?: HTMLDivElement } = $props();
</script>

<div class="fingers {side}" bind:this={el} aria-hidden="true">
	<svg viewBox="0 0 120 120">
		<g class="finger-ink">
			<!-- index finger, over the page -->
			<path class="skin" d="M118 18 C96 22 70 30 50 40 C40 45 38 58 48 62 C58 66 82 58 118 52 Z" />
			<path class="nail" d="M46 48 C44 54 48 58 54 57 C60 55 62 48 58 45 C54 43 48 44 46 48 Z" />
			<path class="crease" d="M84 38 q4 8 2 16 M96 34 q3 7 1 14" />
			<!-- thumb, under the page -->
			<path class="skin thumb" d="M120 74 C98 72 72 74 56 80 C46 84 46 96 56 98 C68 100 92 96 120 100 Z" />
			<path class="crease" d="M90 78 q3 9 0 18" />
		</g>
	</svg>
</div>
