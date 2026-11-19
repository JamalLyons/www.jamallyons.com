<script lang="ts">
	// Heading for a project sketch page: name and repo from content.ts, tagline from the manifest.
	import { projectBySlug } from '#lib/content.js';
	import { sketchFor } from './manifest.js';

	let { slug }: { slug: string } = $props();
	const project = $derived(projectBySlug(slug));
	const tagline = $derived.by(() => {
		const sketch = sketchFor(slug)?.sketch;
		if (!sketch) throw new Error(`No sketch page for project: ${slug}`);
		return sketch.tagline;
	});
</script>

<h2 class="hand-title">{project.name}</h2>
<p class="project-sub">
	{tagline} · <a href={project.href} target="_blank" rel="noopener">{project.href.replace(/^https:\/\//, '')} ↗</a>
</p>
