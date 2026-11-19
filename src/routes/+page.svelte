<script lang="ts">
	import { site } from '#lib/content.js';
	import { room, startLighting } from '#lib/lighting/lighting.svelte.js';
	import Notebook from '#lib/notebook/Notebook.svelte';
	import Room from '#lib/room/Room.svelte';
	import { onMount } from 'svelte';

	const title = `${site.name} | Portfolio`;
	const ogImage = `${site.url}/social-preview.png`;

	onMount(startLighting);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={site.description} />
	<meta name="author" content={site.name} />
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href="{site.url}/" />

	<meta property="og:type" content="website" />
	<meta property="og:url" content="{site.url}/" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={site.shortDescription} />
	<meta property="og:image" content={ogImage} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={site.shortDescription} />
	<meta name="twitter:creator" content={site.twitter} />
	<meta name="twitter:image" content={ogImage} />
</svelte:head>

<div class="scene">
	<Room />
	<!-- Room lighting layers. The lamp pool and LED halo live on the book (Notebook.svelte). -->
	<div class="light sun-beams" aria-hidden="true"></div>
	<div class="light night-dim" aria-hidden="true"></div>
	<div class="light sky-tint" aria-hidden="true"></div>

	<main class="desk-surface">
		<Notebook />
	</main>

	<p class="clock-tag" aria-live="off">
		{#if room.clock}
			{room.clock} in Atlanta · {room.light === 'day' ? 'lamp off' : 'lamp on'}
		{/if}
	</p>
</div>
