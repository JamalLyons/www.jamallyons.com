<h2 class="hand-title">dotfile-sync</h2>
<p class="project-sub">
	a Mac, set up from one repo · <a href="https://github.com/JamalLyons/dotfile-sync" target="_blank" rel="noopener"
		>github.com/JamalLyons/dotfile-sync ↗</a
	>
</p>

<figure class="sketch-figure">
	<svg class="sketch" viewBox="0 0 300 110" role="img" aria-label="Sketch: the same Mac before setup, with an empty dock, and after, with apps, a Fish shell, and editor settings">
		<g class="ink" fill="none">
			<rect x="8" y="10" width="110" height="70" rx="5" />
			<path d="M50 80 v10 M76 80 v10 M40 92 h46" />
			<rect x="36" y="64" width="54" height="8" rx="3" />
			<path d="M128 44 q20 -10 40 0" />
			<path d="M162 39 l7 5 l-8 4" />
			<rect x="180" y="10" width="110" height="70" rx="5" />
			<path d="M222 80 v10 M248 80 v10 M212 92 h46" />
			<rect x="198" y="64" width="74" height="8" rx="3" />
			<path d="M204 68 h4 M214 68 h4 M224 68 h4 M234 68 h4 M244 68 h4 M254 68 h4 M264 68 h4" />
			<rect x="190" y="20" width="56" height="34" rx="2" />
		</g>
		<g class="pencil-text">
			<text x="38" y="44">fresh Mac</text>
			<text x="194" y="34">&gt; fish</text>
			<text x="194" y="46">  ready_</text>
			<text x="140" y="34">plan</text>
		</g>
	</svg>
</figure>

<pre class="code-card plan-card" aria-label="Example dotfilesync plan output">$ dotfilesync plan
Plan p-… (profile base)
[low] [irrev] [brew] brew install fish
[medium] [irrev] [brew] brew install --cask zed
[medium] [rev] [copy] copy ~/dotfiles/fish/config.fish -&gt; ~/.config/fish/config.fish
[high] [rev] [shell] set login shell to /opt/homebrew/bin/fish

4 actions: low 1, medium 2, high 1; reversible 2, irreversible 2</pre>
<p class="margin-note plan-note">nothing has changed yet. <code>apply</code> asks first, then Touch ID</p>

<div class="prose">
	<p>
		dotfile-sync installs my Homebrew apps, Fish shell, and editor settings from one repo. It compares the Mac with
		the list, shows exactly what it would do, and only acts after I say yes. Every file it replaces is backed up
		first.
	</p>
</div>
