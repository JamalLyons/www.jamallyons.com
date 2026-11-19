<script lang="ts">
	import { onMount } from 'svelte';
	import type { NetworkHandle, NetworkStats } from './network';

	/** Element whose pointer movement drives the graph (usually the hero section). */
	let { target }: { target?: HTMLElement } = $props();

	let canvas: HTMLCanvasElement;
	let ready = $state(false);
	let stats = $state<NetworkStats | null>(null);
	let latency = $state(12);

	onMount(() => {
		let handle: NetworkHandle | undefined;
		let disposed = false;
		let visible = true;
		const cleanups: (() => void)[] = [];
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		const updateRunning = () => handle?.setRunning(visible && document.visibilityState === 'visible');

		// Three.js is loaded on demand so it never blocks first paint.
		import('./network')
			.then(({ createNetwork }) => {
				if (disposed) return;
				try {
					handle = createNetwork(canvas, { still: reduced });
				} catch (error) {
					console.warn('WebGL unavailable, skipping hero network.', error);
					return;
				}
				ready = true;
				stats = handle.stats();

				const el = target ?? canvas;
				const onMove = (e: PointerEvent) => {
					if (e.pointerType === 'touch') return;
					const rect = canvas.getBoundingClientRect();
					handle?.setPointer(
						((e.clientX - rect.left) / rect.width) * 2 - 1,
						-((e.clientY - rect.top) / rect.height) * 2 + 1
					);
				};
				const onLeave = () => handle?.clearPointer();
				const onDown = (e: PointerEvent) => {
					if ((e.target as HTMLElement).closest('a, button')) return;
					onMove(e);
					handle?.burst();
				};
				el.addEventListener('pointermove', onMove);
				el.addEventListener('pointerleave', onLeave);
				el.addEventListener('pointerdown', onDown);
				cleanups.push(() => {
					el.removeEventListener('pointermove', onMove);
					el.removeEventListener('pointerleave', onLeave);
					el.removeEventListener('pointerdown', onDown);
				});

				const io = new IntersectionObserver(([entry]) => {
					visible = entry.isIntersecting;
					updateRunning();
				});
				io.observe(canvas);
				cleanups.push(() => io.disconnect());

				document.addEventListener('visibilitychange', updateRunning);
				cleanups.push(() => document.removeEventListener('visibilitychange', updateRunning));

				const tick = setInterval(() => {
					if (!handle) return;
					stats = handle.stats();
					latency = Math.round(9 + Math.random() * 7);
				}, 800);
				cleanups.push(() => clearInterval(tick));
			})
			.catch((error) => console.warn('Failed to load hero network.', error));

		return () => {
			disposed = true;
			for (const fn of cleanups) fn();
			handle?.destroy();
		};
	});
</script>

<canvas
	bind:this={canvas}
	aria-hidden="true"
	class="absolute inset-0 h-full w-full transition-opacity duration-1000 {ready ? 'opacity-100' : 'opacity-0'}"
></canvas>

{#if stats}
	<div
		class="pointer-events-none absolute right-4 bottom-4 hidden rounded-md border border-line/80 bg-surface/60 px-3 py-2 text-[11px] leading-5 text-muted backdrop-blur-sm sm:block"
		aria-hidden="true"
	>
		<div class="flex items-center gap-2 text-fg">
			<span class="relative flex size-2">
				<span class="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60"></span>
				<span class="relative inline-flex size-2 rounded-full bg-emerald-400"></span>
			</span>
			mesh: healthy
		</div>
		<div>nodes&nbsp;&nbsp;&nbsp;&nbsp;{stats.nodes} · edges {stats.edges}</div>
		<div>packets&nbsp;&nbsp;{stats.inFlight} in flight</div>
		<div>p50&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{latency}ms</div>
		<div>to you&nbsp;&nbsp;&nbsp;<span class="text-accent">{stats.delivered}</span> delivered</div>
	</div>
{/if}
