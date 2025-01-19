import { Github, Twitter, Linkedin, Youtube, Twitch } from "lucide-react";

const socialLinks = [
  { name: "GitHub", icon: Github, url: "https://github.com/jamallyons" },
  {
    name: "Twitter",
    icon: Twitter,
    url: "https://twitter.com/codingwithjamal",
  },
  {
    name: "LinkedIn",
    icon: Linkedin,
    url: "https://linkedin.com/in/codingwithjamal",
  },
  {
    name: "YouTube",
    icon: Youtube,
    url: "https://youtube.com/@codingwithjamal",
  },
  { name: "Twitch", icon: Twitch, url: "https://twitch.tv/codingwithjamal" },
];

export default function Footer() {
  return (
    <footer className="py-8 border-t border-purple-800">
      <div className="flex justify-center space-x-6">
        {socialLinks.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            <link.icon className="w-6 h-6" />
            <span className="sr-only">{link.name}</span>
          </a>
        ))}
      </div>
      <p className="mt-4 text-center text-sm">
        © {new Date().getFullYear()} Jamal Lyons. All rights reserved.
      </p>
    </footer>
  );
}
