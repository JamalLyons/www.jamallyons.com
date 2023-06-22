import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/adapter-vercel').Config} */
const config = {
	kit: {
		adapter: adapter()
	}
};

export default config;
