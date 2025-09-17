"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import MotionStagger from "./motion/MotionStagger";
import MotionSection from "./motion/MotionSection";
import { useParallax } from "./motion/useParallax";
import { TypeAnimation } from "react-type-animation";
import {
  FaGithub,
  FaLinkedin,
  FaMoneyCheck,
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
    children: "GitHub",
  },
  {
    href: "https://linkedin.com/in/codingwithjamal",
    icon: <FaLinkedin className="mr-1" />,
    children: "LinkedIn",
  },
  {
    href: "https://www.claritytext.com/u/jamallyons",
    icon: <FaMoneyCheck className="mr-1" />,
    children: "ClarityText",
  },
  {
    href: "https://twitter.com/codingwithjamal",
    icon: <FaTwitter className="mr-1" />,
    children: "Twitter",
  },
  {
    href: "https://youtube.com/@codingwithjamal",
    icon: <FaYoutube className="mr-1" />,
    children: "YouTube",
  },
  {
    href: "https://twitch.tv/codingwithjamal",
    icon: <FaTwitch className="mr-1" />,
    children: "Twitch",
  },
  {
    href: "https://github.com/sponsors/JamalLyons",
    icon: <FaMoneyCheck className="mr-1" />,
    children: "Sponsor Me",
  },
];

const aboutMe =
  "I am a Computer Science student at Georgia State University. I am passionate about exploring new technologies and developing impactful projects. My enthusiasm for continuous learning drives me to seek out new challenges and opportunities for growth as a developer.";

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
  const [shuffledSkills, setShuffledSkills] = useState(skills);
  const typeSpeed = 95;
  const blogButtonEnabled = false;
  const contactButtonEnabled = false;
  const heroRef = useRef<HTMLDivElement>(null);
  const { x, y } = useParallax(6);

  useEffect(() => {
    setMounted(true);
    // Shuffle skills once on mount to vary layout each refresh
    const shuffled = [...skills];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setShuffledSkills(shuffled);
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

      <div className="flex flex-col md:flex-row gap-6 md:gap-8 mb-10 md:mb-12 relative z-10">
        <div className="terminal-window w-full md:w-3/5 backdrop-blur-sm">
          <div className="terminal-prompt mb-2 text-xl">whoami</div>

          <MotionStagger>
            {/* Subheading badge */}
            <div className="mb-2">
              <span className="inline-flex items-center gap-2 text-[11px] sm:text-xs text-purple-300/80 bg-purple-900/30 border border-purple-700/40 px-2 py-1 rounded-full">
                backend • rust • typescript • next.js
              </span>
            </div>

            <div className="mb-3 md:mb-4 h-[56px] sm:h-[76px] flex items-baseline">
              <TypeAnimation
                sequence={[
                  "Jamal Lyons",
                  1200,
                  "Backend Software Engineer",
                  1200,
                  "Computer Science Student @ GSU",
                  1200,
                  "Tech Enthusiast & Problem Solver",
                  1200,
                ]}
                speed={typeSpeed}
                repeat={Infinity}
                className="text-2xl sm:text-3xl font-bold text-purple-300"
                wrapper="div"
                cursor={true}
              />
            </div>

            <div className="mb-4 md:mb-5 leading-relaxed text-sm sm:text-base">
              {aboutMe}
            </div>
          </MotionStagger>

          <MotionSection delay={0.2}>
            <div className="mt-6">
              <span className="text-purple-400 terminal-prompt">
                connect with me
              </span>
              <div className="flex flex-wrap gap-2 mt-2">
                {links.map(({ href, icon, children }) => (
                  <motion.a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -2, boxShadow: "0 0 10px rgba(168,85,247,0.35)" }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center bg-purple-900 bg-opacity-30 border border-purple-700 text-purple-300 px-2 sm:px-3 py-1 rounded text-xs sm:text-sm hover:bg-purple-800 hover:bg-opacity-50 transition-all"
                  >
                    {icon}
                    {children} ↗
                  </motion.a>
                ))}
              </div>
            </div>
          </MotionSection>
        </div>

        <div className="w-full md:w-2/5 relative min-h-[300px] mt-8 md:mt-0">
          {/* Abstract backend visualization */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-transparent rounded-lg border border-purple-800/30 overflow-hidden"
            style={{ transform: `translate3d(${x}px, ${y}px, 0)` }}
            transition={{ type: "spring", stiffness: 60, damping: 12 }}
          >
            {/* Soft blurred backdrop for readability */}
            <div className="absolute inset-3 sm:inset-4 rounded-xl bg-[#0b0b12]/35 backdrop-blur-sm border border-purple-800/20" />
            {/* Grid of skills: 2–3 rows responsive */}
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <div className="w-full max-w-sm">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {shuffledSkills.map((skill) => (
                    <div
                      key={skill.name}
                      className="skill-icon relative flex flex-col items-center justify-center py-2"
                    >
                      <div className="text-lg sm:text-xl mb-1">{skill.icon}</div>
                      <div className="skill-label text-[10px] sm:text-xs font-medium text-purple-200/90 text-center">
                        {skill.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
