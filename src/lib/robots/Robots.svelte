<!--
	The desk robots. A fixed, screen-space overlay (the room SVG is cropped with
	`xMidYMid slice`, so robots can't live in its viewBox): behaviour.js decides where each
	one is, this component measures the page, runs one requestAnimationFrame loop and draws.

	Layers, back to front:
	  .robots.desk   on the desk, under the night dim, so they darken with the room
	  .robots.glow   eye LEDs and the headlamp, above the dim so they glow at night
	  .robots.above  Hopper while it's up on the book, and the speech marks

	Only the robots themselves take pointer events (a poke makes them react); everything is
	aria-hidden, so keyboard and screen-reader users are unaffected.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { SINGLE_PAGE_QUERY } from '../notebook/breakpoint.js';
	import { createDesk, rectOf, type BotView, type DeskEvent } from './behaviour.js';
	import Drone from './Drone.svelte';
	import Hopper from './Hopper.svelte';
	import Treadbot from './Treadbot.svelte';
	import { zonesFor, type Layout, type Rect } from './zones.js';

	type Name = 'tread' | 'hopper' | 'drone';
	type View = ReturnType<ReturnType<typeof createDesk>['view']>;

	let view = $state.raw<View | null>(null);
	let vw = $state(0);
	let vh = $state(0);
	let night = $state(false);
	/** Robots appear on their first frame, with a fade. */
	let shown = $state(false);
	// Speech marks are hand-lettered: hold them back until Caveat has loaded, never show the fallback.
	let lettered = $state(false);

	const comps = { tread: Treadbot, hopper: Hopper, drone: Drone };
	const names: Name[] = ['drone', 'hopper', 'tread'];

	/** Transform for a robot: position, then scale. Squash, facing and tilt are inside each robot. */
	const at = (v: BotView) => `translate(${v.x.toFixed(2)} ${v.y.toFixed(2)}) scale(${v.s})`;

	onMount(() => {
		const html = document.documentElement;
		const single = matchMedia(SINGLE_PAGE_QUERY);
		const reduce = matchMedia('(prefers-reduced-motion: reduce)');
		const seed = Math.floor(Math.random() * 2 ** 31);
		let desk: ReturnType<typeof createDesk> | null = null;
		let events: DeskEvent[] = [];
		let raf = 0;
		let last = 0;
		let dirty = true;

		const rect = (el: Element | null): Rect | null => {
			if (!el) return null;
			const r = el.getBoundingClientRect();
			return r.width || r.height ? { x: r.left, y: r.top, w: r.width, h: r.height } : null;
		};
		/** Union of an element's laid-out children: the text actually on the page. */
		const inkOf = (el: Element) => {
			let x0 = Infinity;
			let y0 = Infinity;
			let x1 = -Infinity;
			let y1 = -Infinity;
			for (const c of el.children) {
				const r = c.getBoundingClientRect();
				if (!r.height) continue;
				x0 = Math.min(x0, r.left);
				y0 = Math.min(y0, r.top);
				x1 = Math.max(x1, r.right);
				y1 = Math.max(y1, r.bottom);
			}
			return x1 > x0 ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : null;
		};

		/** Robots only live round the open book: not on phones or in the plain reading view. */
		const active = () => !single.matches && html.dataset.view !== 'plain' && !!document.querySelector('.book .cover');

		function measure(): Layout | null {
			const cover = rect(document.querySelector('.book .cover'));
			if (!cover) return null;
			const text: Rect[] = [];
			for (const p of document.querySelectorAll('.book .side .paper')) {
				const inner = p.querySelector('.paper-inner');
				const ink = inner && inkOf(inner);
				if (ink) text.push(ink);
				const folio = rect(p.querySelector('.folio'));
				if (folio) text.push(folio);
			}
			const buttons = [...document.querySelectorAll('.book-controls > *')].map(rect).filter((r): r is Rect => !!r);
			const controls = buttons.length
				? buttons.reduce((a, b) => {
						const x = Math.min(a.x, b.x);
						const y = Math.min(a.y, b.y);
						return { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y };
					})
				: null;
			const avoid = [rect(document.querySelector('.clock-tag')), rect(document.querySelector('.view-toggle')), controls].filter(
				(r): r is Rect => !!r
			);
			return { vw: innerWidth, vh: innerHeight, cover, text, controls, avoid };
		}

		function sync() {
			dirty = false;
			vw = innerWidth;
			vh = innerHeight;
			if (!active()) {
				desk = null;
				view = null;
				return;
			}
			const L = measure();
			if (!L) return;
			const zones = zonesFor(L);
			if (!desk) {
				desk = createDesk({ seed, zones, reduced: reduce.matches, night });
				// dev only: lets the console (and visual checks) drive the robots
				if (import.meta.env.DEV) Object.assign(window, { __desk: desk, __robotsDraw: () => desk && (view = desk.view()) });
			} else desk.setZones(zones);
			view = desk.view();
			shown = true;
		}

		function frame(now: number) {
			raf = 0;
			if (document.hidden) return;
			if (dirty) sync();
			if (!desk) return;
			const dt = last ? now - last : 16;
			last = now;
			desk.step(dt, events);
			events = [];
			view = desk.view();
			if (!reduce.matches) loop();
			else if (view) setTimeout(loop, 500); // only a slow blink to animate
		}
		const loop = () => {
			if (!raf) raf = requestAnimationFrame(frame);
		};

		const invalidate = () => {
			dirty = true;
			loop();
		};
		const onVisible = () => {
			last = 0;
			loop();
		};
		const onTurn = () => {
			events.push({ type: 'turn' });
			loop();
		};
		const onReduce = () => {
			desk = null;
			invalidate();
		};
		// the lighting flips html[data-light]; the plain view toggle flips html[data-view]
		const watch = new MutationObserver(() => {
			const n = html.dataset.light === 'night';
			if (n !== night) {
				night = n;
				desk?.setNight(n);
			}
			invalidate();
		});
		watch.observe(html, { attributes: true, attributeFilter: ['data-light', 'data-view'] });
		night = html.dataset.light === 'night';

		const ro = new ResizeObserver(invalidate);
		const book = document.querySelector('.book');
		if (book) ro.observe(book);
		addEventListener('resize', invalidate);
		addEventListener('notebook:turn', onTurn);
		addEventListener('notebook:settle', invalidate);
		document.addEventListener('visibilitychange', onVisible);
		single.addEventListener('change', invalidate);
		reduce.addEventListener('change', onReduce);
		// fonts change the measured text blocks
		document.fonts?.ready.then(invalidate);
		if (document.fonts) document.fonts.load('700 24px Caveat').then(() => (lettered = true), () => {});
		else lettered = true;
		loop();

		poke = (name: Name) => {
			events.push({ type: 'poke', bot: name });
			loop();
		};

		return () => {
			cancelAnimationFrame(raf);
			watch.disconnect();
			ro.disconnect();
			removeEventListener('resize', invalidate);
			removeEventListener('notebook:turn', onTurn);
			removeEventListener('notebook:settle', invalidate);
			document.removeEventListener('visibilitychange', onVisible);
			single.removeEventListener('change', invalidate);
			reduce.removeEventListener('change', onReduce);
		};
	});

	let poke = (_: Name) => {};

	/** Hit area for a robot, in its own (unscaled) units around the origin. */
	function hit(name: Name, v: BotView) {
		const r = rectOf(name, v);
		return { x: r.x - 4, y: r.y - 4, w: r.w + 8, h: r.h + 8 };
	}
</script>

{#if view}
	{@const v = view}
	<svg class="robots desk" class:shown aria-hidden="true" width={vw} height={vh} viewBox="0 0 {vw} {vh}">
		<defs>
			<pattern id="rb-hatch" width="3.4" height="3.4" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
				<path d="M0 0 V3.4" stroke="#3b2a20" stroke-width="0.8" />
			</pattern>
			<radialGradient id="rb-enamel" cx="0.35" cy="0.3" r="0.8">
				<stop offset="0" stop-color="#fbf5e4" />
				<stop offset="0.6" stop-color="#ece0c2" />
				<stop offset="1" stop-color="#cbb98f" />
			</radialGradient>
			<radialGradient id="rb-cream" cx="0.35" cy="0.25" r="0.85">
				<stop offset="0" stop-color="#fdf8ea" />
				<stop offset="0.55" stop-color="#efe3c4" />
				<stop offset="1" stop-color="#c9b48a" />
			</radialGradient>
			<linearGradient id="rb-teal" x1="0" y1="0" x2="1" y2="0">
				<stop offset="0" stop-color="#7cc2b4" />
				<stop offset="0.35" stop-color="#5aa898" />
				<stop offset="1" stop-color="#3a7f73" />
			</linearGradient>
			<radialGradient id="rb-lens" cx="0.38" cy="0.35" r="0.75">
				<stop offset="0" stop-color="#4b6f74" />
				<stop offset="0.7" stop-color="#1c3437" />
				<stop offset="1" stop-color="#0d1a1c" />
			</radialGradient>
			<radialGradient id="rb-marble" cx="0.35" cy="0.3" r="0.8">
				<stop offset="0" stop-color="#e9f4ff" />
				<stop offset="0.35" stop-color="#7fb2df" />
				<stop offset="1" stop-color="#2d5687" />
			</radialGradient>
		</defs>

		<!-- contact shadows: hatched ink over a soft wash, sliding and shrinking with height -->
		{#each names as name (name)}
			{@const b = v[name]}
			{#if b}
				{@const w = (name === 'tread' ? 36 : name === 'hopper' ? 15 : 17) * b.s * (0.55 + 0.45 * b.shadow)}
				<g class="shadow" transform="translate({b.x.toFixed(1)} {(b.ground + 1).toFixed(1)})" opacity={b.shadow}>
					<ellipse rx={w} ry={w * 0.2} fill="#2a1608" opacity="0.38" />
					<ellipse rx={w * 0.78} ry={w * 0.13} fill="url(#hatch)" opacity="0.55" />
				</g>
			{/if}
		{/each}

		<!-- the note the drone ferries about -->
		{#if v.item && v.drone}
			{@const s = v.drone.s}
			<g transform="translate({v.item.x.toFixed(1)} {v.item.y.toFixed(1)}) scale({s}) rotate({v.item.rot.toFixed(1)})">
				{#if !v.item.held}<path d="M-9 17 h20 l-1 3 h-18z" fill="#2a1608" opacity="0.3" />{/if}
				<path d="M-10 0 h20 v18 h-20z" fill="#f4d66e" />
				<path d="M-10 0 h20 v4 h-20z" fill="#e2bd4c" opacity="0.7" />
				<path d="M10 14 l-4 4 v-4z" fill="#d9b24a" />
				<path d="M-6 8 h12 M-6 12 h8" stroke="#34405a" stroke-width="1" stroke-linecap="round" opacity="0.75" />
				<path d="M-10 0 h20 v14 l-4 4 h-16z" class="ink thin" />
			</g>
		{/if}

		<!-- the marble -->
		{#if v.marble}
			{@const m = v.marble}
			<g transform="translate({m.x.toFixed(2)} {m.y.toFixed(2)})">
				<ellipse cx={m.r * 0.35} cy={m.r * 0.92} rx={m.r * 1.2} ry={m.r * 0.3} fill="#2a1608" opacity="0.35" />
				<circle r={m.r} fill="url(#rb-marble)" />
				<!-- a twist of colour inside, rolling with it -->
				<path transform="rotate({m.angle.toFixed(1)})" d="M{-m.r * 0.7} 0 q{m.r * 0.35} {-m.r * 0.7} {m.r * 0.7} 0 t{m.r * 0.7} 0" stroke="#e46a52" stroke-width={m.r * 0.32} fill="none" stroke-linecap="round" opacity="0.85" />
				<circle cx={-m.r * 0.35} cy={-m.r * 0.38} r={m.r * 0.26} fill="#fff" opacity="0.9" />
				<circle r={m.r} class="ink thin" />
			</g>
		{/if}

		{#each names as name (name)}
			{@const b = v[name]}
			{#if b && !(name === 'hopper' && b.layer === 'above')}
				{@const C = comps[name]}
				<g class="bot {name}" transform={at(b)}>
					<C v={b} />
				</g>
			{/if}
		{/each}
	</svg>

	<!-- LEDs and the headlamp at night, above the room's night dim -->
	<svg class="robots glow" class:shown aria-hidden="true" width={vw} height={vh} viewBox="0 0 {vw} {vh}">
		<defs>
			<radialGradient id="rb-glow-teal">
				<stop offset="0" stop-color="#d8fff7" />
				<stop offset="0.35" stop-color="#7fe6d6" stop-opacity="0.7" />
				<stop offset="1" stop-color="#4fd1c0" stop-opacity="0" />
			</radialGradient>
			<radialGradient id="rb-glow-amber">
				<stop offset="0" stop-color="#fff2c8" />
				<stop offset="0.35" stop-color="#ffc35a" stop-opacity="0.7" />
				<stop offset="1" stop-color="#ff9f2e" stop-opacity="0" />
			</radialGradient>
			<radialGradient id="rb-glow-red">
				<stop offset="0" stop-color="#ffd8cc" />
				<stop offset="0.4" stop-color="#ff6a52" stop-opacity="0.7" />
				<stop offset="1" stop-color="#ff4a32" stop-opacity="0" />
			</radialGradient>
			<radialGradient id="rb-glow">
				<stop offset="0" stop-color="#fffbe6" />
				<stop offset="0.4" stop-color="#ffe08a" stop-opacity="0.75" />
				<stop offset="1" stop-color="#ffcf60" stop-opacity="0" />
			</radialGradient>
			<linearGradient id="rb-beam" x1="0" y1="0" x2="1" y2="0.5">
				<stop offset="0" stop-color="#fff0b8" stop-opacity="0.75" />
				<stop offset="1" stop-color="#ffe08a" stop-opacity="0" />
			</linearGradient>
		</defs>
		{#each names as name (name)}
			{@const b = v[name]}
			{#if b && !(name === 'hopper' && b.layer === 'above')}
				{@const C = comps[name]}
				<g transform={at(b)}><C v={b} part="glow" /></g>
			{/if}
		{/each}
	</svg>

	<svg class="robots above" class:shown aria-hidden="true" width={vw} height={vh} viewBox="0 0 {vw} {vh}">
		{#if v.hopper && v.hopper.layer === 'above'}
			{@const b = v.hopper}
			<!-- its shadow on the page block while it's up there -->
			<ellipse cx={b.x} cy={b.ground + 1} rx={13 * b.s * (0.5 + 0.5 * b.shadow)} ry={2.6 * b.s} fill="#3a2414" opacity={0.3 * b.shadow} />
			<g class="bot hopper" transform={at(b)}>
				<Hopper v={b} />
			</g>
			<g class="night-only" transform={at(b)}><Hopper v={b} part="glow" /></g>
		{/if}
		<!-- speech marks, hand-lettered -->
		{#each names as name (name)}
			{@const b = v[name]}
			{#if lettered && b?.mark}
				{@const top = rectOf(name, b).y}
				{#key b.mark.id}
					<g transform="translate({(b.x + 14 * b.s).toFixed(1)} {(top - 2).toFixed(1)}) rotate(-6)">
						<text class="mark" style="font-size: {Math.round(24 * b.s)}px">{b.mark.text}</text>
					</g>
				{/key}
			{/if}
			{#if lettered && b?.pose === 'sleep'}
				<g class="zzz" transform="translate({(b.x + 22 * b.s).toFixed(1)} {(b.y - 14 * b.s).toFixed(1)}) scale({b.s})">
					<text x="0" y="0">z</text>
					<text x="8" y="-12" style="font-size: 17px">z</text>
					<text x="18" y="-26" style="font-size: 22px">Z</text>
				</g>
			{/if}
		{/each}
	</svg>

	<!-- hit areas: only the robots take the pointer -->
	<div class="robot-hits" aria-hidden="true">
		{#each names as name (name)}
			{@const b = v[name]}
			{#if b}
				{@const r = hit(name, b)}
				<button
					type="button"
					tabindex="-1"
					aria-label="Poke the {name === 'tread' ? 'tread robot' : name === 'hopper' ? 'hopping robot' : 'drone'}"
					class="robot-hit"
					style="transform: translate({r.x.toFixed(1)}px, {r.y.toFixed(1)}px); width: {r.w.toFixed(1)}px; height: {r.h.toFixed(1)}px"
					onpointerdown={(e) => {
						e.preventDefault();
						poke(name);
					}}
				></button>
			{/if}
		{/each}
	</div>
{/if}

<style>
	.robots {
		position: fixed;
		inset: 0;
		pointer-events: none;
		overflow: visible;
		opacity: 0;
		transition: opacity 0.8s ease-out;
	}
	.robots.shown {
		opacity: 1;
	}
	/* on the desk: under the night dim (z -2), over the room (z -3) */
	.desk {
		z-index: -2;
	}
	.robots.glow {
		z-index: -1;
		mix-blend-mode: screen;
		opacity: 0;
		transition: opacity 1.4s ease-in-out;
	}
	:global(html[data-light='night']) .robots.glow.shown {
		opacity: 1;
		transition-delay: 3s;
	}
	.above {
		z-index: 12;
	}
	.night-only {
		opacity: 0;
		transition: opacity 1.4s;
	}
	:global(html[data-light='night']) .night-only {
		opacity: 1;
	}
	.robots :global(.ink) {
		fill: none;
		stroke: var(--room-ink);
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.robots :global(.ink.heavy) {
		stroke-width: 2.8;
	}
	.robots :global(.ink.thin) {
		stroke-width: 1.2;
	}
	.robots :global(.ink.hair) {
		stroke-width: 0.8;
		opacity: 0.8;
	}
	.mark,
	.zzz text {
		font-family: var(--font-hand);
		font-weight: 700;
		fill: #fdf3d8;
		stroke: var(--room-ink);
		stroke-width: 3.2px;
		paint-order: stroke;
		stroke-linejoin: round;
	}
	.zzz text {
		font-size: 13px;
		animation: zzz 3s ease-in-out infinite;
	}
	.zzz text:nth-child(2) {
		animation-delay: 0.4s;
	}
	.zzz text:nth-child(3) {
		animation-delay: 0.8s;
	}
	@keyframes zzz {
		0%,
		100% {
			opacity: 0.35;
		}
		50% {
			opacity: 1;
		}
	}
	.mark {
		transform-box: fill-box;
		transform-origin: 0% 100%;
		animation: mark-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
	}
	@keyframes mark-pop {
		from {
			opacity: 0;
			transform: translateY(6px) scale(0.4);
		}
	}
	.robot-hits {
		position: fixed;
		inset: 0;
		z-index: 13;
		pointer-events: none;
	}
	.robot-hit {
		position: absolute;
		left: 0;
		top: 0;
		padding: 0;
		border: 0;
		background: transparent;
		pointer-events: auto;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}
	.robot-hit:focus {
		outline: none;
	}
	@media (prefers-reduced-motion: reduce) {
		.robots {
			transition: none;
		}
		.mark,
		.zzz text {
			animation: none;
		}
	}
</style>
