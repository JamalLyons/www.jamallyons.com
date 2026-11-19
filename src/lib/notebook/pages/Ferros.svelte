<script lang="ts">
	import ProjectHeader from '../ProjectHeader.svelte';
</script>

<ProjectHeader slug="ferros" />

<figure class="sketch-figure">
	<svg class="sketch" viewBox="0 0 300 170" role="img" aria-label="Sketch: Ferros stopped at a breakpoint on line 9 of main.rs, before the call to add_one">
		<g class="ink" fill="none">
			<rect x="6" y="6" width="288" height="118" rx="6" />
			<path d="M6 22 h288" />
			<circle cx="16" cy="14" r="3" /><circle cx="26" cy="14" r="3" /><circle cx="36" cy="14" r="3" />
			<rect class="hl" x="30" y="78" width="258" height="14" rx="2" />
		</g>
		<circle class="bp-dot" cx="20" cy="85" r="5" />
		<g class="code-text">
			<text x="30" y="40"><tspan class="ln">6</tspan> fn main() {"{"}</text>
			<text x="30" y="56"><tspan class="ln">7</tspan>     let seed = black_box(40);</text>
			<text x="30" y="72"><tspan class="ln">8</tspan></text>
			<text x="30" y="88"><tspan class="ln">9</tspan>     let result = add_one(seed);</text>
			<text x="30" y="104"><tspan class="ln">10</tspan>    println!("result: {"{"}result{"}"}");</text>
			<text x="30" y="120"><tspan class="ln">11</tspan> {"}"}</text>
		</g>
		<g class="ink" fill="none">
			<path d="M20 92 q-6 30 20 48" />
			<path d="M36 136 l6 5 l-8 2" />
			<path d="M236 92 q10 30 -10 46" />
			<path d="M230 134 l-6 6 l-2 -8" />
		</g>
		<g class="pencil-text">
			<text x="48" y="150">breakpoint: the process is paused</text>
			<text x="48" y="164">here, before this line runs</text>
			<text x="176" y="150"> </text>
		</g>
	</svg>
	<figcaption class="margin-note">
		<code>step</code> goes into <code>add_one</code>, <code>next</code> runs it and stops on line 10
	</figcaption>
</figure>

<div class="prose">
	<p>
		Most debuggers were built for C and learned Rust later. Ferros is built from the ground up for Rust's
		ownership, lifetimes, and memory model.
	</p>
	<p>
		It runs on macOS on Apple Silicon today. It can launch or attach to a process, set breakpoints, single-step, and
		read registers and memory. The core engine has zero <code>unsafe</code> code and no OS dependencies, so other
		platforms can plug in later.
	</p>
</div>
