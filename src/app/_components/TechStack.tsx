import Link from "next/link";
import { DiJava } from "react-icons/di";
import {
  SiRust,
  SiTypescript,
  SiPostgresql,
  SiGit,
  SiPython,
  SiMongodb,
  SiRedis,
  SiReact,
  SiDocker,
  SiTailwindcss,
  SiLinux,
  SiHtml5,
  SiCss3,
  SiNodedotjs,
  SiCplusplus,
} from "react-icons/si";
import ConvexIcon from "../_icons/ConvexIcon";

export default function TechStack() {
  const technologies = [
    {
      name: "TypeScript",
      icon: SiTypescript,
      link: "https://www.typescriptlang.org/",
    },
    { name: "Rust", icon: SiRust, link: "https://www.rust-lang.org/" },
    { name: "Python", icon: SiPython, link: "https://www.python.org/" },
    { name: "SQL", icon: SiPostgresql, link: "https://www.postgresql.org/" },
    { name: "React", icon: SiReact, link: "https://react.dev/" },
    { name: "Java", icon: DiJava, link: "https://www.java.com/" },
    { name: "C++", icon: SiCplusplus, link: "https://en.cppreference.com/w/" },
    { name: "Linux", icon: SiLinux, link: "https://www.linux.org/" },
    { name: "MongoDB", icon: SiMongodb, link: "https://www.mongodb.com/" },
    { name: "Redis", icon: SiRedis, link: "https://redis.io/" },
    { name: "Git", icon: SiGit, link: "https://git-scm.com/" },
    { name: "Docker", icon: SiDocker, link: "https://www.docker.com/" },
    {
      name: "Tailwind CSS",
      icon: SiTailwindcss,
      link: "https://tailwindcss.com/",
    },
    { name: "Node.js", icon: SiNodedotjs, link: "https://nodejs.org/" },
    // { name: "Convex", icon: ConvexIcon, link: "https://convex.dev/" },
  ];

  return (
    <section className="py-20 bg-black">
      <div className="container px-4 mx-auto">
        <h2 className="mb-10 text-3xl font-bold text-center">
          Technologies I Use
        </h2>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {technologies.map((tech) => (
            <div key={tech.name} className="flex flex-col items-center">
              <Link
                href={tech.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm flex flex-col items-center"
              >
                <tech.icon className="mb-2 text-5xl text-purple-500" />
                <span className="text-center">{tech.name}</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
