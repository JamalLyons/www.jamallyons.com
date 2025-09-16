"use client";

import React from "react";
import { motion, Variants, useReducedMotion } from "framer-motion";

type MotionStaggerProps = {
    children: React.ReactNode;
    className?: string;
    delayChildren?: number;
    stagger?: number;
};

export default function MotionStagger({ children, className, delayChildren = 0.1, stagger = 0.08 }: MotionStaggerProps) {
    const prefersReducedMotion = useReducedMotion();

    const container: Variants = prefersReducedMotion
        ? { hidden: {}, visible: {} }
        : {
            hidden: {},
            visible: {
                transition: {
                    when: "beforeChildren",
                    staggerChildren: stagger,
                    delayChildren,
                    ease: [0.22, 1, 0.36, 1],
                },
            },
        };

    const item: Variants = prefersReducedMotion
        ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
        : { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

    return (
        <motion.div className={className} variants={container} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
            {React.Children.map(children, (child) => (
                <motion.div variants={item}>{child}</motion.div>
            ))}
        </motion.div>
    );
}


