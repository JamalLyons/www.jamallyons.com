<h2 class="hand-title">Problems I like</h2>

<p class="prose-lead">The ones that sit below the interface, where speed and reliability get decided.</p>

<ul class="checklist">
	<li>
		<strong>Real-time servers.</strong> Keeping many connected clients in sync, and notification systems that
		reach people the moment something happens.
	</li>
	<li><strong>APIs.</strong> Designing interfaces that are efficient and hard to misuse.</li>
	<li><strong>Data flow.</strong> Finding where time goes between a request and a response, and cutting it.</li>
	<li>
		<strong>Low-level code.</strong> Networking, memory, and performance. Understanding what really makes computers
		tick.
	</li>
	<li><strong>Developer tools.</strong> Type safety, debuggers, and setup scripts that remove whole kinds of bugs.</li>
</ul>

<svg class="sketch workbench-sketch" viewBox="0 0 260 90" role="img" aria-label="Sketch: a request timeline with the slow part crossed out and redrawn shorter">
	<g class="ink" fill="none">
		<path d="M10 30 h240" />
		<path d="M10 24 v12 M250 24 v12" />
		<path d="M70 22 h110" class="thick" />
		<path class="strike" d="M68 14 l116 18 M68 32 l116 -18" />
		<path d="M10 66 h150" />
		<path d="M10 60 v12 M160 60 v12" />
		<path d="M70 58 h30" class="thick" />
	</g>
	<g class="pencil-text">
		<text x="12" y="14">before</text>
		<text x="12" y="88">after</text>
		<text x="170" y="70">← faster</text>
	</g>
</svg>

<style>
	.workbench-sketch {
		margin-top: 0.8em;
		width: 88%;
	}
	.checklist {
		list-style: none;
		padding-left: 0;
	}
	.checklist li {
		position: relative;
		padding-left: 1.5em;
		margin-bottom: 0.45em;
		line-height: 1.55;
	}
	.checklist li::before {
		content: '';
		position: absolute;
		left: 0.1em;
		top: 0.35em;
		width: 0.8em;
		height: 0.8em;
		border: 1.6px solid var(--red-pen);
		border-radius: 2px 3px 2px 4px;
		transform: rotate(-4deg);
	}
</style>
