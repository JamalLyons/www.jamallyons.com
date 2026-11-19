<script lang="ts">
	// Arrows are measured from the highlighted fields, so they connect the right lines at
	// any page width (spread, phone, plain view).
	import { onMount } from 'svelte';
	import ProjectHeader from '../ProjectHeader.svelte';

	const fields = ['text', 'priority', 'tag', 'done'];
	let fig = $state<HTMLElement>();
	let arrows = $state<{ d: string; head: string; dot: string }[]>([]);
	let size = $state({ w: 0, h: 0 });

	function measure() {
		if (!fig) return;
		const box = fig.getBoundingClientRect();
		if (!box.width) return;
		// Undo the page's own scale (a turning leaf) so coordinates stay in layout pixels.
		const k = fig.offsetWidth / box.width || 1;
		size = { w: fig.offsetWidth, h: fig.offsetHeight };
		const schema = fig.querySelector('.schema')!.getBoundingClientRect();
		const rust = fig.querySelector('.rust')!.getBoundingClientRect();
		// Narrow pages stack the cards; the arrows then loop through the left margin.
		const stacked = rust.top >= schema.bottom - 4;
		const X = (v: number) => (v - box.left) * k;
		const Y = (r: DOMRect) => (r.top + r.height / 2 - box.top) * k;
		arrows = fields.flatMap((f, i) => {
			const from = fig!.querySelector(`.schema .f-${f}`)?.getBoundingClientRect();
			const to = fig!.querySelector(`.rust .f-${f}`)?.getBoundingClientRect();
			if (!from || !to) return [];
			const y1 = Y(from);
			const y2 = Y(to);
			if (stacked) {
				const x1 = X(schema.left) - 2;
				const x2 = X(rust.left) - 3;
				const out = Math.max(4, x1 - 8 - i * 10);
				return [
					{
						dot: dotAt(x1 + 3, y1),
						d: `M${x1} ${y1} C${out} ${y1}, ${out} ${y2}, ${x2} ${y2}`,
						head: `M${x2 - 6} ${y2 - 4} L${x2} ${y2} L${x2 - 6} ${y2 + 4}`
					}
				];
			}
			const x1 = X(schema.right) + 3;
			const x2 = X(to.left) - 3;
			const c = Math.max(18, (x2 - x1) * 0.5);
			return [
				{
					dot: dotAt(x1 - 3, y1),
					d: `M${x1} ${y1} C${x1 + c} ${y1}, ${x2 - c} ${y2}, ${x2} ${y2}`,
					head: `M${x2 - 6} ${y2 - 4} L${x2} ${y2} L${x2 - 6} ${y2 + 4}`
				}
			];
		});
	}

	const dotAt = (x: number, y: number) => `M${x - 2.2} ${y} a2.2 2.2 0 1 0 4.4 0 a2.2 2.2 0 1 0 -4.4 0`;

	onMount(() => {
		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(fig!);
		document.fonts?.ready.then(measure);
		return () => ro.disconnect();
	});
</script>

<ProjectHeader slug="convex-typegen" />

<!-- Verified against examples/basic in the repo: its schema.ts and the struct build.rs generates. -->
<figure class="sketch-figure typegen" bind:this={fig}>
	<div class="tg-grid">
		<pre class="code-card schema" aria-label="Convex schema for the notes table"><span class="cc-file">convex/schema.ts</span>notes: defineTable({"{"}
 <span class="f-text">text</span>: v.string(),
 <span class="f-priority">priority</span>: v.nullable(
   v.union(v.literal("low"),
     v.literal("normal"),
     v.literal("high"))),
 <span class="f-tag">tag</span>: v.optional(v.string()),
 <span class="f-done">done</span>: v.boolean(),
{"}"})</pre>
		<pre class="code-card rust" aria-label="Rust struct generated from it"><span class="cc-file">generated Rust</span>pub struct NotesDoc {"{"}
 pub _id: Id&lt;tables::Notes&gt;,
 pub <span class="f-done">done</span>: bool,
 pub <span class="f-priority">priority</span>:
   Option&lt;NotesDocPriority&gt;,
 pub <span class="f-tag">tag</span>: Option&lt;String&gt;,
 pub <span class="f-text">text</span>: String,
 …
{"}"}</pre>
	</div>
	{#if arrows.length}
		<svg class="tg-arrows" viewBox="0 0 {size.w} {size.h}" aria-hidden="true">
			{#each arrows as a, i (i)}
				<path class="tg-dot" d={a.dot} />
				<path class="tg-line" d={a.d} />
				<path class="tg-head" d={a.head} />
			{/each}
		</svg>
	{/if}
	<ul class="tg-notes margin-note">
		<li><code>v.nullable</code> → <code>Option</code>; the three literals become an enum</li>
		<li><code>v.optional</code> → <code>Option</code> too: the key may be missing</li>
	</ul>
	<figcaption class="sr-only">
		Each schema field maps to a typed Rust field: text to String, priority to an optional enum, tag to an optional
		String, done to bool.
	</figcaption>
</figure>

<div class="prose">
	<p>
		Convex gives TypeScript developers end-to-end types for free. I wanted the same in Rust. Convex Typegen reads
		your schema and function signatures at build time and turns them into Rust types.
	</p>
	<p>A wrong table, field, argument, or return type becomes a compile error instead of a runtime bug.</p>
</div>

<style>
	.typegen {
		position: relative;
	}
	.typegen .tg-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 12%;
		align-items: start;
	}
	.typegen .code-card {
		font-size: calc(var(--fs) * 0.62);
		padding: 0.55em 0.6em;
		overflow: hidden;
	}
	.typegen .schema {
		transform: rotate(-1.2deg);
	}
	.typegen .rust {
		transform: rotate(1deg) translateY(0.8em);
	}
	.typegen .f-text {
		background: color-mix(in oklab, var(--highlight) 90%, transparent);
	}
	.typegen .f-priority {
		background: rgb(180 214 255 / 0.9);
	}
	.typegen .f-tag {
		background: rgb(198 232 190 / 0.95);
	}
	.typegen .f-done {
		background: rgb(255 196 190 / 0.9);
	}
	.tg-arrows {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		overflow: visible;
	}
	.tg-arrows path {
		fill: none;
		stroke: var(--red-pen);
		stroke-width: 1.5;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.tg-arrows .tg-line {
		stroke-dasharray: 4 3;
	}
	.tg-arrows .tg-dot {
		fill: var(--red-pen);
		stroke: none;
	}
	/* Narrow pages: stack the two cards; the highlight colours pair the fields. */
	@container page (max-width: 430px) {
		.typegen .tg-grid {
			grid-template-columns: minmax(0, 1fr);
			gap: 0.9em;
			padding-left: 46px;
		}
		.typegen .rust {
			transform: rotate(0.8deg);
			margin-right: 6%;
		}
		.typegen .code-card {
			font-size: calc(var(--fs) * 0.7);
		}
	}
	.tg-notes {
		list-style: none;
		padding: 0;
		margin-top: 0.9em !important;
		font-size: calc(var(--fs) * 1.15);
	}
	.tg-notes li + li {
		margin-top: 0.15em;
	}
</style>
