<!--
	Perimeter clutter, loaded after first paint. Same viewBox and cropping as Room.svelte,
	so every prop lines up with the base desk. Keep x 220-1380, y 150-940 clear: the book is there.
-->
<svg class="room-art room-details" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
	<g filter="url(#wobble)">
		<!-- pinned sketches on the wall -->
		<g transform="rotate(-3 470 80)">
			<rect x="400" y="20" width="150" height="112" class="scrap" />
			<circle cx="475" cy="28" r="5" class="pin" />
			<rect x="418" y="48" width="40" height="26" class="ink thin" fill="none" />
			<rect x="496" y="48" width="36" height="26" class="ink thin" fill="none" />
			<path class="ink thin" d="M458 61 h38 M490 57 l6 4 l-6 4" />
			<path class="pencil" d="M420 98 h108 M420 114 h70" />
		</g>
		<g transform="rotate(5 640 70)">
			<rect x="590" y="28" width="110" height="90" class="scrap sticky" />
			<path class="ink thin" d="M604 100 l22 -40 l20 22 l22 -44 l20 30" />
			<path class="ink thin strike" d="M600 50 l92 52" />
		</g>
		<g transform="rotate(-4 900 64)">
			<rect x="820" y="18" width="160" height="104" class="scrap grid-paper" />
			<circle cx="900" cy="26" r="5" class="pin" />
			<text x="836" y="56" class="scrawl">step → next → finish</text>
			<path class="ink thin" d="M838 78 h120 M838 96 h80" />
		</g>

		<!-- books and a jar of pens on the shelf -->
		<rect x="1060" y="28" width="20" height="56" class="book-a" />
		<rect x="1082" y="36" width="16" height="48" class="book-b" />
		<rect x="1100" y="24" width="24" height="60" class="book-c" />
		<path d="M1126 84 l28 -52 l15 8 l-26 44z" class="book-a" />
		<path class="ink thin" d="M1060 28 v56 M1080 28 v56 M1098 36 v48 M1124 24 v60" />
		<path d="M1260 50 h40 v34 h-40z" class="jar" />
		<path class="ink thin" d="M1270 50 l-6 -32 M1280 50 l2 -38 M1290 50 l8 -30" />

		<!-- left margin: loose sheets, a crossed-out diagram, coffee ring, pencil -->
		<g transform="rotate(-12 110 360)">
			<rect x="10" y="270" width="200" height="170" class="scrap grid-paper" />
			<path class="ink thin" d="M30 410 q30 -90 60 -40 t60 -60" />
			<path class="pencil" d="M30 296 h90" />
		</g>
		<g transform="rotate(9 110 560)">
			<rect x="-10" y="470" width="220" height="180" class="scrap" />
			<path class="pencil" d="M14 500 h150 M14 520 h176 M14 540 h120" />
			<circle cx="56" cy="596" r="26" class="ink thin" fill="none" />
			<circle cx="150" cy="596" r="26" class="ink thin" fill="none" />
			<path class="ink thin" d="M82 596 h42 M118 590 l8 6 l-8 6" />
			<path class="ink strike" d="M14 566 l184 64 M14 630 l184 -64" />
			<text x="30" y="644" class="scrawl">v1?? no</text>
		</g>
		<ellipse cx="110" cy="760" rx="44" ry="16" class="ring" />
		<g transform="rotate(-24 120 860)">
			<rect x="30" y="852" width="170" height="12" rx="2" class="pencil-body" />
			<path d="M200 852 l24 6 l-24 6z" class="pencil-wood" />
			<path d="M218 856.5 l6 1.5 l-6 1.5z" class="ink" />
			<rect x="16" y="852" width="16" height="12" class="eraser" />
		</g>
		<g transform="translate(150 950)">
			<path d="M0 0 l18 -22 l26 4 l12 20 l-8 22 l-28 6 l-20 -10z" class="scrap" />
			<path class="ink thin" d="M10 -10 l14 10 l20 -8 M18 12 l10 -12 l14 16" />
		</g>

		<!-- right margin: sticky todo, breadboard, cable -->
		<g transform="rotate(7 1500 690)">
			<rect x="1430" y="630" width="130" height="116" class="scrap sticky" />
			<text x="1442" y="662" class="scrawl">todo:</text>
			<text x="1442" y="690" class="scrawl">fix step-over</text>
			<path class="ink thin strike" d="M1440 685 h104" />
			<text x="1442" y="718" class="scrawl">sleep?</text>
		</g>
		<g transform="rotate(-8 1500 870)">
			<rect x="1404" y="810" width="210" height="104" rx="6" class="breadboard" />
			<g class="holes">
				{#each { length: 9 } as _, i (i)}
					<path d="M{1420 + i * 22} 830 v64" />
				{/each}
			</g>
			<path class="wire-r" d="M1430 838 q30 -60 70 -10" />
			<path class="wire-b" d="M1470 870 q40 50 90 0" />
			<rect x="1520" y="852" width="34" height="20" rx="3" class="chip" />
		</g>
		<path class="wire-y" d="M1414 840 C1380 760 1400 700 1440 640" />
		<path class="cable" d="M1520 596 C1560 660 1590 700 1610 760" />
	</g>
</svg>
