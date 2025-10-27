import { useEffect, useRef } from "react";

interface MatrixAnimationProps {
	columnCount?: number;
}

export function MatrixAnimation({ columnCount = 15 }: MatrixAnimationProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		const container = containerRef.current;
		const columns: HTMLDivElement[] = [];

		// ASCII characters pool
		const chars =
			"0123456789ABCDEF!" +
			"アイウエオカキクケコサシスセソタチツテト" +
			"#$%&*()[]{}/+-=<>?~`@" +
			"°±§×÷∞∑µ∂∏∆∇Ωαβγδεζηθικλμνξοπρστυφχψω";

		// Create columns
		for (let i = 0; i < columnCount; i++) {
			const column = document.createElement("div");
			column.className = "absolute h-full flex flex-col justify-start";
			column.style.left = `${(i / columnCount) * 100}%`;
			column.style.width = `${(1 / columnCount) * 100}%`;
			column.style.animation = `matrix-fall ${3 + Math.random() * 5}s linear infinite`;
			column.style.animationDelay = `${Math.random() * 2}s`;
			container.appendChild(column);
			columns.push(column);
		}

		// Generate characters that continuously scroll
		const generateChars = (column: HTMLDivElement) => {
			const charCount = Math.floor(Math.random() * 15) + 10;
			column.innerHTML = "";

			for (let i = 0; i < charCount; i++) {
				const char = document.createElement("div");
				char.className = "matrix-char";
				char.textContent = chars[Math.floor(Math.random() * chars.length)];

				// Gradient effect - lighter at top, darker at bottom
				const opacity = Math.max(0.2, 1 - i / charCount);
				char.style.opacity = opacity.toString();

				// Alternate colors for variety
				const isHighlight = i === charCount - 1 || Math.random() > 0.85;
				char.style.color = isHighlight ? "#9d4edd" : "#00ffb7";

				column.appendChild(char);
			}
		};

		// Initial generation for all columns
		columns.forEach(generateChars);

		// Continuously regenerate columns
		const interval = setInterval(() => {
			columns.forEach((column) => {
				// Occasionally regenerate to keep it dynamic
				if (Math.random() > 0.65) {
					generateChars(column);
				}
			});
		}, 1500);

		// Cleanup
		return () => {
			clearInterval(interval);
			for (const col of columns) {
				col.remove();
			}
		};
	}, [columnCount]);

	return (
		<div
			ref={containerRef}
			className="absolute right-0 top-0 w-[20%] h-full pointer-events-none opacity-25"
			style={{
				maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,1) 100%)",
				WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,1) 100%)",
			}}
		>
			{/* Animated columns will be added here */}
		</div>
	);
}
