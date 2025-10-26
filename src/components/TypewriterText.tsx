import { useState, useEffect } from "react";

interface TypewriterTextProps {
    text: string;
    speed?: number;
    delay?: number;
    showCursor?: boolean;
    onComplete?: () => void;
    className?: string;
}

export function TypewriterText({
    text,
    speed = 50,
    delay = 0,
    showCursor = true,
    onComplete,
    className = "",
}: TypewriterTextProps) {
    const [displayedText, setDisplayedText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (delay > 0) {
            const delayTimeout = setTimeout(() => {
                setCurrentIndex(0);
            }, delay);
            return () => clearTimeout(delayTimeout);
        }
    }, [delay]);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText((prev) => prev + text[currentIndex]);
                setCurrentIndex((prev) => prev + 1);
            }, speed);

            return () => clearTimeout(timeout);
        } else if (currentIndex === text.length && !isComplete) {
            setIsComplete(true);
            onComplete?.();
        }
    }, [currentIndex, text, speed, onComplete, isComplete]);

    return (
        <span className={className}>
            {displayedText}
            {showCursor && (
                <span className="inline-block animate-blink ml-1">
                    _
                </span>
            )}
        </span>
    );
}

