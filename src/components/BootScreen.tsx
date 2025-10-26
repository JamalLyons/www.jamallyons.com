import { useState, useEffect, useRef } from "react";

interface BootScreenProps {
    onBoot: () => void;
}

export function BootScreen({ onBoot }: BootScreenProps) {
    const [password, setPassword] = useState("");
    const [isBooting, setIsBooting] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleBoot = () => {
        if (password.trim() && !isBooting) {
            setIsBooting(true);

            // Add flicker effect delay
            setTimeout(() => {
                onBoot();
            }, 500);
        }
    };

    // Matrix-style background animation
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&*()[]{}/+-=<>?~`@0123456789"\'|\\:;.,!?^°±§×÷∞∑µ∂∏∆∇Ωαβγδεζηθικλμνξοπρστυφχψω';
        const fontSize = 14;
        const columns = Math.floor(canvas.width / fontSize);
        const drops: number[] = Array(columns).fill(0);

        function draw() {
            if (!ctx || !canvas) return;

            // Set font
            ctx.font = `${fontSize}px monospace`;

            // Fade effect for trailing
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Darker grid pattern
            ctx.fillStyle = '#0b0b0f';
            for (let i = 0; i < canvas.width; i += 20) {
                ctx.fillRect(i, 0, 1, canvas.height);
            }
            for (let i = 0; i < canvas.height; i += 20) {
                ctx.fillRect(0, i, canvas.width, 1);
            }

            drops.forEach((drop, i) => {
                const text = chars[Math.floor(Math.random() * chars.length)];
                const x = i * fontSize;

                // Gradient effect - brighter at top
                const opacity = Math.max(0.1, 1 - (drop * fontSize / canvas.height));

                ctx.fillStyle = i % 3 === 0 ? `rgba(157, 78, 221, ${opacity})` : `rgba(0, 255, 183, ${opacity})`;
                ctx.fillText(text, x, drop * fontSize);

                // Reset if past bottom, otherwise move down
                if (drop * fontSize > canvas.height && Math.random() > 0.96) {
                    drops[i] = 0;
                }
                drops[i]++;
            });
        }

        const interval = setInterval(draw, 50);

        // Handle window resize
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className="w-screen h-screen bg-black relative overflow-hidden">
            {/* Animated background canvas */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 pointer-events-none"
            />

            {/* Scanlines overlay */}
            <div className="absolute inset-0 scanlines pointer-events-none" />

            {/* Center content */}
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${isBooting ? 'opacity-0' : 'opacity-100'}`}>
                <div className="text-center space-y-6 relative z-10">
                    {/* Flickering title effect */}
                    <div className="text-accent-glow text-6xl font-bold font-mono mb-20 relative animate-pulse">
                        <span className="drop-shadow-[0_0_20px_rgba(157,78,221,0.8)]">Jamal's OS</span>
                        <div className="absolute inset-0 text-accent-glow animate-ping opacity-25 blur-sm">Jamal's OS</div>
                    </div>

                    {/* Terminal-style boot message */}
                    <div className="text-terminal/80 text-sm font-mono mb-12 animate-fade-in">
                        &gt; System Ready | Initializing Secure Boot Protocol
                    </div>

                    <div className="space-y-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && password.trim()) {
                                    handleBoot();
                                }
                            }}
                            placeholder="Enter password..."
                            className="bg-background/90 border-2 border-accent/50 text-text px-4 py-3 font-mono focus:outline-none focus:border-accent focus:box-glow transition-all w-64 backdrop-blur-sm"
                            autoFocus
                            disabled={isBooting}
                        />

                        <div className="pt-6">
                            <button
                                onClick={handleBoot}
                                disabled={!password.trim() || isBooting}
                                className={`font-mono px-8 py-3 border-2 transition-all relative ${password.trim() && !isBooting
                                    ? 'border-terminal text-terminal hover:border-accent-glow hover:text-accent-glow box-glow-hover cursor-pointer'
                                    : 'border-border/30 text-text/30 cursor-not-allowed'
                                    }`}
                            >
                                <span className="relative z-10">&gt; BOOT MACHINE</span>
                                {password.trim() && !isBooting && (
                                    <span className="absolute inset-0 border-2 border-terminal animate-ping opacity-20" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

