<!--
	Surface texture for the wall and desk, loaded after first paint. It lies over the flat
	washes in Room.svelte and under the window, lamp and clutter, so the texture never muddies
	a prop. Everything here is static: the turbulence filters render once.
-->
<svg class="room-art room-details" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
	<defs>
		<!-- wall plaster: soft blooms and a few darker pigment pools, very low contrast -->
		<filter id="wall-tex" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
			<feTurbulence type="fractalNoise" baseFrequency="0.004 0.012" numOctaves="3" seed="21" result="bloom" />
			<feColorMatrix
				in="bloom"
				values="0 0 0 0 0.42  0 0 0 0 0.3  0 0 0 0 0.18  0 0 0 -0.9 0.52"
				result="pool"
			/>
			<feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="5" result="fibre" />
			<feColorMatrix in="fibre" values="0 0 0 0 0.3  0 0 0 0 0.22  0 0 0 0 0.14  0 0 0 0.35 -0.1" result="grain" />
			<feMerge>
				<feMergeNode in="pool" />
				<feMergeNode in="grain" />
			</feMerge>
		</filter>
		<!-- desk: long stretched grain and scuffs, in the plank colours -->
		<filter id="wood-tex" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
			<feTurbulence type="fractalNoise" baseFrequency="0.002 0.06" numOctaves="3" seed="8" result="grain" />
			<feColorMatrix in="grain" values="0 0 0 0 0.2  0 0 0 0 0.1  0 0 0 0 0.04  0 0 -1.5 0 0.78" result="dark" />
			<feTurbulence type="fractalNoise" baseFrequency="0.008 0.04" numOctaves="2" seed="13" result="figure" />
			<feColorMatrix in="figure" values="0 0 0 0 0.85  0 0 0 0 0.6  0 0 0 0 0.38  0 1.8 0 0 -0.95" result="light" />
			<feMerge>
				<feMergeNode in="dark" />
				<feMergeNode in="light" />
			</feMerge>
		</filter>
		<clipPath id="desk-area"><rect x="0" y="242" width="1600" height="758" /></clipPath>
		<clipPath id="wall-area"><rect x="0" y="0" width="1600" height="220" /></clipPath>
	</defs>

	<!-- ============================================================ surface textures -->
	<rect width="1600" height="220" filter="url(#wall-tex)" class="tex" />
	<g clip-path="url(#desk-area)">
		<rect x="0" y="242" width="1600" height="758" filter="url(#wood-tex)" class="tex wood" />
	</g>
	<!-- faint scratches and wear in the varnish -->
	<g class="scratch">
		<path d="M44 690 l70 -14 M60 700 l40 -7 M1380 470 l90 18 M1420 600 l50 -6 M240 318 l58 -9" />
		<path d="M1560 520 l-30 30 M120 990 l60 -30 M1500 960 l70 -10" />
	</g>
	<!-- hand-drawn wallpaper sprigs, barely there -->
	<g class="sprigs" clip-path="url(#wall-area)">
		{#each [440, 600, 760, 920, 1080, 1240, 1400, 1560] as x, i (x)}
			{@const y = i % 2 ? 150 : 176}
			<path d="M{x} {y} q4 -12 0 -22 M{x} {y - 10} q-8 -2 -10 -9 M{x} {y - 15} q8 -2 9 -9" />
		{/each}
	</g>
	<!-- skirting: where the wall meets the back rail -->
	<path d="M0 212 H1600 V220 H0z" fill="#e6d8bb" />
	<path d="M0 214 H1600" stroke="#fff6e2" stroke-width="1.5" />
	<path d="M0 212 H1600" class="ink thin" filter="url(#wobble)" />

</svg>
