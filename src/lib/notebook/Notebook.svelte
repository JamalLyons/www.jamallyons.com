<script lang="ts">
	// The open notebook: a two-page spread on desktop, one page at a time on phones, and a
	// plain reading view. Navigation state is one number per mode; the hash mirrors it.
	import { goto } from '$app/navigation';
	import { onMount, tick } from 'svelte';
	import Fingers from './Fingers.svelte';
	import Leaf from './Leaf.svelte';
	import Page from './Page.svelte';
	import { mobileOrder, pages } from './pages.js';
	import { frame, frameStyle, phases } from './turn.js';

	const lastSpread = Math.ceil(pages.length / 2) - 1;

	let spread = $state(0);
	let single = $state(0); // position in mobileOrder
	let plain = $state(false);
	let turning = $state<{ dir: 1 | -1; to: number; front: number; back: number; left: number; right: number }>();
	let queued: number | undefined;
	let announce = $state('');

	let bookEl = $state<HTMLElement>();
	let singleEl = $state<HTMLElement>();
	let hover = $state<'left' | 'right'>();

	const leftPage = $derived(turning ? turning.left : spread * 2);
	const rightPage = $derived(turning ? turning.right : spread * 2 + 1);
	const singlePage = $derived(mobileOrder[single]);

	const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
	const isSingle = () => matchMedia('(max-width: 899px), (max-height: 559px)').matches;

	// ---- desktop spread --------------------------------------------------------------

	/** Where the book is headed: relative moves made mid-turn count from here. */
	const aim = () => queued ?? turning?.to ?? spread;

	function turnTo(target: number, focus = false) {
		target = Math.max(0, Math.min(lastSpread, target));
		if (turning) {
			queued = target;
			return;
		}
		if (target === spread) return;
		const dir = target > spread ? 1 : -1;
		if (reduceMotion()) {
			spread = target;
			settle(focus);
			return;
		}
		turning =
			dir === 1
				? { dir, to: target, front: spread * 2 + 1, back: target * 2, left: spread * 2, right: target * 2 + 1 }
				: { dir, to: target, front: target * 2 + 1, back: spread * 2, left: target * 2, right: spread * 2 + 1 };
		animate(dir).then(() => {
			spread = target;
			turning = undefined;
			settle(focus);
			if (queued !== undefined) {
				const next = queued;
				queued = undefined;
				turnTo(next, focus);
			}
		});
	}

	function animate(dir: 1 | -1): Promise<void> {
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
		const l = pages[spread * 2];
		const r = pages[spread * 2 + 1];
		announce = `Pages ${spread * 2 + 1} and ${spread * 2 + 2}: ${l.title}, ${r.title}`;
		syncHash(spread === 0 ? '' : l.id);
		if (focus) {
			await tick();
			bookEl?.querySelector<HTMLElement>('.paper.left')?.focus({ preventScroll: true });
		}
	}

	// ---- phone, one page at a time ---------------------------------------------------

	let slide = $state<'from-right' | 'from-left' | ''>('');

	async function showSingle(pos: number, focus = false) {
		pos = Math.max(0, Math.min(mobileOrder.length - 1, pos));
		if (pos === single) return;
		slide = reduceMotion() ? '' : pos > single ? 'from-right' : 'from-left';
		single = pos;
		const p = pages[mobileOrder[pos]];
		announce = `Page ${mobileOrder[pos] + 1}: ${p.title}`;
		syncHash(pos === 0 ? '' : p.id);
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
		const index = pages.findIndex((p) => p.id === id);
		if (index < 0) return false;
		if (plain) return false;
		if (isSingle()) showSingle(mobileOrder.indexOf(index), focus);
		else turnTo(Math.floor(index / 2), focus);
		return true;
	}

	function syncHash(id: string) {
		const hash = id ? `#${id}` : '';
		if (location.hash === hash) return;
		goto(hash || location.pathname + location.search, { replace: true, shallow: true, state: {} });
	}

	function onClick(e: MouseEvent) {
		const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
		if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
		if (go(a.hash.slice(1))) e.preventDefault();
	}

	function onKey(e: KeyboardEvent) {
		if (plain || e.altKey || e.metaKey || e.ctrlKey) return;
		const t = e.target as HTMLElement;
		if (t.closest('input, textarea, select, [contenteditable]')) return;
		const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
		if (!delta) return;
		e.preventDefault();
		if (isSingle()) showSingle(single + delta);
		else turnTo(aim() + delta);
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
		const id = location.hash.slice(1);
		const index = pages.findIndex((p) => p.id === id);
		if (index < 0) return;
		spread = Math.floor(index / 2);
		single = mobileOrder.indexOf(index);
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
		onclick={() => turnTo(aim() - 1)}
		onpointerenter={() => (hover = 'left')}
		onpointerleave={() => (hover = undefined)}
	></button>
	<button
		type="button"
		class="edge next"
		aria-label="Next page"
		disabled={spread === lastSpread && !turning}
		onclick={() => turnTo(aim() + 1)}
		onpointerenter={() => (hover = 'right')}
		onpointerleave={() => (hover = undefined)}
	></button>

	<nav class="book-controls" aria-label="Page controls">
		<button type="button" onclick={() => turnTo(spread - 1, true)} disabled={spread === 0}>← Previous</button>
		<span class="pager" aria-hidden="true">{spread * 2 + 1}–{spread * 2 + 2} of {pages.length}</span>
		<button type="button" onclick={() => turnTo(0, true)} disabled={spread === 0}>Contents</button>
		<button type="button" onclick={() => turnTo(spread + 1, true)} disabled={spread === lastSpread}>Next →</button>
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
		<button type="button" onclick={() => showSingle(1, true)} disabled={singlePage === 0}>Contents</button>
		<button type="button" onclick={() => showSingle(single + 1, true)} disabled={single === mobileOrder.length - 1}>
			Next <span aria-hidden="true">→</span>
		</button>
	</nav>
	<p class="swipe-hint" aria-hidden="true">swipe to turn · {single + 1} / {mobileOrder.length}</p>
</div>

<!-- Plain reading view (also the no-JavaScript fallback) -->
<div class="plain">
	{#each mobileOrder as index (index)}
		<section id={pages[index].id} class="plain-section" aria-label={pages[index].title}>
			<Page {index} side="right" />
		</section>
	{/each}
</div>
