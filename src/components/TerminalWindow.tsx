import { ReactNode, HTMLAttributes } from "react";

interface TerminalWindowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
    children: ReactNode;
    header?: string;
    className?: string;
}

export function TerminalWindow({
    children,
    header = "[jamal@future ~]$",
    className = "",
    ...props
}: TerminalWindowProps) {
    return (
        <div
            className={`border border-border bg-muted/50 backdrop-blur-sm box-glow p-6 font-mono ${className}`}
            {...props}
        >
            {header && (
                <div className="text-terminal mb-4 pb-2 border-b border-border">
                    {header}
                </div>
            )}
            <div className="text-text">{children}</div>
        </div>
    );
}

