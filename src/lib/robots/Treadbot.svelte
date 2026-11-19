<!--
	Treadbot: a boxy little tracked robot with one big lens for an eye, a stubby antenna and
	a miner's lamp. Drawn facing right, origin on the desk between its treads; light comes
	from the window (top left), so the right side carries the hatching and heavier ink.
	`part="glow"` draws only what lights up at night, for the layer above the night dim.
-->
<script lang="ts">
	import type { BotView } from './behaviour.js';

	let { v, part = 'body' }: { v: BotView; part?: 'body' | 'glow' } = $props();

	// Arm angle (degrees, 0 = hanging straight down) by pose.
	const arm = $derived(
		v.pose === 'wave'
			? -150 + v.arm * 22
			: v.pose === 'tinker'
				? -168
				: v.pose === 'push' || v.pose === 'chase'
					? -72
					: v.pose === 'oops'
						? -120
						: 14
	);
	const local = $derived(v.dist / v.s);
	const wheel = $derived(((local / 6.5) * 180) / Math.PI);
	// look: x across, y 1 = at you, -1 = up
	const iris = $derived({ x: v.look.y === 1 ? -1.5 : v.look.x * 2.6, y: v.look.y === 1 ? 0.6 : v.look.y * 2.4 });
	const headTilt = $derived(v.pose === 'look' ? -9 : v.pose === 'tinker' ? 6 : v.look.y < 0 ? -6 : 0);
</script>

{#if part === 'glow'}
	<g transform="scale({v.face * v.sx} {v.sy}) rotate({v.rot})">
		<g transform="rotate({headTilt} 2 -60)">
			<!-- lamp beam onto the desk ahead, and the lens -->
			<path d="M19 -88 L118 -20 Q118 6 72 6 L15 -81z" fill="url(#rb-beam)" opacity="0.7" />
			<circle cx="18" cy="-84" r="7" fill="url(#rb-glow)" />
			<circle cx="6" cy="-72" r="11" fill="url(#rb-glow-teal)" />
			{#if !v.blink}<circle cx={6 + iris.x} cy={-72 + iris.y} r="2.6" fill="#d8fff7" />{/if}
		</g>
		<circle cx="-9" cy="-99" r="5" fill="url(#rb-glow-red)" />
	</g>
{:else}
	<g transform="scale({v.face * v.sx} {v.sy}) rotate({v.rot})">
		<!-- ============ treads -->
		<rect x="-31" y="-19" width="62" height="19" rx="9.5" fill="#3e3a35" />
		<path d="M-22 -18 H22" stroke="#7b746a" stroke-width="2" stroke-linecap="round" />
		<!-- grousers scroll as it drives -->
		<rect
			x="-29.5"
			y="-17.5"
			width="59"
			height="16"
			rx="8"
			fill="none"
			stroke="#26231f"
			stroke-width="3"
			stroke-dasharray="2.4 3.2"
			stroke-dashoffset={-local}
		/>
		{#each [-20, 0, 20] as cx (cx)}
			<g transform="rotate({wheel} {cx} -9.5)">
				<circle {cx} cy="-9.5" r="6.6" fill="#a39a88" />
				<circle {cx} cy="-9.5" r="6.6" fill="url(#rb-hatch)" opacity="0.35" />
				<path d="M{cx - 5} -9.5 H{cx + 5} M{cx} -14.5 V-4.5" stroke="#5e584f" stroke-width="1.4" />
				<circle {cx} cy="-9.5" r="2.4" fill="#d9cfb9" stroke="#3b2a20" stroke-width="0.9" />
				<circle {cx} cy="-9.5" r="6.6" class="ink hair" />
			</g>
		{/each}
		<path d="M-31 -9.5 a9.5 9.5 0 0 1 9.5 -9.5 H21.5 a9.5 9.5 0 0 1 0 19 H-21.5 a9.5 9.5 0 0 1 -9.5 -9.5z" class="ink" />
		<path d="M21.5 -19 a9.5 9.5 0 0 1 0 19 H4" class="ink heavy" />

		<!-- ============ body -->
		<!-- the bumper it pushes the marble with -->
		<path d="M25 -33 h6 q3.5 0 3.5 3.5 v8 q0 3.5 -3.5 3.5 h-6z" fill="#7a5a43" />
		<path d="M30 -31 v10" stroke="#a7866c" stroke-width="1.6" stroke-linecap="round" />
		<path d="M25 -33 h6 q3.5 0 3.5 3.5 v8 q0 3.5 -3.5 3.5 h-6z" class="ink thin" />
		<path d="M-25 -19 L-23.5 -52 Q-23 -56 -19 -56 H18 Q22 -56 22.5 -52 L25.5 -19z" fill="#dca54b" />
		<!-- pooled pigment at the rim, a lit plane, shade on the far side -->
		<path d="M-25 -19 L-23.5 -52 Q-23 -56 -19 -56 H18 Q22 -56 22.5 -52 L25.5 -19z" fill="none" stroke="#b47e2c" stroke-width="4" opacity="0.45" />
		<path d="M-20 -50 Q-6 -54 12 -51 L10 -46 Q-4 -49 -19 -45z" fill="#f4d48f" opacity="0.8" />
		<path d="M14 -55 H18 Q22 -56 22.5 -52 L25.5 -19 H16z" fill="#a8742c" opacity="0.55" />
		<path d="M14 -55 H18 Q22 -56 22.5 -52 L25.5 -19 H16z" fill="url(#rb-hatch)" opacity="0.55" />
		<path d="M-21 -48 L-22 -24" stroke="#fbe4ac" stroke-width="2.4" stroke-linecap="round" opacity="0.9" />
		<!-- control panel: a gauge, two lights, a vent -->
		<rect x="-16" y="-47" width="25" height="19" rx="2.5" fill="#efe3c6" />
		<rect x="-16" y="-47" width="25" height="19" rx="2.5" class="ink hair" />
		<circle cx="-8.5" cy="-37.5" r="5.2" fill="#fbf6e8" />
		<path d="M-12.5 -37.5 a4 4 0 0 1 8 0" fill="none" stroke="#c4463a" stroke-width="1" />
		<path d="M-8.5 -37.5 L{-8.5 + 3.6 * Math.cos(-0.6 - Math.sin(local / 30) * 0.5)} {-37.5 + 3.6 * Math.sin(-0.6 - Math.sin(local / 30) * 0.5)}" stroke="#26344f" stroke-width="1.1" stroke-linecap="round" />
		<circle cx="-8.5" cy="-37.5" r="5.2" class="ink hair" />
		<circle cx="3" cy="-42" r="2" fill="#d4594a" stroke="#3b2a20" stroke-width="0.7" />
		<circle cx="3" cy="-34.5" r="2" fill="#86ad6e" stroke="#3b2a20" stroke-width="0.7" />
		<path d="M-14 -23.5 h22 M-14 -21 h22" stroke="#7d5a2a" stroke-width="1.1" stroke-linecap="round" opacity="0.7" />
		{#each [[-20, -51], [17, -51], [-21, -24], [19, -24]] as [x, y] (x * 100 + y)}
			<circle cx={x} cy={y} r="1.1" fill="#8a6326" />
		{/each}
		<path d="M-25 -19 L-23.5 -52 Q-23 -56 -19 -56 H18 Q22 -56 22.5 -52 L25.5 -19" class="ink" />
		<path d="M22.5 -52 L25.5 -19" class="ink heavy" />

		<!-- ============ neck and head -->
		<rect x="-3.5" y="-61" width="9" height="6" fill="#8b8579" />
		<path d="M-3.5 -59 h9 M-3.5 -57 h9" stroke="#5a554c" stroke-width="0.9" />
		<rect x="-3.5" y="-61" width="9" height="6" class="ink hair" />
		<g transform="rotate({headTilt} 2 -60)">
			<!-- antenna -->
			<path d="M-5 -84 L-9 -97" stroke="#5e584f" stroke-width="2.2" stroke-linecap="round" />
			<path d="M-5 -84 L-9 -97" class="ink hair" />
			<circle cx="-9" cy="-99" r="3.4" fill="#c4463a" />
			<circle cx="-10" cy="-100" r="1" fill="#f6b4a8" />
			<circle cx="-9" cy="-99" r="3.4" class="ink thin" />
			<!-- miner's lamp on the brow -->
			<g transform="rotate(-28 13 -85)">
				<rect x="8" y="-89" width="9" height="7" rx="1.5" fill="#5d7c74" />
				<path d="M9.5 -87.5 h6" stroke="#9cc0b0" stroke-width="1.2" stroke-linecap="round" />
				<path d="M17 -89.5 q2.5 4 0 8" fill="#fdf3cf" />
				<rect x="8" y="-89" width="9" height="7" rx="1.5" class="ink thin" />
				<path d="M17 -89.5 q2.5 4 0 8" class="ink hair" />
			</g>
			<!-- head -->
			<circle cx="2" cy="-72" r="16" fill="url(#rb-enamel)" />
			<path d="M10 -86 a16 16 0 0 1 2 26 a16 16 0 0 1 -22 -2 a18 18 0 0 0 20 -24z" fill="#bfae8a" opacity="0.6" />
			<path d="M10 -86 a16 16 0 0 1 2 26 a16 16 0 0 1 -22 -2 a18 18 0 0 0 20 -24z" fill="url(#rb-hatch)" opacity="0.5" />
			<path d="M-9 -80 a12 12 0 0 1 9 -6" stroke="#fffaf0" stroke-width="2.4" fill="none" stroke-linecap="round" />
			<!-- ear bolt -->
			<circle cx="-9" cy="-70" r="3" fill="#a39a88" />
			<path d="M-10.5 -70 h3" stroke="#5e584f" stroke-width="0.9" />
			<circle cx="-9" cy="-70" r="3" class="ink hair" />
			<!-- the lens -->
			<circle cx="6" cy="-72" r="10.2" fill="#c9a04c" />
			<path d="M-1 -78 a10 10 0 0 1 13 -2" stroke="#f1d58e" stroke-width="1.6" fill="none" stroke-linecap="round" />
			<circle cx="6" cy="-72" r="7.4" fill="url(#rb-lens)" />
			{#if v.blink}
				<path d="M-1 -72 q7 3 14 0" stroke="#26231f" stroke-width="1.6" fill="none" stroke-linecap="round" />
			{:else}
				<circle cx={6 + iris.x} cy={-72 + iris.y} r={v.look.y === 1 ? 3.6 : 3} fill="#78cfc2" />
				<circle cx={6 + iris.x} cy={-72 + iris.y} r="1.5" fill="#10282b" />
				<circle cx="3" cy="-75.5" r="1.7" fill="#fff" opacity="0.9" />
			{/if}
			<circle cx="6" cy="-72" r="7.4" class="ink hair" />
			<circle cx="6" cy="-72" r="10.2" class="ink thin" />
			<path d="M-14 -72 a16 16 0 0 1 16 -16 a16 16 0 0 1 16 16 a16 16 0 0 1 -16 16 a16 16 0 0 1 -16 -16" class="ink" />
			<path d="M14 -82 a16 16 0 0 1 -4 24" class="ink heavy" />
		</g>

		<!-- ============ arm (the near one), pivoting at the shoulder -->
		<g class="arm" style="transform: translate(4px, -44px) rotate({arm}deg)">
			<path d="M0 0 V13" stroke="#7d776b" stroke-width="3.6" stroke-linecap="round" />
			<path d="M-0.8 1 V12" stroke="#c9c2b2" stroke-width="1" stroke-linecap="round" />
			<path d="M0 13 l-3.5 5 M0 13 l3.5 5" stroke="#4b4741" stroke-width="2" stroke-linecap="round" />
			<circle cx="0" cy="0" r="3" fill="#dca54b" stroke="#3b2a20" stroke-width="1" />
		</g>
	</g>
{/if}

<style>
	.arm {
		transition: transform 0.28s cubic-bezier(0.34, 1.4, 0.64, 1);
	}
</style>
