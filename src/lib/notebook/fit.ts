// Shrinks a notebook page's type just enough that its content fits the paper, so pages
// on a short desktop window never scroll inside the book. Every size on the page derives
// from --fs, so scaling that one property scales headings, rules and figures together.
// Below MIN_SCALE the page keeps its natural size and scrolls instead: tiny type is worse.

const MIN_SCALE = 0.78;

function fit(paper: HTMLElement) {
	const inner = paper.querySelector<HTMLElement>('.paper-inner');
	if (!inner || getComputedStyle(inner).position !== 'absolute') {
		paper.style.removeProperty('--fs');
		return;
	}
	paper.style.removeProperty('--fs');
	const base = parseFloat(getComputedStyle(paper).fontSize);
	const overflows = () => inner.scrollHeight > inner.clientHeight + 1;
	if (!base || !overflows()) return;

	let lo = MIN_SCALE;
	let hi = 1;
	paper.style.setProperty('--fs', `${base * lo}px`);
	if (overflows()) {
		paper.style.removeProperty('--fs');
		return;
	}
	for (let i = 0; i < 6; i++) {
		const mid = (lo + hi) / 2;
		paper.style.setProperty('--fs', `${base * mid}px`);
		if (overflows()) hi = mid;
		else lo = mid;
	}
	paper.style.setProperty('--fs', `${(base * lo).toFixed(2)}px`);
}

/** Svelte attachment: keeps the page fitted through resizes and late font loads. */
export function fitPage(paper: HTMLElement) {
	let frame = 0;
	const schedule = () => {
		cancelAnimationFrame(frame);
		frame = requestAnimationFrame(() => fit(paper));
	};
	fit(paper);
	const ro = new ResizeObserver(schedule);
	ro.observe(paper);
	document.fonts?.ready.then(schedule);
	return () => {
		cancelAnimationFrame(frame);
		ro.disconnect();
	};
}
