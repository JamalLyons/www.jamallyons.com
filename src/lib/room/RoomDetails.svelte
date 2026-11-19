<!--
	Perimeter clutter, loaded after first paint. Same viewBox and cropping as Room.svelte,
	so every prop lines up with the base desk. Keep x 265-1335, y 100-940 clear: the book is
	there at common desktop sizes. The strip under the page controls stays mostly empty.

	Uses the shared defs from Room.svelte (#watercolor, #paper-tex, #hatch, #crosshatch, #soft,
	#wobble). Each prop: wash (watercolour) -> shading -> highlight -> ink.
	The second SVG holds the few things that move; it carries no filters.
-->
<script lang="ts">
	// breadboard hole grid: 2 halves of 5 rows, 14 columns
	const holeCols = Array.from({ length: 14 }, (_, i) => 1424 + i * 11);
	const holeRows = [838, 845, 852, 859, 866, 880, 887, 894, 901, 908];
	// mechanical keyboard poking in from the left edge: rows of keycaps
	const keyRows = [
		{ y: 808, keys: [-30, 6, 42, 78, 114, 150] },
		{ y: 846, keys: [-12, 24, 60, 96, 132, 168] },
		{ y: 884, keys: [-2, 34, 70, 106, 142] }
	];
	const accentKeys = new Set(['0-5', '2-0']);
	// a calendar month as dots, with a couple of days crossed off
	const calDays = Array.from({ length: 28 }, (_, i) => ({ x: 412 + (i % 7) * 10.5, y: 66 + Math.floor(i / 7) * 13 }));
	// dust motes drifting in the sun shafts
	const motes = [
		{ x: 300, y: 300, r: 2.2, d: 0 },
		{ x: 420, y: 250, r: 1.6, d: -3 },
		{ x: 520, y: 380, r: 2.6, d: -7 },
		{ x: 250, y: 470, r: 1.8, d: -11 },
		{ x: 640, y: 300, r: 1.5, d: -5 },
		{ x: 380, y: 560, r: 2, d: -14 },
		{ x: 180, y: 360, r: 1.4, d: -9 }
	];
</script>

<svg class="room-art room-details" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
	<defs>
		<pattern id="grid" width="12" height="12" patternUnits="userSpaceOnUse">
			<path d="M12 0 H0 V12" fill="none" stroke="#8fb0cc" stroke-width="0.7" opacity="0.6" />
		</pattern>
		<pattern id="lined" width="20" height="14" patternUnits="userSpaceOnUse">
			<path d="M0 13.5 H20" stroke="#9fb6d0" stroke-width="0.8" opacity="0.7" />
		</pattern>
		<linearGradient id="curl" x1="0" y1="0" x2="1" y2="1">
			<stop offset="0" stop-color="#fffaf0" />
			<stop offset="0.6" stop-color="#e7dcc2" />
			<stop offset="1" stop-color="#c8b994" />
		</linearGradient>
		<linearGradient id="can-body" x1="0" y1="0" x2="1" y2="0">
			<stop offset="0" stop-color="#25467a" />
			<stop offset="0.18" stop-color="#4b80c7" />
			<stop offset="0.3" stop-color="#9cc3ec" />
			<stop offset="0.4" stop-color="#4b80c7" />
			<stop offset="0.8" stop-color="#2f5b99" />
			<stop offset="1" stop-color="#1d3863" />
		</linearGradient>
		<linearGradient id="can-metal" x1="0" y1="0" x2="1" y2="0">
			<stop offset="0" stop-color="#8a9099" />
			<stop offset="0.3" stop-color="#eef1f4" />
			<stop offset="0.55" stop-color="#b8bec7" />
			<stop offset="1" stop-color="#6e747d" />
		</linearGradient>
		<linearGradient id="mug-body" x1="0" y1="0" x2="1" y2="0">
			<stop offset="0" stop-color="#e9e1cf" />
			<stop offset="0.3" stop-color="#fbf7ec" />
			<stop offset="0.75" stop-color="#d9cdb3" />
			<stop offset="1" stop-color="#b3a585" />
		</linearGradient>
		<radialGradient id="coffee" cx="0.4" cy="0.4" r="0.7">
			<stop offset="0" stop-color="#6b3d1e" />
			<stop offset="1" stop-color="#2e170a" />
		</radialGradient>
		<linearGradient id="ferrule" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stop-color="#f1ecdf" />
			<stop offset="0.45" stop-color="#b9b3a3" />
			<stop offset="1" stop-color="#7b7566" />
		</linearGradient>
		<radialGradient id="duck-body" cx="0.35" cy="0.3" r="0.8">
			<stop offset="0" stop-color="#fff2a8" />
			<stop offset="0.45" stop-color="#f7cf45" />
			<stop offset="1" stop-color="#d79a1c" />
		</radialGradient>
		<linearGradient id="pot" x1="0" y1="0" x2="1" y2="0">
			<stop offset="0" stop-color="#d9875e" />
			<stop offset="0.35" stop-color="#e9a07a" />
			<stop offset="1" stop-color="#a65335" />
		</linearGradient>
	</defs>

	<!-- ============================================================ wall: calendar -->
	<g transform="rotate(-2 446 70)">
		<path d="M410 24 h76 v110 h-76z" transform="translate(5 6)" class="drop" filter="url(#soft)" />
		<g filter="url(#paper-tex)">
			<path d="M406 22 h82 v112 h-82z" class="sheet" />
		</g>
		<g filter="url(#watercolor)">
			<rect x="406" y="22" width="82" height="30" fill="#c4584a" />
			<circle cx="447" cy="40" r="5" fill="#f3d4a0" opacity="0.8" />
		</g>
		<g class="cal-days">
			{#each calDays as d, i (i)}
				<rect x={d.x} y={d.y} width="7" height="8" rx="1" />
			{/each}
		</g>
		<path class="ink thin red" d="M412.5 67 l6 7 M418.5 67 l-6 7 M423 67 l6 7 M429 67 l-6 7 M433.5 67 l6 7 M439.5 67 l-6 7" />
		<ellipse cx="458" cy="96" rx="9" ry="7" class="ink thin red" />
		<g filter="url(#wobble)">
			<path class="ink thin" d="M406 22 h82 v112 h-82z M406 52 h82" />
			<path class="ink hair" d="M412 18 v8 M424 18 v8 M436 18 v8 M458 18 v8 M470 18 v8 M482 18 v8" />
			<path class="ink thin" d="M447 8 L430 22 M447 8 L464 22" />
			<circle cx="447" cy="8" r="3" class="nail" />
		</g>
	</g>

	<!-- ============================================================ wall: pinned sketch -->
	<g transform="rotate(-3 576 80)">
		<path d="M508 26 h134 v104 l-16 16 h-118z" transform="translate(6 7)" class="drop" filter="url(#soft)" />
		<g filter="url(#paper-tex)">
			<path d="M508 26 h134 v104 l-16 16 h-118z" class="sheet" />
		</g>
		<path d="M642 130 l-16 16 q2 -12 16 -16z" fill="url(#curl)" />
		<g filter="url(#watercolor)">
			<rect x="526" y="52" width="38" height="24" fill="#a9c6d8" opacity="0.7" />
			<rect x="596" y="52" width="32" height="24" fill="#e9c27a" opacity="0.7" />
		</g>
		<g filter="url(#wobble)">
			<rect x="524" y="50" width="40" height="26" class="ink thin" />
			<rect x="594" y="50" width="34" height="26" class="ink thin" />
			<path class="ink thin" d="M564 63 h28 M586 59 l6 4 l-6 4" />
			<path class="pencil" d="M524 98 h96 M524 112 h64 M524 124 h80" />
			<path class="ink thin" d="M508 26 h134 v104 l-16 16 h-118z M642 130 l-16 16 q2 -12 16 -16" />
		</g>
		<circle cx="577" cy="34" r="6" class="pin" />
		<circle cx="575.5" cy="32.5" r="2" fill="#f7c1b6" />
	</g>

	<!-- ============================================================ wall: polaroid strip -->
	<g transform="rotate(2.5 740 70)">
		<rect x="668" y="28" width="150" height="70" transform="translate(5 6)" class="drop" filter="url(#soft)" />
		<g filter="url(#paper-tex)">
			<rect x="668" y="28" width="150" height="70" class="sheet bright" />
		</g>
		<g filter="url(#watercolor)">
			<!-- hills -->
			<rect x="674" y="34" width="42" height="42" fill="#a7cde0" />
			<path d="M674 76 v-14 q10 -12 22 -2 q10 -10 20 0 v16z" fill="#7fa36b" />
			<circle cx="706" cy="44" r="5" fill="#f6d77d" />
			<!-- sea at sunset -->
			<rect x="722" y="34" width="42" height="42" fill="#f2b38a" />
			<rect x="722" y="58" width="42" height="18" fill="#5f7fa6" />
			<circle cx="743" cy="58" r="8" fill="#fbe0a0" />
			<!-- a coffee cup, close up -->
			<rect x="770" y="34" width="42" height="42" fill="#d8c3a2" />
			<path d="M780 50 h20 v14 q-10 6 -20 0z" fill="#8e4c3e" />
		</g>
		<g filter="url(#wobble)">
			<path class="ink hair" d="M674 34 h42 v42 h-42z M722 34 h42 v42 h-42z M770 34 h42 v42 h-42z" />
			<path class="ink hair" d="M800 54 q7 0 7 5 t-7 5 M784 46 q2 -4 0 -7 M790 46 q2 -4 0 -7" />
			<path class="ink thin" d="M668 28 h150 v70 h-150z" />
			<path class="pencil" d="M684 88 h24 M732 88 h18 M780 88 h22" />
		</g>
		<!-- washi tape, one strip each end -->
		<path d="M660 22 l30 -2 l2 4 l-2 3 l2 4 l-30 2 l-2 -4 l2 -3z" class="washi mint" />
		<path d="M796 24 l30 2 l-1 4 l2 3 l-2 4 l-30 -2 l1 -4 l-2 -3z" class="washi mint" />
	</g>

	<!-- ============================================================ wall: grid paper + sticky -->
	<g transform="rotate(-3.5 920 66)">
		<rect x="842" y="20" width="164" height="104" transform="translate(6 7)" class="drop" filter="url(#soft)" />
		<g filter="url(#paper-tex)">
			<rect x="842" y="20" width="164" height="104" class="sheet cool" />
		</g>
		<rect x="842" y="20" width="164" height="104" fill="url(#grid)" />
		<text x="856" y="56" class="scrawl">step → next → finish</text>
		<g filter="url(#wobble)">
			<path class="ink thin" d="M858 78 h120 M858 98 h80" />
			<path class="ink thin" d="M842 20 h164 v104 h-164z" />
		</g>
		<path d="M902 14 l38 1 l1 4 l-2 3 l2 4 l-38 -1 l-1 -4 l2 -3z" class="washi rose" />
	</g>
	<g transform="rotate(6 1000 104)">
		<rect x="966" y="70" width="70" height="66" transform="translate(4 5)" class="drop" filter="url(#soft)" />
		<g filter="url(#watercolor)">
			<rect x="966" y="70" width="70" height="66" fill="#f4d66e" />
			<rect x="966" y="70" width="70" height="12" fill="#e2bd4c" opacity="0.6" />
		</g>
		<g filter="url(#wobble)">
			<path class="ink thin" d="M974 124 l14 -26 l12 14 l14 -28 l14 20" />
			<path class="ink thin strike" d="M972 92 l58 34" />
			<path class="ink thin" d="M966 70 h70 v66 h-70z" />
		</g>
	</g>

	<!-- ============================================================ shelf: books, jar, succulent -->
	<g>
		<!-- shadows the books throw on the wall, away from the window -->
		<path d="M1050 84 l8 -54 h76 l10 54z M1180 84 l4 -34 h70 l4 34z" class="drop" filter="url(#soft)" opacity="0.5" />
		<g filter="url(#watercolor)">
			<rect x="1046" y="30" width="22" height="54" fill="#6f8f6a" />
			<rect x="1068" y="38" width="17" height="46" fill="#c9a14a" />
			<rect x="1085" y="24" width="26" height="60" fill="#8e4c3e" />
			<rect x="1111" y="34" width="18" height="50" fill="#486a8c" />
			<path d="M1131 84 l26 -50 l17 9 l-22 41z" fill="#b6714d" />
			<!-- horizontal stack -->
			<rect x="1178" y="72" width="78" height="12" fill="#6f8f6a" />
			<rect x="1184" y="61" width="68" height="11" fill="#d9c9a0" />
			<rect x="1180" y="51" width="74" height="10" fill="#8e4c3e" />
			<!-- jar -->
			<path d="M1266 50 h30 v32 q-15 4 -30 0z" fill="#c8dcd8" opacity="0.7" />
			<!-- succulent pot -->
			<path d="M1306 62 h32 l-4 22 h-24z" fill="url(#pot)" />
			<rect x="1304" y="58" width="36" height="7" fill="#c66e4a" />
		</g>
		<!-- spine shading on the side away from the window -->
		<g fill="url(#hatch)" opacity="0.55">
			<rect x="1062" y="30" width="6" height="54" />
			<rect x="1080" y="38" width="5" height="46" />
			<rect x="1104" y="24" width="7" height="60" />
			<rect x="1124" y="34" width="5" height="50" />
			<rect x="1178" y="80" width="78" height="4" />
		</g>
		<!-- title bands and gilt -->
		<g class="spine-bands">
			<path d="M1046 40 h22 M1046 44 h22 M1046 72 h22" />
			<path d="M1068 48 h17 M1068 76 h17" />
			<path d="M1085 34 h26 M1085 38 h26 M1085 70 h26 M1085 74 h26" />
			<path d="M1111 44 h18 M1111 74 h18" />
			<path d="M1144 52 l16 8 M1138 64 l16 8" />
		</g>
		<path class="spine-title" d="M1093 46 v18 M1053 50 v14 M1118 50 v14" />
		<!-- succulent: rosette of leaves -->
		<g filter="url(#watercolor)">
			<path d="M1322 60 q-14 -6 -18 -20 q12 2 18 16z" fill="#7fae8c" />
			<path d="M1322 60 q14 -6 18 -20 q-12 2 -18 16z" fill="#6f9f80" />
			<path d="M1322 58 q-6 -14 0 -28 q6 14 0 28z" fill="#9cc6a2" />
			<path d="M1322 60 q-8 -10 -4 -22 q8 8 4 22z" fill="#86b893" />
			<path d="M1322 60 q8 -10 4 -22 q-8 8 -4 22z" fill="#5e8e71" />
		</g>
		<g filter="url(#wobble)">
			<path
				class="ink thin"
				d="M1046 30 h22 v54 M1046 30 v54 M1068 38 h17 v46 M1085 24 h26 v60 M1111 34 h18 v50 M1131 84 l26 -50 l17 9 l-22 41"
			/>
			<path class="ink thin" d="M1178 72 h78 v12 h-78z M1184 61 h68 v11 M1180 51 h74 v10 h-74z" />
			<path class="ink thin" d="M1266 50 v32 q15 4 30 0 v-32 M1266 50 q15 4 30 0" />
			<path class="ink thin" d="M1274 50 l-8 -34 M1282 50 l2 -40 M1290 50 l9 -30" />
			<path d="M1266 16 l-2 -6 M1284 10 v-6 M1299 20 l3 -5" stroke="#c4463a" stroke-width="3" stroke-linecap="round" />
			<path d="M1270 58 v20" stroke="#fff" stroke-width="2" opacity="0.7" stroke-linecap="round" />
			<path class="ink thin" d="M1304 58 h36 v7 h-36z M1306 65 l4 19 h24 l4 -19" />
			<path class="ink hair" d="M1322 58 q-6 -14 0 -28 q6 14 0 28 M1322 60 q-14 -6 -18 -20 M1322 60 q14 -6 18 -20" />
		</g>
	</g>

	<!-- ============================================================ left margin -->
	<!-- coffee-stained diagram, under the grid sheet -->
	<g transform="rotate(8 110 520)">
		<path d="M-6 430 h220 v176 h-220z" transform="translate(7 9)" class="drop" filter="url(#soft)" />
		<g filter="url(#paper-tex)">
			<path d="M-6 430 h220 v176 h-220z" class="sheet" />
		</g>
		<rect x="-6" y="430" width="220" height="176" fill="url(#lined)" opacity="0.8" />
		<!-- coffee stain: an open ring with a pale bloom -->
		<g filter="url(#watercolor)">
			<circle cx="168" cy="460" r="30" fill="#b67b47" opacity="0.18" />
			<path d="M140 470 a30 30 0 1 1 50 18" stroke="#8c5428" stroke-width="5" fill="none" opacity="0.45" />
			<rect x="30" y="546" width="54" height="36" fill="#a9c6d8" opacity="0.55" />
		</g>
		<g filter="url(#wobble)">
			<path class="pencil" d="M14 456 h110 M14 474 h126 M14 492 h90" />
			<circle cx="56" cy="562" r="24" class="ink thin" />
			<circle cx="150" cy="562" r="24" class="ink thin" />
			<path class="ink thin" d="M80 562 h44 M118 556 l8 6 l-8 6" />
			<path class="ink strike" d="M14 528 l184 64 M14 592 l184 -64" />
			<path class="ink thin" d="M-6 430 h220 v176 h-220z" />
		</g>
		<text x="22" y="604" class="scrawl">v1?? no</text>
	</g>

	<!-- grid sheet with a sketched curve, taped down, corner curling up -->
	<g transform="rotate(-11 110 330)">
		<path d="M16 254 h196 v136 l-22 22 h-174z" transform="translate(8 10)" class="drop" filter="url(#soft)" />
		<g filter="url(#paper-tex)">
			<path d="M16 254 h196 v136 l-22 22 h-174z" class="sheet cool" />
		</g>
		<path d="M16 254 h196 v136 l-22 22 h-174z" fill="url(#grid)" />
		<path d="M212 390 l-22 22 q4 -18 22 -22z" fill="url(#curl)" />
		<path d="M190 412 l22 -22 q-6 14 -22 22z" fill="#3a2414" opacity="0.18" />
		<g filter="url(#watercolor)">
			<path d="M40 380 q30 -90 60 -40 t60 -60 V380z" fill="#e9c27a" opacity="0.45" />
		</g>
		<g filter="url(#wobble)">
			<path class="ink thin" d="M36 268 V384 H198" />
			<path class="ink" d="M40 380 q30 -90 60 -40 t60 -60" />
			<path class="ink hair" d="M100 340 v44 M160 280 v104" stroke-dasharray="3 4" />
			<path class="pencil" d="M54 278 h70" />
			<path class="ink thin" d="M16 254 h196 v136 l-22 22 h-174z M212 390 l-22 22 q4 -18 22 -22" />
		</g>
		<path d="M90 246 l46 2 l1 4 l-2 3 l2 4 l-46 -2 l-1 -4 l2 -3z" class="washi butter" />
		<!-- paperclip on the left edge -->
		<path class="clip" d="M30 300 v-44 a7 7 0 0 1 14 0 v38 a4.5 4.5 0 0 1 -9 0 v-32" />
	</g>

	<!-- mug, with the old coffee ring it keeps landing in -->
	<ellipse cx="74" cy="782" rx="40" ry="14" class="ring" filter="url(#watercolor)" />
	<g>
		<ellipse cx="160" cy="772" rx="50" ry="14" class="drop" filter="url(#soft)" transform="translate(12 4)" />
		<path d="M118 702 v60 q34 16 68 0 v-60z" fill="url(#mug-body)" />
		<path d="M168 704 v62 q10 -2 18 -6 v-58z" fill="url(#hatch)" opacity="0.4" />
		<!-- handle on the far side, away from the book -->
		<path d="M118 716 q-30 2 -28 24 q2 20 30 18" fill="none" stroke="#d6cab0" stroke-width="10" stroke-linecap="round" />
		<path d="M116 721 q-20 3 -18 19" fill="none" stroke="#fbf7ec" stroke-width="2.5" stroke-linecap="round" />
		<ellipse cx="152" cy="702" rx="34" ry="10" fill="#f7f2e6" />
		<ellipse cx="152" cy="704" rx="29" ry="7.5" fill="url(#coffee)" />
		<path d="M136 703 q8 -4 18 -3" stroke="#a87249" stroke-width="2" fill="none" opacity="0.8" stroke-linecap="round" />
		<path d="M126 712 v42" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.7" />
		<!-- doodle: a little sun -->
		<g filter="url(#watercolor)">
			<circle cx="154" cy="734" r="7" fill="#e9a843" />
		</g>
		<g filter="url(#wobble)">
			<path class="ink hair" d="M154 722 v-4 M154 746 v4 M142 734 h-4 M166 734 h4 M146 726 l-3 -3 M162 742 l3 3 M162 726 l3 -3 M146 742 l-3 3" />
			<path class="ink" d="M118 702 v60 q34 16 68 0 v-60" />
			<ellipse cx="152" cy="702" rx="34" ry="10" class="ink thin" />
			<path class="ink thin" d="M113 714 q-28 2 -28 26 q2 24 33 22 M120 722 q-22 2 -21 18 q2 14 21 13" />
			<path class="ink heavy" d="M186 702 v60 q-10 6 -20 8" />
		</g>
	</g>

	<!-- pencil: hex facets, ferrule, eraser, sharpened tip -->
	<g transform="translate(-10 -56) rotate(-20 140 668)">
		<rect x="30" y="676" width="200" height="8" rx="4" class="drop" filter="url(#soft)" transform="translate(4 8)" />
		<rect x="44" y="660" width="166" height="5" fill="#f6cf62" />
		<rect x="44" y="665" width="166" height="5" fill="#e9b543" />
		<rect x="44" y="670" width="166" height="5" fill="#c78d24" />
		<rect x="44" y="670" width="166" height="5" fill="url(#hatch)" opacity="0.35" />
		<path d="M44 665 H210 M44 670 H210" stroke="#a87418" stroke-width="0.8" />
		<rect x="22" y="660" width="22" height="15" fill="url(#ferrule)" />
		<path d="M27 660 v15 M32 660 v15 M37 660 v15" stroke="#7b7566" stroke-width="1" />
		<path d="M10 662 q-2 5.5 0 11 h12 v-15 z" fill="#e48b94" />
		<path d="M12 664 h8" stroke="#f9c5ca" stroke-width="1.5" />
		<path d="M210 660 l26 6.2 v2.6 l-26 6.2z" fill="#e8cfa1" />
		<path d="M210 670 l26 -1.2 l-26 6.2z" fill="#c9a874" />
		<path d="M230 665.2 l10 2.3 l-10 2.3z" fill="#3a3a3a" />
		<g filter="url(#wobble)">
			<path class="ink thin" d="M10 662 q-2 5.5 0 11 h200 l30 -5.5 l-30 -5.5z M22 660 v15 M44 660 v15 M210 660 v15" />
			<path class="ink thin" d="M10 660 H210" />
		</g>
		<text x="70" y="669.5" class="pencil-mark">HB</text>
	</g>
	<!-- eraser crumbs and a loose paperclip -->
	<g class="crumbs" transform="translate(-10 -56)">
		<path d="M28 704 q3 -2 5 1 q-2 3 -5 -1z M40 714 q2 -2 4 0 q-1 3 -4 0z M22 720 q3 -1 4 2 q-3 2 -4 -2z M48 700 q2 -1 3 1 q-2 2 -3 -1z" />
	</g>
	<path class="clip" d="M236 790 l-36 18 a6 6 0 0 0 5 11 l32 -16 a4 4 0 0 0 -4 -7 l-26 13" transform="rotate(-14 216 800)" />

	<!-- keyboard corner, poking in from the left edge -->
	<g transform="rotate(-6 100 860)">
		<path d="M-60 784 h276 q10 0 10 10 v128 q0 10 -10 10 h-276z" transform="translate(8 12)" class="drop" filter="url(#soft)" />
		<path d="M-60 784 h276 q10 0 10 10 v128 q0 10 -10 10 h-276z" fill="#8a8173" />
		<path d="M-60 924 h276 q10 0 10 -10 v8 q0 10 -10 10 h-276z" fill="#5d5548" />
		<path d="M-60 786 h274" stroke="#b9b0a0" stroke-width="2" />
		{#each keyRows as row, r (r)}
			{#each row.keys as x, k (k)}
				{@const accent = accentKeys.has(`${r}-${k}`)}
				<rect x={x} y={row.y} width="32" height="32" rx="4" fill={accent ? '#a34f3c' : '#b8ab92'} />
				<rect x={x + 3} y={row.y + 2} width="26" height="23" rx="3" fill={accent ? '#cf7058' : '#efe6d2'} />
				<path d="M{x + 6} {row.y + 5} h14" stroke={accent ? '#f2b19c' : '#fffaf0'} stroke-width="2" stroke-linecap="round" />
			{/each}
		{/each}
		<g filter="url(#wobble)">
			{#each keyRows as row, r (r)}
				{#each row.keys as x, k (k)}
					<rect x={x} y={row.y} width="32" height="32" rx="4" class="ink hair" />
				{/each}
			{/each}
			<path class="ink" d="M-60 784 h276 q10 0 10 10 v128 q0 10 -10 10 h-276" />
		</g>
	</g>

	<!-- ============================================================ right margin -->
	<!-- energy drink: cylinder shading, highlight strip, pull tab, condensation -->
	<g transform="translate(1420 298)">
		<ellipse cx="34" cy="104" rx="36" ry="9" class="drop" filter="url(#soft)" />
		<path d="M0 14 v84 a24 6 0 0 0 48 0 v-84z" fill="url(#can-body)" />
		<path d="M0 40 h48 v24 h-48z" fill="#e5e8ec" />
		<path d="M0 40 h48 v24 h-48z" fill="url(#can-metal)" opacity="0.55" />
		<path d="M20 42 l9 0 l-6 9 h7 l-12 12 l4 -10 h-6z" fill="#e2b12c" />
		<path d="M36 14 v84 a24 6 0 0 0 12 -5 v-79z" fill="url(#hatch)" opacity="0.45" />
		<path d="M10 20 v70" stroke="#e6f1ff" stroke-width="3.5" stroke-linecap="round" opacity="0.85" />
		<!-- shoulder and lid -->
		<path d="M0 14 q2 -8 6 -9 h36 q4 1 6 9z" fill="url(#can-metal)" />
		<ellipse cx="24" cy="5" rx="18" ry="4.5" fill="#d3d8de" />
		<ellipse cx="24" cy="5" rx="14" ry="3" fill="#b2b9c2" />
		<path d="M18 4 q6 -4 12 0 q-6 3 -12 0z" fill="#e8ebee" stroke="#6e747d" stroke-width="1" />
		<circle cx="24" cy="4" r="1.3" fill="#6e747d" />
		<g class="drops">
			<circle cx="31" cy="24" r="1.6" /><circle cx="18" cy="32" r="1.2" /><circle cx="40" cy="74" r="1.5" />
			<circle cx="27" cy="82" r="1.1" /><circle cx="16" cy="72" r="1.4" /><circle cx="33" cy="90" r="1.2" />
		</g>
		<g filter="url(#wobble)">
			<path class="ink" d="M0 14 v84 a24 6 0 0 0 48 0 v-84" />
			<path class="ink thin" d="M0 14 q2 -8 6 -9 h36 q4 1 6 9 M0 40 h48 M0 64 h48" />
			<path class="ink heavy" d="M48 14 v84 a24 6 0 0 1 -14 5.5" />
		</g>
	</g>

	<!-- rubber duck, for debugging -->
	<g transform="translate(1418 438)">
		<ellipse cx="44" cy="74" rx="40" ry="9" class="drop" filter="url(#soft)" />
		<path d="M4 46 q-2 28 34 30 q34 2 40 -26 q-6 -10 -20 -8 q-8 -10 -20 -10 q-26 0 -34 14z" fill="url(#duck-body)" />
		<circle cx="28" cy="26" r="20" fill="url(#duck-body)" />
		<path d="M48 54 q12 12 26 -2 q-6 18 -30 18z" fill="url(#hatch)" opacity="0.4" />
		<path d="M8 28 q-12 2 -14 8 q8 4 16 0z" fill="#ef8a3a" />
		<path d="M-6 36 q8 3 16 0" stroke="#c4651e" stroke-width="1.5" fill="none" />
		<circle cx="22" cy="21" r="2.8" fill="#2a2018" />
		<circle cx="21" cy="20" r="0.9" fill="#fff" />
		<path d="M30 54 q10 6 20 2" stroke="#e0a524" stroke-width="2" fill="none" stroke-linecap="round" />
		<path d="M20 12 q6 -4 12 -2" stroke="#fffbe0" stroke-width="3" fill="none" stroke-linecap="round" />
		<g filter="url(#wobble)">
			<path class="ink thin" d="M8 28 q-12 2 -14 8 q8 4 16 0" />
			<path class="ink" d="M10 38 q-8 6 -6 8 q-2 28 34 30 q34 2 40 -26 q-6 -10 -20 -8 q-6 -8 -16 -10" />
			<path class="ink" d="M44 30 a20 20 0 1 0 -32 -12" />
			<path class="ink heavy" d="M78 50 q-6 26 -40 26" />
		</g>
	</g>

	<!-- sticky todo, slightly lifted at the bottom edge -->
	<g transform="rotate(7 1490 690)">
		<path d="M1424 636 h130 v112 q-60 8 -130 4z" transform="translate(5 8)" class="drop" filter="url(#soft)" />
		<g filter="url(#watercolor)">
			<path d="M1424 636 h130 v112 q-60 8 -130 4z" fill="#f6df7d" />
			<rect x="1424" y="636" width="130" height="18" fill="#e7c95b" opacity="0.7" />
			<path d="M1424 748 q60 6 130 0 v-14 q-66 8 -130 2z" fill="#e2c255" opacity="0.6" />
		</g>
		<text x="1436" y="672" class="scrawl">todo:</text>
		<text x="1436" y="700" class="scrawl">fix step-over</text>
		<path class="ink thin strike" d="M1434 695 h104" />
		<text x="1436" y="728" class="scrawl">sleep?</text>
		<path class="ink thin" d="M1424 636 h130 v112 q-60 8 -130 4z" filter="url(#wobble)" />
	</g>

	<!-- breadboard: board thickness, hole grid, rails, LED, resistor, jumpers -->
	<g transform="rotate(-7 1500 870)">
		<path d="M1406 814 h196 v114 h-196z" transform="translate(6 10)" class="drop" filter="url(#soft)" />
		<path d="M1406 922 h196 v8 h-196z" fill="#cfc8b6" />
		<rect x="1406" y="814" width="196" height="110" rx="4" fill="#f4f1e8" />
		<rect x="1406" y="871" width="196" height="5" fill="#e3ddcd" />
		<path class="rail red" d="M1414 824 h180 M1414 916 h180" />
		<path class="rail blue" d="M1414 830 h180 M1414 922 h180" transform="translate(0 -2)" />
		<g class="hole">
			{#each holeRows as y (y)}
				{#each holeCols as x (x)}
					<rect x={x} y={y} width="3" height="3" />
				{/each}
			{/each}
		</g>
		<!-- resistor with colour bands -->
		<path d="M1446 860 h10 M1484 860 h10" stroke="#9aa0a6" stroke-width="2" />
		<rect x="1456" y="855" width="28" height="10" rx="5" fill="#d8b98a" />
		<path d="M1462 855 v10 M1467 855 v10 M1472 855 v10" stroke-width="3" stroke="#8a4b2a" />
		<path d="M1467 855 v10" stroke="#2a2a2a" stroke-width="3" />
		<path d="M1478 855 v10" stroke="#c9a33d" stroke-width="2" />
		<!-- LED -->
		<path d="M1528 866 v-12 M1534 866 v-12" stroke="#9aa0a6" stroke-width="2" />
		<path d="M1524 856 v-10 a7 7 0 0 1 14 0 v10z" fill="#e5654f" />
		<path d="M1527 846 a4 4 0 0 1 4 -4" stroke="#ffd0c4" stroke-width="2" fill="none" stroke-linecap="round" />
		<!-- chip -->
		<rect x="1546" y="862" width="40" height="22" rx="2" fill="#3a3632" />
		<path d="M1550 862 v-3 M1558 862 v-3 M1566 862 v-3 M1574 862 v-3 M1582 862 v-3 M1550 884 v3 M1558 884 v3 M1566 884 v3 M1574 884 v3 M1582 884 v3" stroke="#a7a39a" stroke-width="2" />
		<circle cx="1551" cy="867" r="1.6" fill="#77716a" />
		<!-- jumper wires with highlights -->
		<path class="wire red" d="M1428 840 q30 -50 70 -6" />
		<path class="wire-shine" d="M1436 830 q20 -26 40 -24" />
		<path class="wire blue" d="M1478 896 q40 40 84 -2" />
		<path class="wire-shine" d="M1490 908 q22 14 46 4" />
		<g filter="url(#wobble)">
			<path class="ink thin" d="M1406 818 a4 4 0 0 1 4 -4 h188 a4 4 0 0 1 4 4 v112 h-196z M1406 924 h196" />
			<path class="ink hair" d="M1456 855 h28 v10 h-28z M1524 856 v-10 a7 7 0 0 1 14 0 v10z M1546 862 h40 v22 h-40z" />
		</g>
	</g>
	<path class="wire yellow" d="M1424 836 C1392 800 1380 770 1396 740 C1404 726 1416 760 1430 770" />
	<!-- screws -->
	{#each [[1386, 792, 20], [1372, 812, 75]] as [x, y, a], i (i)}
		<g transform="rotate({a} {x} {y})">
			<path d="M{x - 4} {y} h14" stroke="#7e8288" stroke-width="3.5" stroke-linecap="round" />
			<path d="M{x - 2} {y - 2} l2 4 M{x + 2} {y - 2} l2 4 M{x + 6} {y - 2} l2 4" stroke="#55595e" stroke-width="1" />
			<circle cx={x - 6} cy={y} r="4" fill="#a9adb3" />
			<path d="M{x - 8.5} {y} h5" stroke="#4b4f54" stroke-width="1.3" />
		</g>
	{/each}

	<!-- USB-C cable, loosely coiled in the corner -->
	<g>
		<path class="usb" d="M1480 1010 C1420 990 1380 960 1404 940 C1430 920 1480 936 1470 960 C1460 984 1400 976 1392 950 C1386 930 1420 912 1452 924 C1476 934 1486 950 1470 966 L1440 978" />
		<path class="usb-shine" d="M1408 942 C1430 926 1466 934 1468 952" />
		<rect x="1412" y="972" width="30" height="12" rx="5" transform="rotate(-20 1426 978)" fill="#e9e6df" stroke="#3b2a20" stroke-width="1.5" />
		<rect x="1398" y="978" width="14" height="7" rx="3" transform="rotate(-20 1426 978)" fill="#a9adb3" stroke="#3b2a20" stroke-width="1.2" />
	</g>
</svg>

<!-- moving parts; no filters, so the browser can animate them cheaply -->
<svg class="room-art room-details room-motion" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
	<g class="day motes">
		{#each motes as m, i (i)}
			<circle cx={m.x} cy={m.y} r={m.r} style="animation-delay: {m.d}s" />
		{/each}
	</g>
	<g class="steam">
		<path d="M140 692 c-6 -8 6 -14 0 -20 s6 -14 0 -20" />
		<path d="M155 690 c-6 -8 6 -14 0 -20 s6 -14 0 -20" />
		<path d="M169 693 c-6 -8 6 -14 0 -20 s6 -14 0 -20" />
	</g>
</svg>
