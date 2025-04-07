"use client";

import Link from "next/link";
import { useState } from "react";
import { FaChevronRight } from "react-icons/fa";

const blogs = [
  {
    title: "Building Type-Safe Rust Applications with Convex",
    excerpt:
      "If you've been following the backend-as-a-service landscape, you've likely heard of Convex. This innovative platform has been turning heads by offering a unique combination of developer experience, serverless functions, and real-time subscriptions, all wrapped in a developer-friendly package. What makes Convex particularly interesting is that under the hood, it's powered by Rust – a language choice that speaks volumes about its commitment to performance and reliability.",
    date: "2024-12-09",
    readTime: "15 min read",
    link: "https://stack.convex.dev/building-type-safe-rust-applications-with-convex",
  },
  {
    title: "Authentication Best Practices: Convex, Clerk and Next.js",
    excerpt:
      "Authentication is the backbone of any full-stack application, but it’s also one of the easiest places to introduce subtle, hard-to-debug security flaws. As developers, we aim to build secure, reliable systems, but scaling an app to a global audience presents unique challenges—especially regarding authentication.",
    data: "2025-03-06",
    readTime: "25 min read",
    link: `https://stack.convex.dev/authentication-best-practices-convex-clerk-and-nextjs`,
  },
];

export default function Blogs() {
  const [hoveredBlog, setHoveredBlog] = useState<string | null>(null);

  return (
    <section className="py-16">
      <h2 className="text-3xl font-bold mb-8 text-purple-400">My Blogs</h2>
      <div className="space-y-6">
        {blogs.map((blog) => (
          <Link href={blog.link} key={blog.title} target="_blank">
            <div
              key={blog.title}
              className="bg-gray-900 rounded-lg p-6 border border-purple-700 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50"
              onMouseEnter={() => setHoveredBlog(blog.title)}
              onMouseLeave={() => setHoveredBlog(null)}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-purple-300">
                  {blog.title}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-purple-400">
                  <span>{blog.date}</span>
                  <span>•</span>
                  <span>{blog.readTime}</span>
                </div>
              </div>
              <p className="text-gray-300 mb-4">{blog.excerpt}</p>
              <div className="flex items-center space-x-2 text-sm text-purple-400">
                <span className="text-green-400">$</span>
                <span
                  className={`typing-animation ${
                    hoveredBlog === blog.title ? "w-full" : "w-0"
                  }`}
                >
                  read-article {blog.link.split("/").pop()}
                </span>
                <FaChevronRight
                  className={`transition-transform duration-300 ${
                    hoveredBlog === blog.title ? "translate-x-2" : ""
                  }`}
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
