export const site = {
	name: 'Jamal Lyons',
	role: 'Computer Science Student @ Georgia State University',
	url: 'https://jamallyons.com',
	email: 'codingwithjamal@outlook.com',
	description:
		'Portfolio of Jamal Lyons, a Computer Science student at Georgia State University passionate about backend architecture, systems programming, and open source.',
	shortDescription: 'Computer Science student at Georgia State University building backend systems and open source tools.',
	twitter: '@codingwithjamal'
};

export const links = [
	{ label: 'GitHub', href: 'https://github.com/jamallyons' },
	{ label: 'LinkedIn', href: 'https://www.linkedin.com/in/codingwithjamal/' },
	{ label: 'X', href: 'https://x.com/codingwithjamal' },
	{ label: 'YouTube', href: 'https://www.youtube.com/@codingwithjamal' },
	{ label: 'ClarityText', href: 'https://www.claritytext.com/u/jamallyons' },
	{ label: 'Sponsor', href: 'https://github.com/sponsors/JamalLyons' }
];

export const projects = [
	{
		name: 'Ferros',
		href: 'https://github.com/JamalLyons/ferros',
		description:
			"A Rust-native debugger built from the ground up to understand Rust's ownership, lifetimes, and memory model.",
		tags: ['Rust', 'Debugger', 'Systems']
	},
	{
		name: 'Phoenix Language',
		href: 'https://github.com/phoenix-language/phoenix',
		description: 'A statically typed systems language that compiles to portable bytecode and runs on the Phoenix VM.',
		tags: ['Rust', 'Compiler', 'VM']
	},
	{
		name: 'Phoenix Music Player',
		href: 'https://phoenix.jamallyons.com/',
		description:
			'A calm, local-first desktop music player for the music you own. No streaming, no subscriptions. Library, playlists, tagging, and a 10-band EQ.',
		tags: ['Desktop', 'Audio', 'Local-first']
	},
	{
		name: 'Convex Typegen',
		href: 'https://github.com/JamalLyons/convex-typegen',
		description: 'End-to-end type safety for Convex in Rust. Generates Rust types straight from your Convex schema.',
		tags: ['Rust', 'Convex', 'Codegen']
	},
	{
		name: 'dotfile-sync',
		href: 'https://github.com/JamalLyons/dotfile-sync',
		description:
			'Set up a Mac for coding from one repo: Homebrew apps, Fish shell, and editor settings, with a preview of every change before it happens.',
		tags: ['Swift', 'macOS', 'CLI']
	},
	{
		name: 'Agent Skills',
		href: 'https://github.com/JamalLyons/Agent-Skills',
		description: 'A shared collection of Agent Skills for Claude Code, Codex, Cursor, and Gemini CLI. Edit once, use across agents.',
		tags: ['AI', 'Agents', 'DX']
	},
	{
		name: 'Type Fetch',
		href: 'https://github.com/jamallyons/type-fetch',
		description: 'A lightweight, zero-dependency HTTP client for type-safe API requests in JavaScript/TypeScript.',
		tags: ['TypeScript', 'HTTP', 'npm']
	}
];

export const articles = [
	{
		title: 'Transactional Email in Convex with Bluefox and AWS SES',
		date: '2025-04-23',
		readTime: '15 min read',
		summary:
			"Bluefox is a modern email API built on top of Amazon SES, designed for developers and SaaS teams. Whether you're sending transactional emails or integrating real-time webhooks in a serverless Convex backend, Bluefox simplifies the process.",
		tags: ['Convex', 'Email', 'AWS', 'Backend'],
		href: 'https://dev.to/convexchampions/transactional-email-in-convex-with-bluefox-and-aws-ses-4kpc'
	},
	{
		title: 'Authentication Best Practices: Convex, Clerk and Next.js',
		date: '2025-03-06',
		readTime: '25 min read',
		summary:
			"Authentication is the backbone of any full-stack application, but it's also one of the easiest places to introduce subtle, hard-to-debug security flaws, especially when scaling an app to a global audience.",
		tags: ['Authentication', 'Convex', 'Clerk', 'Next.js', 'Security'],
		href: 'https://dev.to/convexchampions/authentication-best-practices-convex-clerk-and-nextjs-21ag'
	},
	{
		title: 'Building Type-Safe Rust Applications with Convex',
		date: '2024-12-09',
		readTime: '15 min read',
		summary:
			"Convex offers a unique combination of developer experience, serverless functions, and real-time subscriptions, and under the hood it's powered by Rust. Here's how to get end-to-end type safety from Rust with Convex Typegen.",
		tags: ['Rust', 'Convex', 'TypeScript', 'Backend'],
		href: 'https://dev.to/convexchampions/building-type-safe-rust-applications-with-convex-introducing-convex-typegen-1g38'
	}
];
