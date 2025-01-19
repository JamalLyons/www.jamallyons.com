import {
  SiTypescript,
  SiRust,
  SiReact,
  SiLinux,
  SiPostgresql,
} from "react-icons/si";

const technologies = [
  { name: "Rust", icon: SiRust },
  { name: "SQL", icon: SiPostgresql },
  { name: "Linux", icon: SiLinux },
  { name: "TypeScript", icon: SiTypescript },
  { name: "React", icon: SiReact },
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
            <tech.icon className="w-16 h-16 mb-2 text-purple-300" />
            <span className="text-center">{tech.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
