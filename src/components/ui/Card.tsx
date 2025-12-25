import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    hover?: boolean;
}

export default function Card({ children, hover = false, className = '', ...props }: CardProps) {
    return (
        <div
            className={`
        bg-card rounded-2xl border border-border shadow-sm
        ${hover ? 'transition-all hover:shadow-md hover:scale-[1.02]' : ''}
        ${className}
      `}
            {...props}
        >
            {children}
        </div>
    );
}
