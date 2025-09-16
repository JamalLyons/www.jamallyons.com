"use client";

import React from "react";
import { motion, Variants, useReducedMotion } from "framer-motion";

type MotionSectionProps = {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    once?: boolean;
};

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function MotionSection({ children, className, delay = 0, once = true }: MotionSectionProps) {
    const prefersReducedMotion = useReducedMotion();

    const variants: Variants = prefersReducedMotion
        ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
        : fadeUp;

    return (
        <motion.section
            className={className}
            initial="hidden"
            whileInView="visible"
            viewport={{ once, amount: 0.2 }}
            variants={variants}
            transition={{ delay }}
        >
            {children}
        </motion.section>
    );
}


