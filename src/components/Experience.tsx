"use client";

import { useState } from "react";
import {
  FaBriefcase,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaExternalLinkAlt,
} from "react-icons/fa";
import Card from "./ui/Card";
import Particles from "./Particles";

const experiences = [
  {
    company: "ClarityText",
    position: "Backend Development Intern",
    startDate: "Nov-2024",
    endDate: "present",
    location: "remote",
    description:
      "As an intern at ClarityText, a professional networking app tailored for B2B product communities, I am responsible for developing the notification system and enhancing the backend message infrastructure. My work supports the platform's mission to foster professional relationships, streamline customer support, and improve B2B marketing efforts. I collaborate with the engineering team to ensure efficient, scalable solutions that allow businesses to manage group messaging spaces and users to engage with their true professional identity.",
    website: "https://claritytext.com",
  },
  {
    company: "Code Ninjas",
    position: "Code Instructor",
    startDate: "May-2023",
    endDate: "Aug-2023",
    location: "on-site",
    description:
      "As a Game Development Instructor at Code Ninjas, I taught children aged 7-14 how to create their own video games using JavaScript. Leveraging a game-based curriculum, I guided students through hands-on coding projects, fostering creativity, problem-solving skills, and a strong understanding of programming concepts. My role included providing individual support, leading small group lessons, and helping students progress through the Code Ninjas belt system, which mirrors martial arts to encourage achievement and mastery in coding. I played a key role in creating an engaging learning environment where students developed both technical and soft skills.",
    website: "https://codeninjas.com",
  },
];

export default function Experience() {
  const [hoveredExperience, setHoveredExperience] = useState<string | null>(
    null
  );

  return (
    <section id="experience" className="py-16 relative">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <Particles />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent" />
      </div>

      <div className="relative z-10">
        <h2 className="text-3xl font-bold mb-8 text-purple-400 flex items-center">
          <span className="relative">
            Work Experience
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
          </span>
        </h2>

        <div className="space-y-6">
          {experiences.map((experience) => (
            <Card
              key={experience.company}
              className="group transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]"
              onMouseEnter={() => setHoveredExperience(experience.company)}
              onMouseLeave={() => setHoveredExperience(null)}
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-lg bg-purple-900/30 border border-purple-700/50">
                  <FaBriefcase className="text-2xl text-purple-300" />
                </div>

                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                    <h3 className="text-xl font-bold text-purple-300 group-hover:text-purple-200 transition-colors">
                      {experience.position}
                    </h3>
                    <div className="flex items-center text-sm text-purple-400 mt-1 md:mt-0">
                      <FaCalendarAlt className="mr-1" />
                      <span>
                        {experience.startDate} - {experience.endDate}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center text-lg font-medium text-purple-400 mb-3">
                    {experience.company}
                    <span className="mx-2">•</span>
                    <div className="flex items-center text-sm">
                      <FaMapMarkerAlt className="mr-1" />
                      <span>{experience.location}</span>
                    </div>
                  </div>

                  <p className="text-gray-300 leading-relaxed">
                    {experience.description}
                  </p>

                  <div className="mt-4 flex items-center space-x-2 text-sm text-purple-400">
                    <span className="text-green-400">$</span>
                    <a
                      href={experience.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`typing-animation flex items-center hover:text-purple-300 transition-colors ${hoveredExperience === experience.company
                          ? "w-full"
                          : "w-0"
                        }`}
                    >
                      view-company{" "}
                      {experience.company.toLowerCase().replace(" ", "-")}
                      <FaExternalLinkAlt className="ml-1 text-xs" />
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
