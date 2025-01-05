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

export default function TechStack() {
  const technologies = [
    { name: "TypeScript", icon: SiTypescript },
    { name: "Rust", icon: SiRust },
    { name: "Python", icon: SiPython },
    { name: "SQL", icon: SiPostgresql },
    { name: "React", icon: SiReact },
    { name: "Java", icon: DiJava },
    { name: "C++", icon: SiCplusplus },
    { name: "Linux", icon: SiLinux },
    { name: "MongoDB", icon: SiMongodb },
    { name: "Redis", icon: SiRedis },
    { name: "Git", icon: SiGit },
    { name: "Docker", icon: SiDocker },
    { name: "Tailwind CSS", icon: SiTailwindcss },
    { name: "HTML", icon: SiHtml5 },
    { name: "CSS", icon: SiCss3 },
    { name: "Node.js", icon: SiNodedotjs },
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
              <tech.icon className="mb-2 text-5xl text-purple-500" />
              <span className="text-sm">{tech.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
