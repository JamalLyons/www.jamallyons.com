"use client";

import Link from "next/link";
import { useState } from "react";
import { FaChevronRight } from "react-icons/fa";
import Card from "./ui/Card";
import Particles from "./Particles";

interface Blog {
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  link: string;
}

const blogs: Blog[] = [
  {
    title: "Transactional Email in Convex with Bluefox and AWS SES",
    excerpt: `Bluefox is a modern email API built on top of Amazon SES, designed for developers and SaaS teams. Whether you’re sending transactional emails or integrating real-time webhooks in a serverless Convex backend, Bluefox simplifies the process.`,
    date: "2025-04-23",
    readTime: "15 min read",
    link: "https://dev.to/convexchampions/transactional-email-in-convex-with-bluefox-and-aws-ses-4kpc",
  },
  {
    title: "Authentication Best Practices: Convex, Clerk and Next.js",
    excerpt:
      "Authentication is the backbone of any full-stack application, but it's also one of the easiest places to introduce subtle, hard-to-debug security flaws. As developers, we aim to build secure, reliable systems, but scaling an app to a global audience presents unique challenges—especially regarding authentication.",
    date: "2025-03-06",
    readTime: "25 min read",
    link: `https://dev.to/convexchampions/authentication-best-practices-convex-clerk-and-nextjs-21ag`,
  },
  {
    title: "Building Type-Safe Rust Applications with Convex",
    excerpt:
      "If you've been following the backend-as-a-service landscape, you've likely heard of Convex. This innovative platform has been turning heads by offering a unique combination of developer experience, serverless functions, and real-time subscriptions, all wrapped in a developer-friendly package. What makes Convex particularly interesting is that under the hood, it's powered by Rust – a language choice that speaks volumes about its commitment to performance and reliability.",
    date: "2024-12-09",
    readTime: "15 min read",
    link: "https://dev.to/convexchampions/building-type-safe-rust-applications-with-convex-introducing-convex-typegen-1g38",
  },
];

export default function Blogs() {
  const [hoveredBlog, setHoveredBlog] = useState<string | null>(null);

  return (
    <section id="blog" className="py-16 relative">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <Particles />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent" />
      </div>

      <div className="relative z-10">
        <h2 className="text-3xl font-bold mb-8 text-purple-400 flex items-center">
          <span className="relative">
            My Blogs
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
          </span>
        </h2>

        <div className="space-y-6">
          {blogs.map((blog) => (
            <Link href={blog.link} key={blog.title} target="_blank">
              <Card
                className="group transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]"
                onMouseEnter={() => setHoveredBlog(blog.title)}
                onMouseLeave={() => setHoveredBlog(null)}
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <h3 className="text-xl font-bold text-purple-300 group-hover:text-purple-200 transition-colors">
                        {blog.title}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-purple-400 mt-2 md:mt-0">
                        <span>{blog.date}</span>
                        <span>•</span>
                        <span>{blog.readTime}</span>
                      </div>
                    </div>
                    <p className="text-gray-300 mb-4">{blog.excerpt}</p>
                    <div className="flex items-center space-x-2 text-sm text-purple-400">
                      <span className="text-green-400">$</span>
                      <span
                        className={`typing-animation ${hoveredBlog === blog.title ? "w-full" : "w-0"
                          }`}
                      >
                        read-article {blog.link.split("/").pop()}
                      </span>
                      <FaChevronRight
                        className={`transition-transform duration-300 ${hoveredBlog === blog.title ? "translate-x-2" : ""
                          }`}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
