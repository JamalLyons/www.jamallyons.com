import Link from "next/link";

const projects = [
  {
    title: "Convex TypeGen",
    description: "Type safe bindings for ConvexDB in Rust",
    url: "https://github.com/ThatGuyJamal/convex-typegen",
  },
  {
    title: "Type Fetch",
    description:
      "A lightweight, flexible HTTP client library for making API requests in JavaScript",
    url: "https://github.com/ThatGuyJamal/type-fetch",
  },
  {
    title: "Pheonix",
    description: "A Key-Value storage database written in rust",
    url: "https://github.com/ThatGuyJamal/phoenix-db",
  },
];

export default function Projects() {
  return (
    <section id="projects" className="py-20 bg-black">
      <div className="container px-4 mx-auto">
        <h2 className="mb-10 text-3xl font-bold text-center">
          Project Showcase
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <div
              key={project.title + index}
              className="p-6 transition-shadow bg-purple-900 rounded-lg hover:shadow-lg"
            >
              <h3 className="mb-2 text-xl font-semibold">{project.title}</h3>
              <p className="mb-4 text-gray-300">{project.description}</p>
              <Link
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-300 hover:text-purple-100"
              >
                View Project
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
