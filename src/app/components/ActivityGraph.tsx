"use client";

import type { FC } from "react";
import { TypeAnimation } from "react-type-animation";

type ActivityGraphProps = {};

const ActivityGraph: FC<ActivityGraphProps> = () => {
  const typeSpeed = 90;
  const data = Array.from({ length: 34 }, () => Math.floor(Math.random() * 9));

  return (
    <div className="terminal-window">
      <h2 className="text-xl font-bold mb-4 terminal-prompt">
        <TypeAnimation
          sequence={["Recent GitHub Contributions", 1000]}
          speed={typeSpeed}
          className="block"
          repeat={0}
        />
      </h2>
      <svg
        className="w-full h-48"
        viewBox="0 0 1000 200"
        preserveAspectRatio="none"
      >
        <path
          d={`M0,200 L0,${200 - data[0] * 20} ${data
            .map((d, i) => `L${(i + 1) * (1000 / 30)},${200 - d * 20}`)
            .join(" ")} L1000,200 Z`}
          className="activity-graph"
        />
        {/* Grid lines */}
        {Array.from({ length: 10 }).map((_, i) => (
          <line
            key={i}
            x1="0"
            y1={i * 20}
            x2="1000"
            y2={i * 20}
            stroke="#333"
            strokeWidth="1"
          />
        ))}
        {Array.from({ length: 31 }).map((_, i) => (
          <line
            key={i}
            x1={i * (1000 / 30)}
            y1="0"
            x2={i * (1000 / 30)}
            y2="200"
            stroke="#333"
            strokeWidth="1"
          />
        ))}
      </svg>
    </div>
  );
};

export default ActivityGraph;
