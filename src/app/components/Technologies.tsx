import {
  SiTypescript,
  SiRust,
  SiPython,
  SiReact,
  SiCplusplus,
  SiLinux,
  SiMongodb,
  SiRedis,
  SiGit,
  SiDocker,
  SiTailwindcss,
  SiNodedotjs,
  SiPostgresql,
} from "react-icons/si";
import { DiJava } from "react-icons/di";
import Link from "next/link";

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
];

export default function Technologies() {
  return (
    <section className="py-16">
      <h2 className="text-3xl font-bold mb-8 text-purple-400">
        Technologies I Use
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
        {technologies.map((tech) => (
          <div key={tech.name} className="flex flex-col items-center">
            <Link href={tech.link} target="_blank">
              <tech.icon className="w-16 h-16 mb-2 text-purple-300" />
              <span className="text-center">{tech.name}</span>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
