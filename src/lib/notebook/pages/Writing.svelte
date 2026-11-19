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

<style>
	.reading-list {
		list-style: none;
		padding: 0;
		counter-reset: rl;
	}
	.reading-list li {
		position: relative;
		padding: 0.2em 0 0.8em 1.8em;
		counter-increment: rl;
	}
	.reading-list li::before {
		content: counter(rl) '.';
		position: absolute;
		left: 0;
		top: 0.05em;
		font-family: var(--font-hand);
		font-size: 1.6em;
		color: var(--red-pen);
	}
	.rl-meta {
		font-size: 0.78em;
		color: var(--pencil);
	}
	.rl-title {
		font-weight: 650;
		line-height: 1.35;
		display: inline-block;
	}
	.rl-desc {
		font-size: 0.84em;
		line-height: 1.5;
		color: var(--ink-soft);
		margin-top: 0.2em !important;
	}
</style>
