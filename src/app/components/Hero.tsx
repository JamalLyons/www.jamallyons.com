"use client";

import { TypeAnimation } from "react-type-animation";

export default function Hero() {
  const typeSpeed = 85;

  return (
    <section className="min-h-screen flex flex-col justify-center">
      <h1 className="text-4xl md:text-6xl font-bold mb-4 text-purple-500">
        Jamal Lyons
      </h1>
      <h2 className="text-2xl md:text-3xl mb-8 text-purple-400">
        Backend Software Engineer
      </h2>
      <div className="text-lg md:text-xl mb-8">
        <TypeAnimation
          sequence={[
            "I am a Computer Science student at Georgia State University with a strong passion for exploring new technologies and developing impactful projects. My enthusiasm for continuous learning drives me to seek out new challenges and opportunities for growth as a developer. I am committed to leveraging my skills and expertise to contribute meaningfully to the tech community and make a positive difference in the world.",
            1000,
          ]}
          speed={typeSpeed}
          style={{ whiteSpace: "pre-line", display: "block" }}
          repeat={0}
        />
      </div>
    </section>
  );
}
