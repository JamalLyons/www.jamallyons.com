<script lang="ts">
	import { links, site } from '#lib/content.js';
</script>

<h2 class="hand-title">Contact</h2>

<div class="prose">
	<p>Want to talk about backend systems, open source, or opportunities? I'd like to hear from you.</p>
</div>

<a class="email-link" href="mailto:{site.email}">{site.email}</a>

<ul class="profile-links">
	{#each links as l (l.href)}
		<li><a href={l.href} target="_blank" rel="noopener">{l.label}<span aria-hidden="true"> ↗</span></a></li>
	{/each}
</ul>

<p class="signoff">— Jamal</p>

<style>
	.email-link {
		display: inline-block;
		margin: 0.9em 0 1em;
		font-family: var(--font-hand);
		font-size: calc(var(--fs) * 2);
		font-weight: 700;
		background: linear-gradient(transparent 60%, color-mix(in oklab, var(--highlight) 90%, transparent) 60%);
		text-decoration: none !important;
		word-break: break-all;
	}
	.profile-links {
		list-style: none;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0.3em 1.2em;
	}
	.profile-links a {
		font-weight: 600;
	}
	.signoff {
		margin-top: 1.4em !important;
		font-family: var(--font-hand);
		font-size: calc(var(--fs) * 2);
		transform: rotate(-3deg);
		transform-origin: left;
	}
</style>
