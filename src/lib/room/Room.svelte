<script lang="ts">
	// The room behind the notebook. One illustration, two lighting states: elements marked
	// `day` / `night` switch on html[data-light]. Prop positions never change between states.
	//
	// Layout (viewBox 1600x1000): the book covers roughly x 200-1400, y 140-940, so props
	// live in the top band (wall, window, shelf) and the left/right desk margins.
	// The base layer ships in the HTML; perimeter clutter loads after first paint.
	import { onMount, type Component } from 'svelte';

	let Details = $state<Component>();

	onMount(() => {
		const load = () => import('./RoomDetails.svelte').then((m) => (Details = m.default));
		if ('requestIdleCallback' in window) {
			const id = requestIdleCallback(load, { timeout: 1500 });
			return () => cancelIdleCallback(id);
		}
		const id = setTimeout(load, 300);
		return () => clearTimeout(id);
	});
</script>

<div class="room" aria-hidden="true">
	<svg class="room-art" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
		<defs>
			<filter id="wobble" x="-2%" y="-2%" width="104%" height="104%">
				<feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="7" />
				<feDisplacementMap in="SourceGraphic" scale="3" />
			</filter>
			<filter id="grain" x="0" y="0" width="100%" height="100%">
				<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3" result="n" />
				<feColorMatrix in="n" values="0 0 0 0 0.18  0 0 0 0 0.12  0 0 0 0 0.08  0 0 0 0.12 0" />
			</filter>
			<linearGradient id="sky-day" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stop-color="#93c2dc" />
				<stop offset="0.75" stop-color="#d6e6dd" />
				<stop offset="1" stop-color="#f4dfb2" />
			</linearGradient>
			<linearGradient id="sky-night" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stop-color="#0f1630" />
				<stop offset="1" stop-color="#262a48" />
			</linearGradient>
			<linearGradient id="sky-dusk" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stop-color="#5a4f8c" />
				<stop offset="0.45" stop-color="#d9708a" />
				<stop offset="0.8" stop-color="#f7a65e" />
				<stop offset="1" stop-color="#ffd27a" />
			</linearGradient>
			<linearGradient id="sky-dawn" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stop-color="#7f9cc8" />
				<stop offset="0.5" stop-color="#f2b3b0" />
				<stop offset="0.85" stop-color="#ffd3a1" />
				<stop offset="1" stop-color="#fff0c4" />
			</linearGradient>
			<clipPath id="glass"><rect x="56" y="30" width="298" height="180" /></clipPath>
			<linearGradient id="desk-wood" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stop-color="#7f5236" />
				<stop offset="1" stop-color="#6a432b" />
			</linearGradient>
			<radialGradient id="bulb-glow">
				<stop offset="0" stop-color="#fff3c4" stop-opacity="0.95" />
				<stop offset="0.4" stop-color="#ffcf73" stop-opacity="0.45" />
				<stop offset="1" stop-color="#ffb347" stop-opacity="0" />
			</radialGradient>
			<linearGradient id="led-up" x1="0" y1="1" x2="0" y2="0">
				<stop offset="0" stop-color="#ff9fb0" stop-opacity="0.8" />
				<stop offset="1" stop-color="#ff8fa0" stop-opacity="0" />
			</linearGradient>
			<linearGradient id="led-down" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stop-color="#ffa6b6" stop-opacity="0.75" />
				<stop offset="1" stop-color="#ff8fa0" stop-opacity="0" />
			</linearGradient>
		</defs>

		<!-- wall -->
		<rect width="1600" height="244" class="wall" />

		<!-- window, top left -->
		<g filter="url(#wobble)">
			<rect x="40" y="16" width="330" height="206" rx="5" class="frame" />
			<!-- sky, sun and moon are clipped to the glass so they can rise and set behind the skyline -->
			<g clip-path="url(#glass)">
				<rect x="56" y="30" width="298" height="180" class="day" fill="url(#sky-day)" />
				<rect x="56" y="30" width="298" height="180" class="night" fill="url(#sky-night)" />
				<rect x="56" y="30" width="298" height="180" class="glow dawn" fill="url(#sky-dawn)" />
				<rect x="56" y="30" width="298" height="180" class="glow dusk" fill="url(#sky-dusk)" />
				<g class="night stars" fill="#f2ecd2">
					<circle cx="90" cy="60" r="1.6" /><circle cx="150" cy="86" r="1.3" /><circle cx="210" cy="50" r="1.6" />
					<circle cx="250" cy="110" r="1.2" /><circle cx="120" cy="130" r="1.3" />
				</g>
				<circle cx="300" cy="70" r="20" class="sun" fill="#fff4cf" />
				<path d="M300 52 a20 20 0 1 0 18 28 a15 15 0 1 1 -18 -28z" class="moon" fill="#f2ecd2" />
				<path d="M86 96 q16 -20 38 -6 q14 -14 30 -2 q20 0 18 14 h-90 q-8 -4 4 -6z" class="day cloud" fill="#fbf7ee" />
			</g>
			<path
				class="skyline"
				d="M56 210 v-34 h24 v-16 h18 v26 h14 v-48 h10 v-10 h6 v10 h10 v48 h20 v-30 h26 v40 h16 v-70 l12 -14 l12 14 v70 h16 v-36 h22 v24 h18 v-48 h16 v48 h24 v-22 h20 v32 h14 v16z"
			/>
			<g class="night windows" fill="#ffd98a">
				<rect x="118" y="160" width="4" height="4" /><rect x="124" y="176" width="4" height="4" />
				<rect x="196" y="170" width="4" height="4" /><rect x="206" y="186" width="4" height="4" />
				<rect x="202" y="152" width="4" height="4" /><rect x="306" y="190" width="4" height="4" />
			</g>
			<path class="ink" d="M205 30 v180 M56 120 h298" />
			<rect x="40" y="16" width="330" height="206" rx="5" class="ink" fill="none" />
			<path class="curtain" d="M18 4 h58 c-8 70 12 150 -4 232 h-52 c6 -86 -14 -170 -2 -232z" />
			<path class="ink thin" d="M36 14 c-4 80 12 150 0 214 M56 14 c-6 90 8 160 2 214" opacity="0.45" />
			<path class="ink" d="M4 6 h400" />
		</g>

		<!-- shelf with an LED strip underneath, top right -->
		<g filter="url(#wobble)">
			<rect x="1040" y="84" width="300" height="12" rx="2" class="shelf" />
			<path class="ink" d="M1066 96 v14 M1314 96 v14" />
			<rect x="1050" y="97" width="280" height="4" rx="2" class="led-strip" />
			<rect x="1050" y="97" width="280" height="4" rx="2" class="night led led-on" />
		</g>
		<rect x="990" y="100" width="400" height="120" class="night led" fill="url(#led-down)" />

		<!-- desk, with an LED strip along its back edge -->
		<path d="M0 240 H1600 V1000 H0z" fill="url(#desk-wood)" />
		<rect x="0" y="120" width="1600" height="120" class="night led" fill="url(#led-up)" />
		<rect x="0" y="236" width="1600" height="6" class="led-strip" />
		<rect x="0" y="236" width="1600" height="6" class="night led led-on" />
		<g class="grain" filter="url(#wobble)">
			<path d="M0 320 C300 314 600 328 900 320 S1400 316 1600 324" />
			<path d="M0 470 C260 480 520 460 820 472 S1340 482 1600 468" />
			<path d="M0 640 C340 630 640 654 980 640 S1420 632 1600 644" />
			<path d="M0 820 C300 830 700 810 1000 824 S1440 832 1600 818" />
			<path d="M60 560 q40 -10 80 0 q-40 10 -80 0z M1460 740 q50 -12 100 0 q-50 12 -100 0z" />
		</g>
		<path d="M0 241 H1600" class="ink" filter="url(#wobble)" />

		<!-- energy-drink can, right margin -->
		<g filter="url(#wobble)" transform="translate(1440 300)">
			<ellipse cx="22" cy="92" rx="28" ry="7" class="contact-shadow" />
			<path d="M2 10 h40 v80 q-20 6 -40 0z" class="can" />
			<path d="M2 34 h40 v22 h-40z" class="can-band" />
			<path d="M18 36 l8 0 l-6 9 h7 l-12 11 l4 -9 h-6z" class="can-bolt" />
			<ellipse cx="22" cy="10" rx="20" ry="5" class="can-top" />
			<path class="ink" d="M2 10 v80 q20 6 40 0 v-80" fill="none" />
			<path class="ink thin" d="M10 18 v66" opacity="0.4" />
		</g>

		<!-- desk lamp: base in the right margin, shade over the top-right of the book -->
		<g filter="url(#wobble)">
			<ellipse cx="1520" cy="586" rx="70" ry="18" class="contact-shadow" />
			<path d="M1462 580 q58 -20 116 0 q-58 18 -116 0z" class="lamp-metal" />
			<path class="lamp-arm" d="M1520 578 L1574 330 L1452 120" />
			<circle cx="1574" cy="330" r="9" class="lamp-metal" />
			<circle cx="1452" cy="120" r="8" class="lamp-metal" />
			<path d="M1462 104 L1380 58 L1318 158 L1394 196 Z" class="lamp-shade" />
			<ellipse cx="1356" cy="178" rx="42" ry="15" transform="rotate(28 1356 178)" class="lamp-mouth" />
			<ellipse cx="1356" cy="178" rx="34" ry="11" transform="rotate(28 1356 178)" class="night lamp bulb-on" />
		</g>
		<circle cx="1340" cy="200" r="150" class="night lamp" fill="url(#bulb-glow)" />
	</svg>

	{#if Details}<Details />{/if}
</div>
