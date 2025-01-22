"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { TypeAnimation } from "react-type-animation";
import {
  FaGithub,
  FaLinkedin,
  FaTwitch,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import Link from "next/link";
import ActivityGraph from "./ActivityGraph";

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

const frontEnd = ["React.js", "Next.js", "Tailwind CSS"];

const backEnd = [
  "Rust",
  "TypeScript",
  "Node.js",
  "SQL",
  "Convex",
  "Docker",
  "Bash",
];

export default function Hero() {
  const [mounted, setMounted] = useState(false);

  const typeSpeed = 95;

  const blogButtonEnabled = false;
  const contactButtonEnabled = false;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen p-4">
      <nav className="flex justify-between items-center mb-8">
        <span className="text-purple-500 font-bold">jamal_lyons</span>
        <div className="space-x-4">
          {blogButtonEnabled && (
            <Link
              href="/blog"
              className="text-purple-300 hover:text-purple-500"
            >
              blog
            </Link>
          )}
          {contactButtonEnabled && (
            <Link
              href="/contact"
              className="text-purple-300 hover:text-purple-500"
            >
              contact
            </Link>
          )}
        </div>
      </nav>

      <div className="terminal-window mb-8">
        <div className="terminal-prompt mb-4">whoami</div>
        <div className="grid md:grid-cols-[200px_1fr] gap-8">
          <div>
            <Image
              src="/me.png"
              alt="Profile"
              width={200}
              height={200}
              className="rounded border border-purple-500"
            />
          </div>
          <div className="space-y-4">
            <TypeAnimation
              sequence={[
                "name: Jamal Lyons",
                1000,
                "name: Jamal Lyons\nrole: Backend Software Engineer",
                1000,
                "name: Jamal Lyons\nrole: Backend Software Engineer\nexperience: Intern at Clarity Text",
                1000,
                `name: Jamal Lyons\nrole: Backend Software Engineer\nexperience: Intern at Clarity Text\nabout: ${aboutMe}`,
                1000,
                `name: Jamal Lyons\nrole: Backend Software Engineer\nexperience: Intern at Clarity Text\nabout: ${aboutMe}\nFrontend skills: ${frontEnd.join(
                  ", "
                )}\nuhhhhhh one more thing... hold on...`,
                1000,
                `name: Jamal Lyons\nrole: Backend Software Engineer\nexperience: Intern at Clarity Text\nabout: ${aboutMe}\nFrontend skills: ${frontEnd.join(
                  ", "
                )}\nBackend skills: ${backEnd.join(", ")}`,
                1000,
              ]}
              speed={typeSpeed}
              style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
              repeat={0}
              className="block"
            />
            <div className="mt-4">
              <span className="text-purple-400">Find me at: </span>
              <div className="inline-flex flex-wrap gap-2 mt-2">
                {links.map(({ href, icon, children }) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-purple-500 text-black px-2 py-1 rounded text-sm hover:bg-purple-400"
                  >
                    {icon}
                    {children} ↗
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ActivityGraph />
    </div>
  );
}
