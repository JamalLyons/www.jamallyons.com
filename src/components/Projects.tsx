"use client";

import Image from "next/image";
import { useState } from "react";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import Card from "./ui/Card";
import Particles from "./Particles";

const projects = [
  {
    name: "Convex TypeGen",
    description: "A Blazingly fast type generator for ConvexDB",
    image:
      "https://gist.github.com/user-attachments/assets/2ca74613-5e8a-4f91-a2da-f11cccd437f4",
    github: "https://github.com/ThatGuyJamal/convex-typegen",
    registryUrl: "https://crates.io/crates/convex-typegen",
  },
  {
    name: "Type Fetch",
    description:
      "A lightweight, flexible HTTP client library for making API requests in JavaScript",
    image:
      "https://gist.github.com/user-attachments/assets/94369288-fdc8-46c5-982a-dc5d820eadd6",
    github: "https://github.com/ThatGuyJamal/type-fetch",
    registryUrl: "#",
  },
  {
    name: "PheonixDB",
    description: "An experimental Key-Value storage database written in rust",
    image:
      "https://gist.github.com/user-attachments/assets/8c5b5d49-3de3-48ee-a693-cd7afd0a808c",
    github: "https://github.com/ThatGuyJamal/phoenix-db",
    registryUrl: "#",
  },
];

export default function Projects() {
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);

  return (
    <section className="py-16 relative">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <Particles />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent" />
      </div>

      <div className="relative z-10">
        <h2 className="text-3xl font-bold mb-8 text-purple-400 flex items-center">
          <span className="relative">
            Project Showcase
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <Card
              key={project.name}
              className="group"
              onMouseEnter={() => setHoveredProject(project.name)}
              onMouseLeave={() => setHoveredProject(null)}
            >
              <div className="relative overflow-hidden rounded-t-lg">
                <Image
                  src={project.image || "/placeholder.svg"}
                  alt={project.name}
                  width={300}
                  height={200}
                  className="w-full transition-transform duration-500 group-hover:scale-110"
                />
                {hoveredProject === project.name && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center space-x-4 transition-all duration-300">
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-purple-400 transition-colors transform hover:scale-110"
                    >
                      <FaGithub className="w-8 h-8" />
                    </a>
                    <a
                      href={project.registryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-purple-400 transition-colors transform hover:scale-110"
                    >
                      <FaExternalLinkAlt className="w-8 h-8" />
                    </a>
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="text-xl font-bold mb-2 text-purple-300 group-hover:text-purple-200 transition-colors">
                  {project.name}
                </h3>
                <p className="text-gray-300 mb-4">{project.description}</p>
                <div className="flex items-center space-x-2 text-sm text-purple-400">
                  <span className="text-green-400">$</span>
                  <span className="typing-animation">
                    view-project {project.name.toLowerCase().replace(" ", "-")}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
