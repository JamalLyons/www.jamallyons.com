import type { Handle } from '@sveltejs/kit/hooks';
import overridesSource from '#lib/lighting/overrides.js?raw';
import sunSource from '#lib/lighting/sun.js?raw';

// Runs before first paint: picks the Atlanta lighting and the saved reading view, so the
// prerendered page never flashes the wrong room. Same source the client module imports.
const strip = (src: string) => src.replace(/^export /gm, '');
const boot = `(function(){${strip(sunSource)}
${strip(overridesSource)}
var o=overrides(location.search),h=document.documentElement;
h.classList.add('js');
h.dataset.light=o.force||lightAt(Date.now()+o.offset).state;
try{if(localStorage.getItem('notebook:view')==='plain')h.dataset.view='plain'}catch(e){}
})();`;

export const handle: Handle = ({ event, resolve }) =>
	resolve(event, {
		transformPageChunk: ({ html }) => html.replace('<!--boot-->', `<script>${boot}</script>`)
	});
