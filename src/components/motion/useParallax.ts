"use client";

import { useEffect, useState } from "react";

export function useParallax(multiplier: number = 0.1) {
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (typeof window === "undefined") return;

        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const isLowPerf = (window as any).__lowPerformanceDevice === true;
        if (prefersReduced || isLowPerf) {
            setOffset({ x: 0, y: 0 });
            return;
        }

        const handle = (e: MouseEvent) => {
            const { innerWidth, innerHeight } = window;
            const x = (e.clientX / innerWidth - 0.5) * 2;
            const y = (e.clientY / innerHeight - 0.5) * 2;
            setOffset({ x: x * multiplier, y: y * multiplier });
        };

        window.addEventListener("mousemove", handle);
        return () => window.removeEventListener("mousemove", handle);
    }, [multiplier]);

    return offset;
}


