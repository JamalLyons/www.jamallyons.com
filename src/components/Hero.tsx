"use client";

import { useEffect, useRef, useState } from "react";
import { TypeAnimation } from "react-type-animation";
import {
  FaGithub,
  FaLinkedin,
  FaTwitch,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import Link from "next/link";
import Particles from "./Particles";
import SkillIcon from "./SkillIcon";
import {
  SiReact,
  SiNextdotjs,
  SiTailwindcss,
  SiRust,
  SiTypescript,
  SiNodedotjs,
  SiMysql,
  SiDocker,
  SiGnubash as SiBash,
} from "react-icons/si";
import { TbBrandNexo as TbBrandConvex } from "react-icons/tb";

const links = [
  {
    href: "https://github.com/jamallyons",
    icon: <FaGithub className="mr-1" />,
    children: "GITHUB",
  },
  {
    href: "https://linkedin.com/in/codingwithjamal",
    icon: <FaLinkedin className="mr-1" />,
    children: "LINKEDIN",
  },
  {
    href: "https://twitter.com/codingwithjamal",
    icon: <FaTwitter className="mr-1" />,
    children: "TWITTER",
  },
  {
    href: "https://youtube.com/@codingwithjamal",
    icon: <FaYoutube className="mr-1" />,
    children: "YOUTUBE",
  },
  {
    href: "https://twitch.tv/codingwithjamal",
    icon: <FaTwitch className="mr-1" />,
    children: "TWITCH",
  },
];

const aboutMe =
  "I am a Computer Science student at Georgia State University with a strong passion for exploring new technologies and developing impactful projects. My enthusiasm for continuous learning drives me to seek out new challenges and opportunities for growth as a developer.";

const skills = [
  { name: "React.js", icon: <SiReact /> },
  { name: "Next.js", icon: <SiNextdotjs /> },
  { name: "Tailwind CSS", icon: <SiTailwindcss /> },
  { name: "Rust", icon: <SiRust /> },
  { name: "TypeScript", icon: <SiTypescript /> },
  { name: "Node.js", icon: <SiNodedotjs /> },
  { name: "SQL", icon: <SiMysql /> },
  { name: "Convex", icon: <TbBrandConvex /> },
  { name: "Docker", icon: <SiDocker /> },
  { name: "Bash", icon: <SiBash /> },
];

export default function Hero() {
  const [mounted, setMounted] = useState(false);
  const typeSpeed = 95;
  const blogButtonEnabled = false;
  const contactButtonEnabled = false;
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render a placeholder during SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen p-4 hero-container" ref={heroRef}>
        <div className="grid-background" />
        <div className="flex justify-between items-center mb-8 relative z-10">
          <span className="text-purple-500 font-bold tracking-wider text-xl">
            jamal_lyons:~$
          </span>
          <div className="space-x-4"></div>
        </div>
        <div className="flex flex-col md:flex-row gap-8 mb-12 relative z-10">
          <div className="terminal-window w-full md:w-3/5 backdrop-blur-sm">
            <div className="terminal-prompt mb-4 text-xl">whoami</div>
            <div className="h-8 mb-6"></div>
            <div className="mb-6 leading-relaxed">{aboutMe}</div>
            <div className="mb-6 terminal-prompt">
              <span className="text-purple-400">stack</span>:
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-6">
              {skills.map((skill, index) => (
                <div
                  key={skill.name}
                  className="skill-icon flex flex-col items-center justify-center p-3"
                >
                  <div className="text-2xl mb-1">{skill.icon}</div>
                  <div className="text-xs font-medium">{skill.name}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full md:w-2/5 relative min-h-[300px]">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-transparent rounded-lg border border-purple-800/30 overflow-hidden">
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="absolute w-40 h-40 rounded-full bg-purple-900/20 border border-purple-600/30 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-purple-900/30 border border-purple-500/50 animate-pulse flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-purple-800/50 border border-purple-400/70 flex items-center justify-center text-purple-300 text-4xl">
                      {"</>"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 hero-container" ref={heroRef}>
      {/* Grid background */}
      <div className="grid-background" />

      {/* Animated particles */}
      <Particles />

      {/* Glowing center effect */}
      <div className="hero-glow" />

      <nav className="flex justify-between items-center mb-8 relative z-10">
        <span className="text-purple-500 font-bold tracking-wider text-xl">
          jamal_lyons:~$
        </span>
        <div className="space-x-4">
          {blogButtonEnabled && (
            <Link
              href="/blog"
              className="text-purple-300 hover:text-purple-500 transition-colors"
            >
              blog
            </Link>
          )}
          {contactButtonEnabled && (
            <Link
              href="/contact"
              className="text-purple-300 hover:text-purple-500 transition-colors"
            >
              contact
            </Link>
          )}
        </div>
      </nav>

      <div className="flex flex-col md:flex-row gap-8 mb-12 relative z-10">
        <div className="terminal-window w-full md:w-3/5 backdrop-blur-sm">
          <div className="terminal-prompt mb-4 text-xl">whoami</div>

          <div className="mb-6">
            <TypeAnimation
              sequence={[
                "Jamal Lyons",
                1000,
                "Backend Software Engineer",
                1000,
                "Computer Science Student @ GSU",
                1000,
                "Tech Enthusiast & Problem Solver",
                1000,
              ]}
              speed={typeSpeed}
              repeat={Infinity}
              className="text-3xl font-bold text-purple-300"
            />
          </div>

          <div className="mb-6 leading-relaxed">{aboutMe}</div>

          {/* <div className="mb-6 terminal-prompt">
            <span className="text-purple-400">stack</span>:
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-6">
            {skills.map((skill, index) => (
              <div
                key={skill.name}
                className="skill-icon flex flex-col items-center justify-center p-3"
              >
                <div className="text-2xl mb-1">{skill.icon}</div>
                <div className="text-xs font-medium">{skill.name}</div>
              </div>
            ))}
          </div> */}

          <div className="mt-6">
            <span className="text-purple-400 terminal-prompt">connect</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {links.map(({ href, icon, children }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-purple-900 bg-opacity-30 border border-purple-700 text-purple-300 px-3 py-1 rounded text-sm hover:bg-purple-800 hover:bg-opacity-50 transition-all hover:translate-y-[-2px] hover:shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                >
                  {icon}
                  {children} ↗
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full md:w-2/5 relative min-h-[300px]">
          {/* Abstract backend visualization */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-transparent rounded-lg border border-purple-800/30 overflow-hidden">
            {/* Floating skill icons */}
            <div className="relative w-full h-full flex items-center justify-center">
              {skills.map((skill, index) => (
                <SkillIcon
                  key={skill.name}
                  icon={skill.icon}
                  name={skill.name}
                  index={index}
                  delay={index * 300}
                />
              ))}

              {/* Center glowing circuit */}
              <div className="absolute w-40 h-40 rounded-full bg-purple-900/20 border border-purple-600/30 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-purple-900/30 border border-purple-500/50 animate-pulse flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-purple-800/50 border border-purple-400/70 flex items-center justify-center text-purple-300 text-4xl">
                    {"</>"}
                  </div>
                </div>
              </div>

              {/* Circuit lines */}
              <div className="absolute w-full h-full">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute bg-purple-500/20 h-[1px]"
                    style={{
                      width: "40%",
                      top: "50%",
                      left: "50%",
                      transform: `rotate(${i * 45}deg) translateX(-50%)`,
                      transformOrigin: "left",
                    }}
                  >
                    <div className="absolute right-0 w-1 h-1 rounded-full bg-purple-500/70" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
