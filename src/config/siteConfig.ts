// Centralized configuration for all site data

export const siteConfig = {
    // Basic info
    name: "Jamal Lyons",
    title: "jamal_lyons:~$",
    role: "Backend Engineer & CS Student",
    location: "Building the future, one commit at a time",

    // Bio information
    bio: {
        intro: "I'm a Computer Science student at Georgia State University",
        description: [
            "with a growing passion for backend architecture and systems programming.",
            "I love building the invisible layers that make software feel alive —",
            "from real-time servers and notification systems to networking and",
            "performance optimizations.",
            "",
            "I'm constantly exploring how things work under the hood, whether it's",
            "designing efficient APIs, optimizing data flow, or diving into low-level",
            "code to understand what really makes computers tick. For me, development",
            "isn't just about writing code — it's about crafting systems that are",
            "fast, reliable, and built to scale.",
        ],
        status: "READY FOR NEW CHALLENGES",
    },

    // Tech stack
    stack: [
        "React.js",
        "Next.js",
        "Tailwind CSS",
        "Rust",
        "TypeScript",
        "Node.js",
        "SQL",
        "Convex",
        "Docker",
        "Bash",
    ],

    // Focus areas
    focusAreas: [
        "Performance Optimization",
        "Modern UI/UX Design",
        "Developer Experience",
        "Scalable Architecture",
        "Real-time Systems",
    ],

    // Mission quotes
    mission: [
        "Creating elegant systems that feel alive.",
        "Building tools that empower developers.",
        "Pushing the boundaries of what's possible.",
    ],

    // Social links
    social: [
        { name: "GitHub", url: "https://github.com/jamallyons" },
        { name: "LinkedIn", url: "https://linkedin.com/in/jamallyons" },
        { name: "X", url: "https://x.com/codingwithjamal" },
        { name: "ClarityText", url: "https://www.claritytext.com/u/jamallyons" },
        { name: "Youtube", url: "https://www.youtube.com/@codingwithjamal" },
        { name: "Sponsor Me", url: "https://github.com/sponsors/JamalLyons" },
    ],

    // Projects
    projects: [
        {
            name: "convex-typegen",
            description: "A blazingly fast type generator for ConvexDB",
            tech: ["TypeScript", "Convex", "Code Generation"],
            github: "https://github.com/jamallyons/convex-typegen",
            demo: "https://crates.io/crates/convex-typegen",
            status: "production" as const,
        },
        {
            name: "bluefox-email",
            description: "A TypeScript client library for sending emails using Bluefox.email with type-safe API, subscriber management, webhooks, and comprehensive error handling",
            tech: ["TypeScript", "Email", "API Client"],
            github: "https://github.com/jamallyons/bluefox-email",
            demo: "https://www.npmjs.com/package/bluefox-email",
            status: "development" as const,
        },
        {
            name: "type-fetch",
            description: "A lightweight, flexible HTTP client library for making API requests in JavaScript",
            tech: ["JavaScript", "HTTP", "Client"],
            github: "https://github.com/jamallyons/type-fetch",
            demo: "https://www.npmjs.com/package/@thatguyjamal/type-fetch",
            status: "production" as const,
        },
        {
            name: "phoenixdb",
            description: "An experimental Key-Value storage database written in Rust",
            tech: ["Rust", "Database", "Key-Value"],
            github: "https://github.com/jamallyons/phoenixdb",
            demo: undefined,
            status: "development" as const,
        },
        {
            name: "poems-collection",
            description: "A personal collection of poems and creative writing pieces showcasing thoughts, emotions, and storytelling abilities through verse",
            tech: ["Creative Writing", "Poetry"],
            github: undefined,
            demo: "https://poems.jamallyons.com/",
            status: "production" as const,
        },
    ],

    // Blog posts
    blogs: [
        {
            title: "Transactional Email in Convex with Bluefox and AWS SES",
            description: "Bluefox is a modern email API built on top of Amazon SES, designed for developers and SaaS teams. Whether you're sending transactional emails or integrating real-time webhooks in a serverless Convex backend, Bluefox simplifies the process.",
            date: "2025-04-23",
            readTime: "15 min read",
            url: "https://dev.to/convexchampions/transactional-email-in-convex-with-bluefox-and-aws-ses-4kpc",
            tags: ["Convex", "Email", "AWS", "Backend"],
        },
        {
            title: "Authentication Best Practices: Convex, Clerk and Next.js",
            description: "Authentication is the backbone of any full-stack application, but it's also one of the easiest places to introduce subtle, hard-to-debug security flaws. As developers, we aim to build secure, reliable systems, but scaling an app to a global audience presents unique challenges—especially regarding authentication.",
            date: "2025-03-06",
            readTime: "25 min read",
            url: "https://dev.to/convexchampions/authentication-best-practices-convex-clerk-and-nextjs-21ag",
            tags: ["Authentication", "Convex", "Clerk", "Next.js", "Security"],
        },
        {
            title: "Building Type-Safe Rust Applications with Convex",
            description: "If you've been following the backend-as-a-service landscape, you've likely heard of Convex. This innovative platform has been turning heads by offering a unique combination of developer experience, serverless functions, and real-time subscriptions, all wrapped in a developer-friendly package. What makes Convex particularly interesting is that under the hood, it's powered by Rust – a language choice that speaks volumes about its commitment to performance and reliability.",
            date: "2024-12-09",
            readTime: "15 min read",
            url: "https://dev.to/convexchampions/building-type-safe-rust-applications-with-convex-introducing-convex-typegen-1g38",
            tags: ["Rust", "Convex", "TypeScript", "Backend"],
        },
    ],

    // Site metadata
    metadata: {
        title: "Terminal to the Future | Jamal Lyons",
        description: "Step into the future. A cyberpunk-inspired developer portfolio by Jamal Lyons.",
    },
};

