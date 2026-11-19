<script lang="ts">
	import NetworkCanvas from '#lib/components/hero/NetworkCanvas.svelte';
	import { articles, links, projects, site } from '#lib/content.js';

	let hero = $state<HTMLElement>();
	const year = new Date().getFullYear();
	const title = `${site.name} | Portfolio`;
	const ogImage = `${site.url}/social-preview.png`;
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

<!-- Hero -->
<section bind:this={hero} class="relative isolate flex min-h-svh flex-col overflow-hidden">
	<div
		aria-hidden="true"
		class="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_center,--theme(--color-accent/8%),transparent_60%)]"
	></div>
	<div
		aria-hidden="true"
		class="absolute inset-0 -z-20 bg-[linear-gradient(to_right,--theme(--color-line/35%)_1px,transparent_1px),linear-gradient(to_bottom,--theme(--color-line/35%)_1px,transparent_1px)] mask-[radial-gradient(ellipse_at_center,black_20%,transparent_75%)] bg-size-[56px_56px]"
	></div>
	<div class="absolute inset-0 -z-10">
		<NetworkCanvas target={hero} />
	</div>
	<!-- Scrim keeps the headline readable over the mesh -->
	<div
		aria-hidden="true"
		class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_25%_50%,--theme(--color-bg/85%),transparent_70%)] max-sm:bg-[radial-gradient(ellipse_100%_50%_at_30%_50%,--theme(--color-bg/80%),transparent_80%)]"
	></div>

	<nav class="relative mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 text-sm">
		<a href="/" class="font-bold tracking-tight text-fg">jl<span class="text-accent">_</span></a>
		<div class="flex gap-6 text-muted">
			<a href="#about" class="transition-colors hover:text-fg">about</a>
			<a href="#projects" class="transition-colors hover:text-fg">projects</a>
			<a href="#writing" class="hidden transition-colors hover:text-fg sm:inline">writing</a>
			<a href="#contact" class="transition-colors hover:text-fg">contact</a>
		</div>
	</nav>

	<div class="pointer-events-none relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 pb-24">
		<p class="mb-5 text-sm text-accent">
			<span class="text-muted">$</span> whoami
		</p>
		<h1 class="text-5xl font-bold tracking-tight text-balance sm:text-7xl">
			{site.name}<span class="animate-pulse text-accent">_</span>
		</h1>
		<p class="mt-6 max-w-xl text-lg text-pretty text-muted sm:text-xl">
			Building the invisible layers that make software feel alive: real-time servers, APIs, and systems that are
			fast, reliable, and built to scale.
		</p>
		<p class="mt-3 text-sm text-muted/80">{site.role}</p>

		<div class="pointer-events-auto mt-10 flex flex-wrap gap-3 text-sm">
			<a
				href="#projects"
				class="rounded-md bg-accent px-5 py-2.5 font-bold text-bg transition hover:bg-accent/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
				>view work</a
			>
			<a
				href="#contact"
				class="rounded-md border border-line bg-surface/60 px-5 py-2.5 text-fg backdrop-blur-sm transition hover:border-accent/60"
				>get in touch</a
			>
		</div>
		<p class="mt-8 hidden text-xs text-muted/70 sm:block">
			move your cursor to become a client · click to send a burst
		</p>
	</div>
</section>

<main class="mx-auto max-w-6xl px-6">
	<!-- About -->
	<section id="about" class="grid scroll-mt-12 gap-10 border-t border-line py-24 md:grid-cols-[200px_1fr]">
		<h2 class="text-sm text-accent">// about</h2>
		<div class="max-w-2xl space-y-5 text-lg leading-relaxed text-muted">
			<p>
				I'm a Computer Science student at <span class="text-fg">Georgia State University</span> with a growing passion
				for <span class="text-fg">backend architecture</span> and <span class="text-fg">systems programming</span>. I
				love building the invisible layers that make software feel alive, from real-time servers and notification
				systems to networking and performance optimizations.
			</p>
			<p>
				I'm constantly exploring how things work under the hood, whether it's designing efficient APIs, optimizing data
				flow, or diving into low-level code to understand what really makes computers tick. For me, development isn't
				just about writing code. It's about crafting systems that are fast, reliable, and built to scale.
			</p>
			<ul class="flex flex-wrap gap-x-5 gap-y-2 pt-4 text-sm">
				{#each links as link (link.href)}
					<li>
						<a href={link.href} class="text-muted transition-colors hover:text-accent" target="_blank" rel="noopener"
							>{link.label} ↗</a
						>
					</li>
				{/each}
			</ul>
		</div>
	</section>

	<!-- Projects -->
	<section id="projects" class="grid scroll-mt-12 gap-10 border-t border-line py-24 md:grid-cols-[200px_1fr]">
		<h2 class="text-sm text-accent">// projects</h2>
		<div>
			<div class="grid gap-4 sm:grid-cols-2">
				{#each projects as project (project.href)}
					<a
						href={project.href}
						target="_blank"
						rel="noopener"
						class="group relative flex flex-col rounded-lg border border-line bg-surface/50 p-6 transition hover:-translate-y-0.5 hover:border-accent/50 hover:bg-surface"
					>
						<div class="flex items-start justify-between gap-4">
							<h3 class="font-bold text-fg">{project.name}</h3>
							<span class="text-muted transition group-hover:translate-x-0.5 group-hover:text-accent">↗</span>
						</div>
						<p class="mt-3 flex-1 text-sm leading-relaxed text-muted">{project.description}</p>
						<ul class="mt-5 flex flex-wrap gap-2 text-xs">
							{#each project.tags as tag (tag)}
								<li class="rounded border border-line px-2 py-0.5 text-muted">{tag}</li>
							{/each}
						</ul>
					</a>
				{/each}
			</div>
			<a
				href="https://github.com/jamallyons?tab=repositories"
				target="_blank"
				rel="noopener"
				class="mt-6 inline-block text-sm text-muted transition-colors hover:text-accent">and more on GitHub →</a
			>
		</div>
	</section>

	<!-- Writing -->
	<section id="writing" class="grid scroll-mt-12 gap-10 border-t border-line py-24 md:grid-cols-[200px_1fr]">
		<h2 class="text-sm text-accent">// writing</h2>
		<ol class="divide-y divide-line">
			{#each articles as article (article.href)}
				<li>
					<a href={article.href} target="_blank" rel="noopener" class="group block py-8 first:pt-0">
						<p class="text-xs text-muted">
							<time datetime={article.date}>{article.date}</time> · {article.readTime}
						</p>
						<h3 class="mt-2 text-lg font-bold text-fg transition-colors group-hover:text-accent">
							{article.title}
						</h3>
						<p class="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{article.summary}</p>
						<p class="mt-4 text-xs text-muted/80">
							{#each article.tags as tag (tag)}<span class="mr-3">#{tag.toLowerCase()}</span>{/each}
						</p>
					</a>
				</li>
			{/each}
		</ol>
	</section>

	<!-- Contact -->
	<section id="contact" class="grid scroll-mt-12 gap-10 border-t border-line py-24 md:grid-cols-[200px_1fr]">
		<h2 class="text-sm text-accent">// contact</h2>
		<div class="max-w-2xl">
			<p class="text-2xl leading-snug font-bold text-balance sm:text-3xl">
				Want to talk backend systems, open source, or opportunities?
			</p>
			<div class="mt-8 flex flex-wrap gap-3 text-sm">
				<a
					href="mailto:{site.email}"
					class="rounded-md bg-accent px-5 py-2.5 font-bold text-bg transition hover:bg-accent/85">{site.email}</a
				>
				<a
					href="https://x.com/codingwithjamal"
					target="_blank"
					rel="noopener"
					class="rounded-md border border-line px-5 py-2.5 text-fg transition hover:border-accent/60">DM on X ↗</a
				>
			</div>
		</div>
	</section>
</main>

<footer class="mx-auto max-w-6xl border-t border-line px-6 py-10 text-xs text-muted">
	<p>© {year} {site.name}</p>
</footer>
