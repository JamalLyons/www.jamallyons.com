<script lang="ts">
	// The open notebook: a two-page spread on desktop, one page at a time on phones, and a
	// plain reading view. navigation.js decides which pages show; this file animates, moves
	// focus and keeps the hash in step.
	import { goto } from '$app/navigation';
	import { onMount, tick } from 'svelte';
	import Fingers from './Fingers.svelte';
	import Leaf from './Leaf.svelte';
	import Page from './Page.svelte';
	import { SINGLE_PAGE_QUERY } from './breakpoint.js';
	import { type Book, navigation } from './navigation.js';
	import { pages } from './pages.js';
	import { frame, frameStyle, phases } from './turn.js';

	const nav = navigation(pages);

	let book = $state.raw<Book>({ spread: 0 });
	let single = $state(0); // position in the phone reading order
	let plain = $state(false);
	let announce = $state('');

	const spread = $derived(book.spread);
	const turning = $derived(book.turning);

	let bookEl = $state<HTMLElement>();
	let singleEl = $state<HTMLElement>();
	let hover = $state<'left' | 'right'>();

	const leftPage = $derived(turning ? turning.left : nav.spreadPages(spread).left);
	const rightPage = $derived(turning ? turning.right : nav.spreadPages(spread).right);
	const singlePage = $derived(nav.pageAt(single));

	const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
	const isSingle = () => matchMedia(SINGLE_PAGE_QUERY).matches;

	// ---- desktop spread --------------------------------------------------------------

	function turnTo(target: number, focus = false) {
		const was = book;
		book = nav.request(book, target, reduceMotion());
		// Mid-turn requests only queue; an unchanged book has nowhere to go.
		if (was.turning || book === was) return;
		if (!book.turning) return void settle(focus);
		// Things on the desk (the robots) react to a page starting to turn.
		window.dispatchEvent(new CustomEvent('notebook:turn', { detail: { dir: book.turning.dir } }));
		animate(book.turning.dir).then(() => {
			const { book: landed, next } = nav.land(book);
			book = landed;
			settle(focus);
			if (next !== undefined) turnTo(next, focus);
		});
	}

	function animate(dir: 1 | -1): Promise<void> {
		// Start from this turn's first frame, not the last turn's final one.
		for (const [k, v] of Object.entries(frameStyle(frame(dir, phases[0].name, 0)))) bookEl?.style.setProperty(k, v);
		return new Promise((resolve) => {
			let i = 0;
			let t0 = performance.now();
			const step = (now: number) => {
				const phase = phases[i];
				const t = Math.min(1, (now - t0) / phase.ms);
				const style = frameStyle(frame(dir, phase.name, t));
				for (const [k, v] of Object.entries(style)) bookEl?.style.setProperty(k, v);
				if (t < 1) return requestAnimationFrame(step);
				if (++i === phases.length) return resolve();
				t0 = now;
				requestAnimationFrame(step);
			};
			requestAnimationFrame(step);
		});
	}

	async function settle(focus: boolean) {
		announce = nav.spreadLabel(book.spread);
		syncHash(nav.spreadHash(book.spread));
		tick().then(() => window.dispatchEvent(new CustomEvent('notebook:settle')));
		if (focus) {
			await tick();
			bookEl?.querySelector<HTMLElement>('.paper.left')?.focus({ preventScroll: true });
		}
	}

	// ---- phone, one page at a time ---------------------------------------------------

	let slide = $state<'from-right' | 'from-left' | ''>('');

	async function showSingle(pos: number, focus = false) {
		pos = nav.clampPosition(pos);
		if (pos === single) return;
		slide = reduceMotion() ? '' : pos > single ? 'from-right' : 'from-left';
		single = pos;
		announce = nav.positionLabel(pos);
		syncHash(nav.positionHash(pos));
		await tick();
		window.scrollTo({ top: 0, behavior: 'instant' });
		if (focus) singleEl?.querySelector<HTMLElement>('.paper')?.focus({ preventScroll: true });
	}

	let swipe: { x: number; y: number; id: number } | undefined;
	function onPointerDown(e: PointerEvent) {
		if (e.pointerType === 'mouse') return;
		swipe = { x: e.clientX, y: e.clientY, id: e.pointerId };
	}
	function onPointerUp(e: PointerEvent) {
		if (!swipe || swipe.id !== e.pointerId) return;
		const dx = e.clientX - swipe.x;
		const dy = e.clientY - swipe.y;
		swipe = undefined;
		if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) showSingle(single + (dx < 0 ? 1 : -1));
	}

	// ---- shared ---------------------------------------------------------------------

	function go(id: string, focus = true) {
		const target = nav.spreadOf(id);
		const pos = nav.positionOf(id);
		if (target === undefined || pos === undefined || plain) return false;
		if (isSingle()) showSingle(pos, focus);
		else turnTo(target, focus);
		return true;
	}

	/** @param hash `#id`, or empty for the first page */
	function syncHash(hash: string) {
		if (location.hash === hash) return;
		goto(hash || location.pathname + location.search, { replace: true, shallow: true, state: {} });
	}

	function onClick(e: MouseEvent) {
		if (!(e.target instanceof Element)) return;
		const a = e.target.closest<HTMLAnchorElement>('a[href^="#"]');
		if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
		if (go(a.hash.slice(1))) e.preventDefault();
	}

	function onKey(e: KeyboardEvent) {
		if (plain || e.altKey || e.metaKey || e.ctrlKey) return;
		// Keys sent to the window itself have no element to check.
		if (e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable]')) return;
		const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
		if (!delta) return;
		e.preventDefault();
		if (isSingle()) showSingle(single + delta);
		else turnTo(nav.aim(book) + delta);
	}

	function setPlain(on: boolean) {
		plain = on;
		document.documentElement.dataset.view = on ? 'plain' : 'book';
		try {
			localStorage.setItem('notebook:view', on ? 'plain' : 'book');
		} catch {}
		window.scrollTo({ top: 0, behavior: 'instant' });
	}

	function openFromHash() {
		const target = nav.spreadOf(location.hash);
		const pos = nav.positionOf(location.hash);
		if (target === undefined || pos === undefined) return;
		book = { spread: target };
		single = pos;
	}

	onMount(() => {
		plain = document.documentElement.dataset.view === 'plain';
		openFromHash();
		const onHash = () => go(location.hash.slice(1), false);
		window.addEventListener('hashchange', onHash);
		return () => window.removeEventListener('hashchange', onHash);
	});
</script>

<svelte:window onkeydown={onKey} />

<p class="sr-only" aria-live="polite">{announce}</p>

<div class="view-toggle">
	{#if plain}
		<button type="button" onclick={() => setPlain(false)}>Back to the notebook</button>
	{:else}
		<button type="button" onclick={() => setPlain(true)}>Plain reading view</button>
	{/if}
</div>

<!-- Desktop: the open spread -->
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div
	class="book"
	class:turning={!!turning}
	data-dir={turning?.dir}
	data-hover={hover}
	bind:this={bookEl}
	onclick={onClick}
>
	<div class="led-halo" aria-hidden="true"></div>
	<div class="book-shadow" aria-hidden="true"></div>
	<div class="cover" aria-hidden="true"></div>
	<div class="ribbon" aria-hidden="true"></div>
	<div class="block left" aria-hidden="true"></div>
	<div class="block right" aria-hidden="true"></div>

	<div class="spread" role="region" aria-roledescription="notebook" aria-label="Jamal's notebook">
		<div class="side left">
			{#key leftPage}<Page index={leftPage} side="left" live={!turning} />{/key}
			<div class="cast cast-l" aria-hidden="true"></div>
		</div>
		<div class="side right">
			{#key rightPage}<Page index={rightPage} side="right" live={!turning} />{/key}
			<div class="cast cast-r" aria-hidden="true"></div>
		</div>
		<div class="spine" aria-hidden="true"></div>
		{#if turning}
			<Leaf front={turning.front} back={turning.back} dir={turning.dir} />
		{/if}
	</div>

	<div class="light lamp-pool" aria-hidden="true"></div>

	{#if !turning}
		<div class="corner-hint left" aria-hidden="true"><Fingers side="left" /></div>
		<div class="corner-hint right" aria-hidden="true"><Fingers side="right" /></div>
	{/if}

	<button
		type="button"
		class="edge prev"
		aria-label="Previous page"
		disabled={spread === 0 && !turning}
		onclick={() => turnTo(nav.aim(book) - 1)}
		onpointerenter={() => (hover = 'left')}
		onpointerleave={() => (hover = undefined)}
	></button>
	<button
		type="button"
		class="edge next"
		aria-label="Next page"
		disabled={spread === nav.lastSpread && !turning}
		onclick={() => turnTo(nav.aim(book) + 1)}
		onpointerenter={() => (hover = 'right')}
		onpointerleave={() => (hover = undefined)}
	></button>

	<nav class="book-controls" aria-label="Page controls">
		<button type="button" onclick={() => turnTo(spread - 1, true)} disabled={spread === 0}>← Previous</button>
		<span class="pager" aria-hidden="true">{nav.pager(spread)}</span>
		<button type="button" onclick={() => turnTo(nav.contentsSpread, true)} disabled={spread === nav.contentsSpread}>
			Contents
		</button>
		<button type="button" onclick={() => turnTo(spread + 1, true)} disabled={spread === nav.lastSpread}>Next →</button>
	</nav>
</div>

<!-- Phones: one page at a time -->
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div
	class="single"
	bind:this={singleEl}
	onclick={onClick}
	onpointerdown={onPointerDown}
	onpointerup={onPointerUp}
	onpointercancel={() => (swipe = undefined)}
>
	{#key singlePage}
		<div class="single-sheet {slide}">
			<Page index={singlePage} side="right" live />
		</div>
	{/key}
	<nav class="single-controls" aria-label="Page controls">
		<button type="button" onclick={() => showSingle(single - 1, true)} disabled={single === 0}>
			<span aria-hidden="true">←</span> Prev
		</button>
		<button
			type="button"
			onclick={() => showSingle(nav.contentsPosition, true)}
			disabled={single === nav.contentsPosition}
		>
			Contents
		</button>
		<button type="button" onclick={() => showSingle(single + 1, true)} disabled={single === nav.lastPosition}>
			Next <span aria-hidden="true">→</span>
		</button>
	</nav>
	<p class="swipe-hint" aria-hidden="true">swipe to turn · {single + 1} / {nav.order.length}</p>
</div>

<!-- Plain reading view (also the no-JavaScript fallback) -->
<div class="plain">
	{#each nav.order as index (index)}
		<section id={pages[index].id} class="plain-section" aria-label={pages[index].title}>
			<Page {index} side="right" />
		</section>
	{/each}
</div>
