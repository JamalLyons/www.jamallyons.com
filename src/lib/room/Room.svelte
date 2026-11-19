<script lang="ts">
	// The room behind the notebook. One illustration, two lighting states: elements marked
	// `day` / `night` switch on html[data-light]. Prop positions never change between states.
	//
	// Layout (viewBox 1600x1000): the book covers roughly x 200-1400, y 140-940, so props
	// live in the top band (wall, window, shelf) and the left/right desk margins.
	// The base layer ships in the HTML; perimeter clutter loads after first paint.
	//
	// Stacked SVGs share the viewBox, back to front:
	//   .room-art      flat washes: wall and desk planks (first paint)
	//   RoomSurface    paper/wood texture over those washes (lazy; the heavy filters)
	//   .room-art      window, shelf, back rail and lamp (first paint)
	//   RoomDetails    static clutter (lazy)
	//   .room-motion   unfiltered layer for everything that animates (curtain, LED and lamp
	//                  glow), promoted to its own compositor layer so motion never repaints
	//                  the filtered art underneath.
	//
	// Every prop is built in the same order: wash -> shading (hatch / darker wash on the side
	// away from the window) -> highlight -> ink. Defs here are shared with RoomDetails by id.
	import { onMount, type Component } from 'svelte';

	let Surface = $state<Component>();
	let Details = $state<Component>();

	onMount(() => {
		const load = () => {
			import('./RoomSurface.svelte').then((m) => (Surface = m.default));
			import('./RoomDetails.svelte').then((m) => (Details = m.default));
		};
		if ('requestIdleCallback' in window) {
			const id = requestIdleCallback(load, { timeout: 1500 });
			return () => cancelIdleCallback(id);
		}
		const id = setTimeout(load, 300);
		return () => clearTimeout(id);
	});

	/** Evenly spaced coil loops between two points, for the lamp springs. */
	function coil(x1: number, y1: number, x2: number, y2: number, loops: number) {
		const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
		return Array.from({ length: loops }, (_, i) => {
			const t = i / (loops - 1);
			return { x: +(x1 + (x2 - x1) * t).toFixed(1), y: +(y1 + (y2 - y1) * t).toFixed(1), angle: +angle.toFixed(1) };
		});
	}
	const lowerSpring = coil(1522, 532, 1544, 419, 24);
	const upperSpring = coil(1570, 305, 1524, 210, 22);
</script>

<div class="room" aria-hidden="true">
	<svg class="room-art" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
		<defs>
			<!-- hand-drawn line jitter -->
			<filter id="wobble" x="-2%" y="-2%" width="104%" height="104%">
				<feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="7" />
				<feDisplacementMap in="SourceGraphic" scale="3" />
			</filter>
			<!-- watercolour: ragged edges, mottled body, pigment pooled darker at the rim -->
			<filter id="watercolor" x="-4%" y="-4%" width="108%" height="108%" color-interpolation-filters="sRGB">
				<feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="3" seed="11" result="warp" />
				<feDisplacementMap in="SourceGraphic" in2="warp" scale="7" xChannelSelector="R" yChannelSelector="G" result="shape" />
				<feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="4" result="blot" />
				<feColorMatrix in="blot" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.4 0 0 0 0.68" result="mottle" />
				<feComposite in="shape" in2="mottle" operator="in" result="body" />
				<feMorphology in="shape" operator="erode" radius="1.6" result="inner" />
				<feComposite in="shape" in2="inner" operator="out" result="rim" />
				<feColorMatrix in="rim" values="0.62 0 0 0 0  0 0.6 0 0 0  0 0 0.58 0 0  0 0 0 0.55 0" result="rim-dark" />
				<feMerge>
					<feMergeNode in="body" />
					<feMergeNode in="rim-dark" />
				</feMerge>
			</filter>
			<!-- paper fibre laid over a paper-coloured shape -->
			<filter id="paper-tex" x="0" y="0" width="100%" height="100%">
				<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="n" />
				<feColorMatrix in="n" values="0 0 0 0 0.36  0 0 0 0 0.28  0 0 0 0 0.18  0 0 0 0.5 -0.12" result="fibre" />
				<feComposite in="fibre" in2="SourceAlpha" operator="in" result="grain" />
				<feMerge>
					<feMergeNode in="SourceGraphic" />
					<feMergeNode in="grain" />
				</feMerge>
			</filter>
			<!-- soft drop shadow for paper and small props -->
			<filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
				<feGaussianBlur stdDeviation="3" />
			</filter>
			<!-- ink hatching for shadows and the shaded side of objects -->
			<pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
				<path d="M0 0 V5" stroke="#3b2a20" stroke-width="1" />
			</pattern>
			<pattern id="crosshatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
				<path d="M0 0 V6 M0 0 H6" stroke="#3b2a20" stroke-width="0.9" />
			</pattern>
			<!-- wall: lighter by the window, falling off toward the far corner -->
			<radialGradient id="wall-wash" cx="230" cy="70" r="1500" gradientUnits="userSpaceOnUse">
				<stop offset="0" stop-color="#e0d0b0" />
				<stop offset="0.4" stop-color="#cdba99" />
				<stop offset="1" stop-color="#a8916f" />
			</radialGradient>
			<linearGradient id="ceiling-shade" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stop-color="#4a3322" stop-opacity="0.32" />
				<stop offset="1" stop-color="#4a3322" stop-opacity="0" />
			</linearGradient>
			<pattern id="wallpaper" width="46" height="64" patternUnits="userSpaceOnUse">
				<rect width="23" height="64" fill="#fff4dc" opacity="0.13" />
				<path d="M34.5 2 V62" stroke="#7d6648" stroke-width="1" stroke-dasharray="1 6" opacity="0.28" />
			</pattern>
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
			<clipPath id="glass"><rect x="58" y="28" width="294" height="154" /></clipPath>
			<!-- desk: one gradient per plank keeps the boards from reading as one slab -->
			<linearGradient id="plank-a" x1="0" y1="0" x2="1" y2="0.15">
				<stop offset="0" stop-color="#7c4f33" />
				<stop offset="0.5" stop-color="#875a3b" />
				<stop offset="1" stop-color="#7a4d31" />
			</linearGradient>
			<linearGradient id="plank-b" x1="0" y1="0" x2="1" y2="-0.1">
				<stop offset="0" stop-color="#835437" />
				<stop offset="0.6" stop-color="#7a4c30" />
				<stop offset="1" stop-color="#84573a" />
			</linearGradient>
			<radialGradient id="desk-vignette" cx="800" cy="560" r="960" gradientUnits="userSpaceOnUse">
				<stop offset="0.45" stop-color="#2a1608" stop-opacity="0" />
				<stop offset="1" stop-color="#2a1608" stop-opacity="0.55" />
			</radialGradient>
			<linearGradient id="wall-contact" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stop-color="#2a1608" stop-opacity="0.5" />
				<stop offset="1" stop-color="#2a1608" stop-opacity="0" />
			</linearGradient>
			<radialGradient id="bulb-glow">
				<stop offset="0" stop-color="#fff3c4" stop-opacity="0.95" />
				<stop offset="0.4" stop-color="#ffcf73" stop-opacity="0.45" />
				<stop offset="1" stop-color="#ffb347" stop-opacity="0" />
			</radialGradient>
			<radialGradient id="shade-inside" cx="0.6" cy="0.35" r="0.7">
				<stop offset="0" stop-color="#fffbe6" />
				<stop offset="0.35" stop-color="#ffe2a0" />
				<stop offset="1" stop-color="#d9964a" />
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

		<!-- ================================================================ wall -->
		<rect width="1600" height="244" fill="url(#wall-wash)" />
		<rect width="1600" height="244" fill="url(#wallpaper)" />
		<rect width="1600" height="60" fill="url(#ceiling-shade)" />

		<!-- ================================================================ desk -->
		<!-- planks, nearest boards widest -->
		<rect x="0" y="240" width="1600" height="178" fill="url(#plank-a)" />
		<rect x="0" y="418" width="1600" height="194" fill="url(#plank-b)" />
		<rect x="0" y="612" width="1600" height="214" fill="url(#plank-a)" />
		<rect x="0" y="826" width="1600" height="174" fill="url(#plank-b)" />
		<!-- a few boards tinted a touch warmer or cooler -->
		<rect x="520" y="240" width="1080" height="178" fill="#9a6440" opacity="0.18" />
		<rect x="0" y="418" width="1180" height="194" fill="#5c3720" opacity="0.12" />
		<rect x="360" y="612" width="940" height="214" fill="#a06a45" opacity="0.14" />
		<rect x="900" y="826" width="700" height="174" fill="#5c3720" opacity="0.14" />
		<g class="grain" filter="url(#wobble)">
			<path d="M0 286 C300 280 600 294 900 286 S1400 282 1600 290" />
			<path d="M0 352 C220 360 480 342 760 352 S1300 360 1600 348" />
			<path d="M0 470 C260 480 520 460 820 472 S1340 482 1600 468" />
			<path d="M0 548 C300 540 640 560 980 548 S1440 540 1600 552" />
			<path d="M0 672 C340 662 640 686 980 672 S1420 664 1600 676" />
			<path d="M0 760 C320 770 700 750 1040 762 S1450 770 1600 758" />
			<path d="M0 880 C300 890 700 870 1000 884 S1440 892 1600 878" />
			<path d="M0 950 C380 942 760 960 1120 950 S1480 944 1600 954" />
			<!-- grain swirling round two knots -->
			<path d="M60 530 C100 512 160 512 200 528 M40 542 C100 524 170 526 230 540 M70 566 C110 584 170 582 210 566" />
			<path d="M1430 732 C1480 714 1540 714 1590 730 M1410 746 C1480 728 1550 730 1610 744 M1440 770 C1490 788 1540 786 1590 770" />
		</g>
		<g class="grain light" filter="url(#wobble)">
			<path d="M0 316 C340 310 700 322 1100 314 S1500 312 1600 318" />
			<path d="M0 500 C300 506 640 494 980 502 S1440 508 1600 498" />
			<path d="M0 720 C360 712 760 728 1120 718 S1480 714 1600 722" />
			<path d="M0 920 C320 926 720 912 1060 922 S1460 926 1600 916" />
		</g>
		<!-- knots -->
		<g filter="url(#wobble)">
			<ellipse cx="136" cy="548" rx="16" ry="6" fill="#4a2c19" />
			<ellipse cx="136" cy="548" rx="26" ry="10" class="knot-ring" />
			<ellipse cx="1508" cy="751" rx="18" ry="7" fill="#4a2c19" />
			<ellipse cx="1508" cy="751" rx="30" ry="12" class="knot-ring" />
		</g>
		<!-- plank seams and butt joints, each with a lit lower lip -->
		<g filter="url(#wobble)">
			<path class="seam-lip" d="M0 421 H1600 M0 615 H1600 M0 829 H1600" />
			<path class="seam" d="M0 418 H1600 M0 612 H1600 M0 826 H1600" />
			<path class="seam" d="M520 240 V418 M1180 418 V612 M360 612 V826 M1300 612 V826 M900 826 V1000" />
		</g>
		<rect x="0" y="240" width="1600" height="760" fill="url(#desk-vignette)" />
		<!-- shadow where the desk meets the wall -->
		<rect x="0" y="240" width="1600" height="40" fill="url(#wall-contact)" />

	</svg>

	<!-- paper and wood texture: lazy, sits between the flat washes and the props -->
	{#if Surface}<Surface />{/if}

	<svg class="room-art" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
		<!-- ================================================================ window, top left -->
		<!-- sill shadow cast down the wall -->
		<path d="M32 210 H384 L374 226 H42z" fill="#3a2414" opacity="0.18" filter="url(#soft)" />
		<g filter="url(#wobble)">
			<rect x="40" y="12" width="330" height="190" rx="4" class="frame" />
			<!-- sky, sun and moon are clipped to the glass so they can rise and set behind the skyline -->
			<g clip-path="url(#glass)">
				<rect x="58" y="28" width="294" height="154" class="day" fill="url(#sky-day)" />
				<rect x="58" y="28" width="294" height="154" class="night" fill="url(#sky-night)" />
				<rect x="58" y="28" width="294" height="154" class="glow dawn" fill="url(#sky-dawn)" />
				<rect x="58" y="28" width="294" height="154" class="glow dusk" fill="url(#sky-dusk)" />
				<g class="night stars" fill="#f2ecd2">
					<circle cx="90" cy="52" r="1.6" /><circle cx="150" cy="76" r="1.3" /><circle cx="226" cy="44" r="1.6" />
					<circle cx="262" cy="92" r="1.2" /><circle cx="120" cy="104" r="1.3" /><circle cx="330" cy="40" r="1" />
				</g>
				<circle cx="300" cy="64" r="19" class="sun" fill="#fff4cf" />
				<path d="M300 46 a19 19 0 1 0 17 27 a14 14 0 1 1 -17 -27z" class="moon" fill="#f2ecd2" />
				<path d="M86 84 q16 -20 38 -6 q14 -14 30 -2 q20 0 18 14 h-90 q-8 -4 4 -6z" class="day cloud" fill="#fbf7ee" />
				<path d="M236 104 q10 -12 24 -4 q10 -8 20 0 q12 0 10 9 h-58 q-4 -3 4 -5z" class="day cloud" fill="#fbf7ee" opacity="0.8" />
				<!-- far skyline, paler for distance -->
				<path
					class="skyline far"
					d="M58 182 V128 h14 v-10 h22 v18 h18 v-34 h8 v-12 h4 v12 h10 v30 h26 v-22 h20 v26 h30 v-44 h6 v-10 h6 v10 h8 v44 h22 v-14 h26 v20 h24 v-30 h18 v24 H352 V182z"
				/>
				<path
					class="skyline"
					d="M58 182 v-28 h20 v-14 h16 v22 h12 v-40 h10 v-9 h6 v9 h10 v40 h18 v-24 h24 v32 h14 v-58 l11 -12 l11 12 v58 h14 v-30 h20 v18 h16 v-40 h14 v40 h22 v-18 h18 v26 h14 v-12 H352 V182z"
				/>
				<g class="night windows" fill="#ffd98a">
					<rect x="118" y="134" width="4" height="4" /><rect x="124" y="150" width="4" height="4" />
					<rect x="196" y="144" width="4" height="4" /><rect x="206" y="160" width="4" height="4" />
					<rect x="200" y="128" width="4" height="4" /><rect x="300" y="160" width="4" height="4" />
					<rect x="262" y="166" width="4" height="4" />
				</g>
				<!-- glass glare (day) -->
				<path class="day glare" d="M84 170 L150 40 M104 174 L146 92 M232 176 L300 44" />
			</g>
			<!-- inner reveal: the frame has depth -->
			<path d="M50 20 H360 L352 28 H58z" fill="#b8a280" />
			<path d="M50 20 L58 28 V182 L50 192z" fill="#cdb995" />
			<path d="M360 20 L352 28 V182 L360 192z" fill="#f4ead3" />
			<path d="M50 192 L58 182 H352 L360 192z" fill="#f6eedb" />
			<!-- mullions with a bevel -->
			<rect x="200" y="28" width="10" height="154" fill="#eadcbf" />
			<path d="M200 28 V182" stroke="#fffaee" stroke-width="2" />
			<path d="M210 28 V182" stroke="#a88f6c" stroke-width="2" />
			<rect x="58" y="101" width="294" height="9" fill="#eadcbf" />
			<path d="M58 101 H352" stroke="#fffaee" stroke-width="2" />
			<path d="M58 110 H352" stroke="#a88f6c" stroke-width="2" />
			<path class="ink thin" d="M200 28 V182 M210 28 V182 M58 101 H352 M58 110 H352" />
			<rect x="58" y="28" width="294" height="154" class="ink thin" />
			<rect x="40" y="12" width="330" height="190" rx="4" class="ink" />
			<!-- sill ledge -->
			<rect x="28" y="196" width="354" height="9" rx="2" fill="#efe3c8" />
			<rect x="28" y="205" width="354" height="7" fill="#c9b38f" />
			<rect x="28" y="205" width="354" height="7" fill="url(#hatch)" opacity="0.35" />
			<path class="ink" d="M28 196 H382 V212 H28z" />
			<path class="ink thin" d="M28 205 H382" />
		</g>

		<!-- ================================================================ shelf, top right -->
		<path d="M1044 103 H1340 L1330 124 H1056z" fill="#3a2414" opacity="0.22" filter="url(#soft)" />
		<g filter="url(#wobble)">
			<!-- brackets and their shadows -->
			<path d="M1080 102 L1086 140 M1316 102 L1322 140" stroke="#3a2414" stroke-width="5" opacity="0.18" />
			<path d="M1070 98 V136 H1076 V110 L1102 98z M1310 98 V136 H1304 V110 L1278 98z" fill="#454039" />
			<path d="M1072 100 V132" stroke="#8d8577" stroke-width="1.4" />
			<path class="ink thin" d="M1070 98 V136 H1076 V110 L1102 98 M1310 98 V136 H1304 V110 L1278 98" />
			<!-- board: front face, underside, left end grain -->
			<rect x="1036" y="84" width="308" height="14" fill="#7d4e30" />
			<path d="M1036 98 H1344 L1338 103 H1042z" fill="#4e3020" />
			<path d="M1030 80 L1036 84 V98 L1030 94z" fill="#a9774f" />
			<path class="ink hair" d="M1032.5 84 q2 4 0 8 M1034.5 85 q2 4 0 9" />
			<path class="wood-line" d="M1042 88 C1110 86 1180 91 1250 88 S1320 87 1340 89 M1044 93 C1120 95 1200 91 1338 94" />
			<path d="M1040 85.5 H1340" stroke="#b07f58" stroke-width="1.4" opacity="0.8" />
			<path class="ink" d="M1030 80 L1036 84 H1344 V98 H1036 L1030 94z M1036 84 V98 M1042 103 H1338" />
		</g>

		<!-- back rail along the wall, with the LED strip on its top edge -->
		<g filter="url(#wobble)">
			<rect x="0" y="224" width="1600" height="18" fill="#6c4329" />
			<path d="M0 227 H1600" stroke="#a87b55" stroke-width="2" />
			<path class="wood-line" d="M0 233 C400 231 800 236 1200 233 S1500 232 1600 234" />
			<rect x="0" y="220" width="1600" height="5" class="led-strip" />
			<path class="ink" d="M0 220 H1600 M0 242 H1600" />
		</g>
		<!-- the LED strip under the shelf -->
		<rect x="1050" y="101" width="280" height="4" rx="2" class="led-strip" />

		<!-- ================================================================ desk lamp, right margin -->
		<!-- spring-balanced architect lamp: weighted base, two-rod arms with springs, cone shade -->
		<g filter="url(#wobble)">
			<!-- base -->
			<ellipse cx="1540" cy="610" rx="76" ry="17" class="contact-shadow" filter="url(#soft)" />
			<path d="M1472 590 v14 a58 14 0 0 0 116 0 v-14z" fill="#2a3a35" />
			<path d="M1556 603 v13 a58 14 0 0 0 32 -12 v-14z" fill="url(#hatch)" opacity="0.6" />
			<path d="M1480 596 v10" stroke="#7fa596" stroke-width="3" stroke-linecap="round" opacity="0.7" />
			<ellipse cx="1530" cy="590" rx="58" ry="14" fill="#41594f" />
			<path d="M1484 588 q34 -11 76 -6" stroke="#9cc0b0" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.75" />
			<path class="ink" d="M1472 590 v14 a58 14 0 0 0 116 0 v-14" />
			<ellipse cx="1530" cy="590" rx="58" ry="14" class="ink" />
			<rect x="1522" y="566" width="16" height="25" rx="3" fill="#2f3d3a" />
			<rect x="1522" y="566" width="16" height="25" rx="3" class="ink thin" />

			<!-- cord, looping along the arm and off the desk edge -->
			<path class="cord" d="M1490 170 C1534 214 1602 280 1590 350 C1580 430 1594 520 1586 596 C1594 620 1606 640 1624 660" />

			<!-- lower arm: twin rods, spring on the inside -->
			<path class="rod" d="M1525 575 L1569 349 M1535 577 L1579 351" />
			<path class="rod-shine" d="M1526 566 L1567 356" />
			<path class="spring-hook" d="M1522 532 L1530 548 M1544 419 L1558 408" />
			{#each lowerSpring as p, i (i)}
				<ellipse cx={p.x} cy={p.y} rx="2.3" ry="6.5" transform="rotate({p.angle} {p.x} {p.y})" class="spring" />
			{/each}

			<!-- upper arm -->
			<path class="rod" d="M1578 348 L1486 158 M1569 352 L1477 162" />
			<path class="rod-shine" d="M1570 344 L1484 166" />
			<path class="spring-hook" d="M1570 305 L1566 321 M1524 210 L1509 203" />
			{#each upperSpring as p, i (i)}
				<ellipse cx={p.x} cy={p.y} rx="2.3" ry="6.5" transform="rotate({p.angle} {p.x} {p.y})" class="spring" />
			{/each}

			<!-- shade: cone from the joint, mouth tipped toward the book -->
			<path d="M1457.9 164.3 L1368.1 205.2 L1439.9 274.8 L1478.1 183.7 Q1490 164 1457.9 164.3z" fill="#3e6b5e" />
			<path d="M1468 174 L1404 240 L1439.9 274.8 L1478.1 183.7z" fill="#1f3b33" opacity="0.4" />
			<path d="M1468 174 L1404 240 L1439.9 274.8 L1478.1 183.7z" fill="url(#hatch)" opacity="0.5" />
			<path d="M1461 172 L1384 209" stroke="#a7cbbb" stroke-width="4" stroke-linecap="round" opacity="0.8" />
			<path d="M1466 168 L1452 175" stroke="#e9f4ee" stroke-width="2.5" stroke-linecap="round" opacity="0.8" />
			<path class="ink heavy" d="M1457.9 164.3 L1368.1 205.2 M1439.9 274.8 L1478.1 183.7 Q1490 164 1457.9 164.3" />
			<!-- mouth: shadowed inside by day, the bulb lights it at night -->
			<ellipse cx="1404" cy="240" rx="50" ry="16" transform="rotate(44.1 1404 240)" fill="#1b2422" />
			<ellipse cx="1410" cy="234" rx="38" ry="10" transform="rotate(44.1 1410 234)" fill="#2c3a36" />
			<ellipse cx="1404" cy="240" rx="46" ry="14" transform="rotate(44.1 1404 240)" class="night lamp" fill="url(#shade-inside)" />
			<circle cx="1409" cy="236" r="12" class="night lamp" fill="#fff9e2" />
			<path class="night lamp filament" d="M1402 238 l2.5 -5 l2.5 5 l2.5 -5 l2.5 5 l2.5 -5" />
			<ellipse cx="1404" cy="240" rx="50" ry="16" transform="rotate(44.1 1404 240)" class="ink heavy" />

			<!-- joints -->
			{#each [[1530, 576], [1574, 350], [1482, 160]] as [x, y], i (i)}
				<circle cx={x} cy={y} r="9.5" fill="#41594f" />
				<circle cx={x} cy={y} r="3.5" fill="#d2b56f" />
				<path d="M{x - 6} {y - 4} a7 7 0 0 1 6 -4" stroke="#b3d3c5" stroke-width="2" fill="none" stroke-linecap="round" />
				<circle cx={x} cy={y} r="9.5" class="ink thin" />
			{/each}
		</g>
	</svg>

	{#if Details}<Details />{/if}

	<!-- animated and glowing parts; no filters here -->
	<svg class="room-art room-motion" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
		<!-- LED wash up the wall and down from the shelf (night) -->
		<g class="led-breathe">
			<rect x="0" y="96" width="1600" height="126" class="night led" fill="url(#led-up)" />
			<rect x="0" y="220" width="1600" height="5" class="night led led-on" />
			<rect x="990" y="104" width="400" height="116" class="night led" fill="url(#led-down)" />
			<rect x="1050" y="101" width="280" height="4" rx="2" class="night led led-on" />
		</g>

		<!-- curtain: pleats in darker wash, lit edges, a tie-back; sways from the rod -->
		<g class="curtain-sway">
			<path class="curtain" d="M12 8 H88 C82 52 68 108 60 140 C68 172 78 206 82 238 H10 C14 202 18 170 16 140 C18 100 10 52 12 8z" />
			<path class="curtain-fold" d="M26 10 C26 60 22 110 24 140 C22 170 20 204 20 236 H30 C30 204 30 172 30 142 C32 110 34 60 36 10z" />
			<path class="curtain-fold" d="M50 10 C50 60 42 110 40 140 C44 170 48 204 50 236 H58 C58 204 54 172 48 142 C50 110 58 60 62 10z" />
			<path class="curtain-fold" d="M72 10 C70 60 60 110 54 140 L58 142 C66 110 78 60 82 10z" />
			<path class="curtain-lit" d="M18 12 C18 60 14 110 18 140 M40 12 C40 60 34 110 34 140 M64 12 C62 60 52 110 46 140" />
			<path class="curtain-lit" d="M16 150 C16 190 14 210 14 234 M36 152 C38 190 40 210 40 234 M58 152 C64 188 70 210 72 234" />
			<!-- tie-back -->
			<path d="M12 134 C30 140 50 140 64 134 L66 146 C50 152 30 152 12 146z" fill="#d9b25f" />
			<path d="M14 138 C30 143 48 143 62 138" stroke="#f3d998" stroke-width="2" fill="none" />
			<path class="ink thin" d="M12 134 C30 140 50 140 64 134 L66 146 C50 152 30 152 12 146z" />
			<path d="M60 146 c4 10 2 20 -2 28 M64 146 c6 10 6 18 4 26" stroke="#c99d45" stroke-width="2.5" fill="none" stroke-linecap="round" />
			<circle cx="64" cy="140" r="5" fill="#e6c272" class="ink thin" />
			<path class="ink" d="M12 8 H88 C82 52 68 108 60 140 C68 172 78 206 82 238 H10 C14 202 18 170 16 140 C18 100 10 52 12 8z" />
		</g>
		<!-- curtain rod and rings, fixed to the wall -->
		<path d="M2 6 H404" stroke="#5a4636" stroke-width="5" stroke-linecap="round" />
		<path d="M2 4.5 H404" stroke="#a48a6e" stroke-width="1.4" />
		<circle cx="404" cy="6" r="6" fill="#5a4636" />
		<g class="curtain-rings">
			<ellipse cx="18" cy="7" rx="4" ry="5" /><ellipse cx="36" cy="7" rx="4" ry="5" />
			<ellipse cx="54" cy="7" rx="4" ry="5" /><ellipse cx="72" cy="7" rx="4" ry="5" />
		</g>

		<!-- lamp light (night) -->
		<g class="lamp-pulse">
			<circle cx="1404" cy="244" r="170" class="night lamp" fill="url(#bulb-glow)" />
		</g>
	</svg>
</div>
