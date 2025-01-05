import Link from "next/link";

const blogs = [
  {
    title: "Building Type-Safe Rust Applications with Convex",
    url: "https://stack.convex.dev/building-type-safe-rust-applications-with-convex",
    date: "December 9th, 2024",
  },
];

export default function Blogs() {
  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-10 text-center">My Blog Posts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <div
              key={blog.title}
              className="bg-purple-900 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2">{blog.title}</h3>
              <p className="text-sm text-purple-300 mb-4">{blog.date}</p>
              <Link
                href={blog.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-300 hover:text-purple-100"
              >
                Read Here
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
