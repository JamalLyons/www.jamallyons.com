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
