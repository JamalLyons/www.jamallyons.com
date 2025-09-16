"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform, useMotionTemplate } from "framer-motion";

export default function Header() {
    const { scrollY } = useScroll();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const bgOpacity = useTransform(scrollY, [0, 120], [0, 0.6]);
    const borderOpacity = useTransform(scrollY, [0, 120], [0, 0.35]);
    const shadow = useTransform(scrollY, [0, 120], [0, 0.15]);
    const borderBottom = useMotionTemplate`1px solid rgba(168,85,247, ${borderOpacity})`;
    const boxShadow = useMotionTemplate`0 4px 24px rgba(0,0,0, ${shadow})`;

    return (
        <motion.header
            className="fixed top-0 left-0 right-0 z-40"
            style={{
                backgroundColor: mounted ? undefined : "transparent",
            }}
        >
            <motion.div
                style={{
                    background: "rgba(10,10,15,0.6)",
                    backdropFilter: "saturate(180%) blur(14px)",
                    WebkitBackdropFilter: "saturate(180%) blur(14px)",
                    borderBottom,
                    boxShadow,
                    opacity: bgOpacity,
                }}
                className="w-full"
            >
                <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
                    <Link href="/" className="text-purple-400 font-semibold tracking-wider">
                        jamal_lyons:~$
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 text-sm text-purple-2 00">
                        <a href="#experience" className="hover:text-purple-400 transition-colors">experience</a>
                        <a href="#projects" className="hover:text-purple-400 transition-colors">projects</a>
                        <a href="#blog" className="hover:text-purple-400 transition-colors">blog</a>
                        <a href="/resume.pdf" className="hover:text-purple-400 transition-colors">resume</a>
                    </nav>
                </div>
            </motion.div>
        </motion.header>
    );
}


