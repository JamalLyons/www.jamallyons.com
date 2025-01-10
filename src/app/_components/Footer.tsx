import {
  FaTwitter,
  FaGithub,
  FaYoutube,
  FaLinkedin,
  FaTwitch,
} from "react-icons/fa";

const socialLinks = [
  {
    href: "https://www.linkedin.com/in/codingwithjamal/",
    label: "LinkedIn",
    icon: <FaLinkedin className="text-2xl" />,
  },
  {
    href: "https://github.com/JamalLyons",
    label: "GitHub",
    icon: <FaGithub className="text-2xl" />,
  },
  {
    href: "https://x.com/codingwithjamal",
    label: "Twitter",
    icon: <FaTwitter className="text-2xl" />,
  },
  {
    href: "https://www.youtube.com/@codingwithjamal",
    label: "YouTube",
    icon: <FaYoutube className="text-2xl" />,
  },
  {
    href: "https://www.twitch.tv/codingwithjamal",
    label: "Twitch",
    icon: <FaTwitch className="text-2xl" />,
  },
];

export default function Footer() {
  return (
    <footer id="contact" className="py-8 bg-purple-900">
      <div className="container px-4 mx-auto">
        <div className="flex justify-center space-x-6">
          {socialLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-purple-300"
            >
              {link.icon}
              <span className="sr-only">{link.label}</span>
            </a>
          ))}
        </div>
        <p className="mt-4 text-sm text-center text-gray-300">
          © {new Date().getFullYear()} Jamal Lyons. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
