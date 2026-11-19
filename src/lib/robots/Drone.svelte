<!--
	Drone: a round little copter, a tin dome with a porthole eye, one propeller on a mast and
	a two-finger claw on a telescoping arm. Drawn facing right, origin at the body centre.
	`tip` is how far the claw hangs below the body (26 travelling, 38 lowered, 12 parked);
	`open` spreads its fingers. The propeller is a blurred disc while it spins; parked, the
	blades show.
-->
<script lang="ts">
	import type { BotView } from './behaviour.js';

	let { v, part = 'body' }: { v: BotView; part?: 'body' | 'glow' } = $props();

	const sleeping = $derived(v.pose === 'sleep');
	const grip = $derived(10 + 22 * v.open);
	const iris = $derived({ x: v.look.y === 1 ? -1 : 1 + v.look.x * 1.2, y: v.look.y === 1 ? 0.6 : 0 });
</script>

{#if part === 'glow'}
	<g transform="scale({v.face * v.sx} {v.sy}) rotate({v.rot})">
		{#if !sleeping && !v.blink}<circle cx={6 + iris.x} cy={-2 + iris.y} r="8" fill="url(#rb-glow-amber)" />{/if}
		<circle cx="-13" cy="-9" r="3.2" fill="url(#rb-glow-red)" opacity={sleeping ? 0.5 : 1} />
	</g>
{:else}
	<g transform="scale({v.face * v.sx} {v.sy}) rotate({v.rot})">
		<!-- ============ claw arm: a telescoping rod, a knuckle, two fingers -->
		<path d="M0 8 V{v.tip - 2}" stroke="#6f6a61" stroke-width="3.2" stroke-linecap="round" />
		<path d="M-0.8 9 V{v.tip - 3}" stroke="#d0c9b9" stroke-width="1" stroke-linecap="round" />
		<rect x="-2.6" y="8" width="5.2" height="5" fill="#8b8579" stroke="#3b2a20" stroke-width="0.8" />
		<g transform="translate(0 {v.tip})">
			<circle r="3" fill="#dca54b" stroke="#3b2a20" stroke-width="0.9" />
			{#each [-1, 1] as side (side)}
				<g transform="rotate({side * grip})">
					<path d="M{side * 1.5} 1.5 q{side * 5} 4 {side * 3} 9 q{-side * 1} 2 {-side * 3} 2.5" fill="none" stroke="#4b4741" stroke-width="2.4" stroke-linecap="round" />
					<path d="M{side * 1.5} 1.5 q{side * 5} 4 {side * 3} 9" fill="none" stroke="#9c958a" stroke-width="0.8" stroke-linecap="round" />
				</g>
			{/each}
		</g>

		<!-- ============ body -->
		<!-- landing skids -->
		<path d="M-11 9 l-4 6 M9 9 l4 6 M-18 15 h10 M10 15 h10" stroke="#4b4741" stroke-width="1.8" stroke-linecap="round" fill="none" />
		<!-- shell: cream dome over a red belly -->
		<path d="M-17 2 a17 15 0 0 1 34 0 v2 q0 7 -17 7 q-17 0 -17 -7z" fill="url(#rb-cream)" />
		<path d="M-17 2 h34 v2 q0 7 -17 7 q-17 0 -17 -7z" fill="#c4463a" />
		<path d="M-15 5 q15 5 30 0" stroke="#e07a68" stroke-width="1.4" fill="none" stroke-linecap="round" />
		<path d="M8 -11 a17 15 0 0 1 9 13 v2 q0 7 -12 7 l1 -10 q4 -6 2 -12z" fill="#8a7a5a" opacity="0.35" />
		<path d="M8 -11 a17 15 0 0 1 9 13 v2 q0 7 -12 7 l1 -10 q4 -6 2 -12z" fill="url(#rb-hatch)" opacity="0.5" />
		<path d="M-12 -6 a14 12 0 0 1 9 -6" stroke="#fffaf0" stroke-width="2.6" fill="none" stroke-linecap="round" />
		<!-- the porthole eye -->
		<circle cx="6" cy="-2" r="7" fill="#7a6a4c" />
		<circle cx="6" cy="-2" r="5.4" fill="url(#rb-lens)" />
		{#if sleeping || v.blink}
			<path d={sleeping ? 'M1.5 -1 q4.5 3 9 0' : 'M1.5 -2 h9'} stroke="#26231f" stroke-width="1.4" fill="none" stroke-linecap="round" />
		{:else}
			<circle cx={6 + iris.x} cy={-2 + iris.y} r="2.4" fill="#f2b648" />
			<circle cx={6 + iris.x} cy={-2 + iris.y} r="1.1" fill="#2a1a0c" />
			<circle cx="4" cy="-4.4" r="1.2" fill="#fff" opacity="0.9" />
		{/if}
		<circle cx="6" cy="-2" r="7" class="ink thin" />
		<!-- status light and rivets -->
		<circle cx="-13" cy="-9" r="1.9" fill="#c4463a" stroke="#3b2a20" stroke-width="0.7" />
		<circle cx="-9" cy="6.5" r="0.9" fill="#7d2a22" /><circle cx="0" cy="8" r="0.9" fill="#7d2a22" /><circle cx="9" cy="6.5" r="0.9" fill="#7d2a22" />
		<path d="M-17 2 a17 15 0 0 1 34 0 v2 q0 7 -17 7 q-17 0 -17 -7z" class="ink" />
		<path d="M-17 2 h34" class="ink hair" />
		<path d="M14 -7 a17 15 0 0 1 3 9 v2 q0 7 -10 7" class="ink heavy" />

		<!-- ============ mast and propeller -->
		<path d="M0 -13 V-21" stroke="#5e584f" stroke-width="2.6" />
		<rect x="-3" y="-23.5" width="6" height="3" rx="1" fill="#dca54b" stroke="#3b2a20" stroke-width="0.8" />
		{#if v.prop === 'off'}
			<g transform="translate(0 -24) scale(1 0.32)">
				<path d="M0 0 q12 -6 22 -2 q-10 6 -22 2z M0 0 q-12 6 -22 2 q10 -6 22 -2z" fill="#a39a88" stroke="#3b2a20" stroke-width="2.2" />
			</g>
		{:else}
			<g transform="translate(0 -24)" class="prop {v.prop}">
				<!-- motion blur, baked: a pale disc with streak arcs -->
				<ellipse rx="25" ry="4.2" fill="#f7f0de" opacity="0.38" />
				<ellipse rx="25" ry="4.2" fill="none" stroke="#3b2a20" stroke-width="0.8" stroke-dasharray="7 9" opacity="0.55" />
				<g class="blades">
					<path d="M-23 0.6 q11 -2.6 23 -0.6 q12 2 23 -0.6" stroke="#5e584f" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.5" />
				</g>
			</g>
		{/if}
		<circle cx="0" cy="-24" r="1.7" fill="#3b2a20" />
	</g>
{/if}

<style>
	.blades {
		animation: blade 0.12s linear infinite;
	}
	.slow .blades {
		animation-duration: 0.4s;
	}
	@keyframes blade {
		from {
			transform: scaleX(1);
		}
		50% {
			transform: scaleX(-1);
		}
		to {
			transform: scaleX(1);
		}
	}
</style>
