<!--
	Hopper: a tin capsule on one coiled spring leg, with a wind-up key in its back. Drawn
	facing right, origin at the foot. The spring runs from the foot (y 0) up to the body
	(y -18 at rest; `coil` squashes or stretches it); the capsule sits on top. Sitting on the
	book's edge, the body rests on the seat and the leg dangles over the edge, swinging.
	Squash and stretch scale about the foot, so landings flatten into the desk.
-->
<script lang="ts">
	import type { BotView } from './behaviour.js';

	let { v, part = 'body' }: { v: BotView; part?: 'body' | 'glow' } = $props();

	const sitting = $derived(v.pose === 'sit' || (v.pose === 'wave' && v.layer === 'above'));
	// spring length: squashed by `coil` (0 = rest, 1 = fully compressed, < 0 stretched)
	const len = $derived(18 * (1 - 0.55 * Math.max(0, v.coil)) * (1 - 0.3 * Math.min(0, v.coil)));
	const swing = $derived(sitting ? 26 * Math.sin(v.t / 260) : 0);
	const loops = 6;
	const coil = $derived(
		Array.from({ length: loops }, (_, i) => {
			const y = -len * ((i + 0.5) / loops);
			return { y, rx: 6.6 - i * 0.15 };
		})
	);
	const iris = $derived({ x: v.look.y === 1 ? 0 : v.look.x * 1.4, y: v.look.y === 1 ? 0.8 : v.look.y * 1.4 });
	const dizzy = $derived(v.pose === 'dizzy' || v.pose === 'tumble');
	const lean = $derived(v.pose === 'ready' ? -6 : 0);
</script>

{#if part === 'glow'}
	{#if !v.blink && !dizzy}
		<g transform="scale({v.face * v.sx} {v.sy}) rotate({v.rot} 0 {-len - 15.5}) translate(0 {-len})">
			<circle cx={2 + iris.x} cy={-19 + iris.y} r="4.4" fill="url(#rb-glow-teal)" />
			<circle cx={9 + iris.x} cy={-19 + iris.y} r="4.4" fill="url(#rb-glow-teal)" />
		</g>
	{/if}
{:else}
	<!-- tilt and spin turn the whole robot about the middle of its body -->
	<g transform="scale({v.face * v.sx} {v.sy}) rotate({lean + v.rot} 0 {-len - 15.5})">
		<!-- ============ spring leg and foot -->
		<g transform="rotate({swing} 0 {-len})">
			<g>
				<path d="M-7 0 q0 -3.5 7 -3.5 q7 0 7 3.5z" fill="#3e3a35" />
				<path d="M-7 0 q0 -3.5 7 -3.5 q7 0 7 3.5z" class="ink thin" />
				{#each coil as c, i (i)}
					<ellipse cx="0" cy={c.y - 3.5 * (1 - (i + 0.5) / loops) + 1} rx={c.rx} ry="1.9" fill="none" stroke="#8a8f94" stroke-width="2.2" />
					<path d="M{-c.rx} {c.y - 3.5 * (1 - (i + 0.5) / loops) + 1} a{c.rx} 1.9 0 0 0 {c.rx * 2} 0" fill="none" stroke="#3b2a20" stroke-width="1" />
					<path d="M{-c.rx + 1.5} {c.y - 3.5 * (1 - (i + 0.5) / loops) + 0.4} a{c.rx} 1.9 0 0 1 3 -1" fill="none" stroke="#eef2f4" stroke-width="1" />
				{/each}
			</g>
		</g>

		<!-- ============ body: everything above the spring -->
		<g transform="translate(0 {-len})">
			<!-- wind-up key in its back, turning -->
			<g transform="translate(-15 -16) scale(0.82)">
				<path d="M0 0 h-5" stroke="#8a6a2c" stroke-width="2.4" />
				<g transform="scale({Math.cos(v.key / 60)} 1)">
					<path d="M-5 0 q-3 -9 -8 -8 q-4 2 -1 8 q-3 6 1 8 q5 1 8 -8z" fill="#e2b04a" />
					<path d="M-6 -1 q-3 -5 -6 -5" stroke="#fff0b8" stroke-width="1.3" fill="none" stroke-linecap="round" />
					<circle cx="-10" cy="-3.5" r="1.4" fill="#8a6a2c" />
					<circle cx="-10" cy="3.5" r="1.4" fill="#8a6a2c" />
					<path d="M-5 0 q-3 -9 -8 -8 q-4 2 -1 8 q-3 6 1 8 q5 1 8 -8z" class="ink thin" />
				</g>
			</g>
			<!-- capsule -->
			<path d="M-15 -8 v-15 a15 9 0 0 1 30 0 v15 a15 7 0 0 1 -30 0z" fill="url(#rb-teal)" />
			<path d="M-15 -8 v-15 a15 9 0 0 1 30 0 v15 a15 7 0 0 1 -30 0z" fill="none" stroke="#2f6a64" stroke-width="3.2" opacity="0.35" />
			<path d="M6 -31 a15 9 0 0 1 9 8 v15 a15 7 0 0 1 -11 6.7z" fill="#2f6a64" opacity="0.35" />
			<path d="M6 -31 a15 9 0 0 1 9 8 v15 a15 7 0 0 1 -11 6.7z" fill="url(#rb-hatch)" opacity="0.5" />
			<!-- a cream belly band with rivets -->
			<path d="M-15 -11 h30 v5 a15 6 0 0 1 -30 0z" fill="#efe3c6" />
			<path d="M-15 -11 h30" stroke="#3b2a20" stroke-width="0.8" />
			{#each [-10, -3, 4, 11] as x (x)}
				<circle cx={x} cy={-6.5 + Math.abs(x) * 0.06} r="0.9" fill="#8a7f6a" />
			{/each}
			<path d="M-11 -27 q2 -5 8 -6" stroke="#e7fbf6" stroke-width="2.4" fill="none" stroke-linecap="round" />
			<path d="M-12 -24 v12" stroke="#bfeee5" stroke-width="2" stroke-linecap="round" opacity="0.8" />
			<!-- face plate -->
			<path d="M-2 -26 h11 q4 0 4.5 4 v6 q-0.5 4 -4.5 4 h-11 q-3 0 -3 -3 v-8 q0 -3 3 -3z" fill="#f6efdc" />
			<path d="M-2 -26 h11 q4 0 4.5 4 v6 q-0.5 4 -4.5 4 h-11 q-3 0 -3 -3 v-8 q0 -3 3 -3z" class="ink hair" />
			{#if v.blink}
				<path d="M0 -19 h4 M7 -19 h4" stroke="#1f2a2c" stroke-width="1.5" stroke-linecap="round" />
			{:else if dizzy}
				<path d="M2 -19 m-2 0 a2 2 0 1 1 2 2 a1 1 0 1 1 -1 -1 M9 -19 m-2 0 a2 2 0 1 1 2 2 a1 1 0 1 1 -1 -1" stroke="#1f2a2c" stroke-width="1.1" fill="none" />
			{:else}
				<circle cx={2 + iris.x} cy={-19 + iris.y} r="2" fill="#1f2a2c" />
				<circle cx={9 + iris.x} cy={-19 + iris.y} r="2" fill="#1f2a2c" />
				<circle cx={1.4 + iris.x} cy={-19.8 + iris.y} r="0.7" fill="#fff" />
				<circle cx={8.4 + iris.x} cy={-19.8 + iris.y} r="0.7" fill="#fff" />
			{/if}
			<!-- cheek blush, a little mouth grille -->
			<ellipse cx="11.5" cy="-15" rx="1.6" ry="0.9" fill="#e98a7a" opacity="0.7" /><ellipse cx="-1" cy="-15" rx="1.4" ry="0.9" fill="#e98a7a" opacity="0.6" />
			{#if v.pose === 'wave' || v.mark}
				<path d="M4 -15 q1.5 2 3 0" stroke="#1f2a2c" stroke-width="1" fill="none" stroke-linecap="round" />
			{/if}
			<!-- cap with a pip on top -->
			<path d="M-3 -31 q3 -4 6 0" fill="#c4463a" />
			<circle cx="0" cy="-33" r="1.8" fill="#c4463a" stroke="#3b2a20" stroke-width="0.8" />
			<path d="M-15 -8 v-15 a15 9 0 0 1 30 0 v15 a15 7 0 0 1 -30 0z" class="ink" />
			<path d="M15 -23 v15 a15 7 0 0 1 -9 6.5" class="ink heavy" />
			<!-- arm stub: waves when happy -->
			{#if v.pose === 'wave'}
				<g style="transform: translate(-2px, -14px) rotate({-130 + 25 * Math.sin(v.t / 90)}deg)">
					<path d="M0 0 v9" stroke="#2f6a64" stroke-width="3" stroke-linecap="round" />
					<circle cx="0" cy="10" r="2.2" fill="#efe3c6" stroke="#3b2a20" stroke-width="0.9" />
				</g>
			{:else}
				<path d="M-6 -13 q-2 5 1 8" stroke="#2f6a64" stroke-width="3" fill="none" stroke-linecap="round" />
				<circle cx="-4.7" cy="-4.5" r="2" fill="#efe3c6" stroke="#3b2a20" stroke-width="0.9" />
			{/if}
		</g>
	</g>
{/if}
