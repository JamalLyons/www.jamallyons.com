<script lang="ts">
	import { articles } from '#lib/content.js';

	const fmt = (d: string) =>
		new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			timeZone: 'UTC'
		});
</script>

<h2 class="hand-title">Writing</h2>
<p class="prose-lead">My reading list of things I've written.</p>

<ol class="reading-list">
	{#each articles as a (a.href)}
		<li>
			<p class="rl-meta"><time datetime={a.date}>{fmt(a.date)}</time> · {a.readTime}</p>
			<a href={a.href} target="_blank" rel="noopener" class="rl-title">{a.title}<span aria-hidden="true"> ↗</span></a>
			<p class="rl-desc">{a.summary}</p>
		</li>
	{/each}
</ol>
