"use client";

import { useRef, type ReactNode, type CSSProperties } from "react";

interface MotionCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}

export function MotionCard({ children, className = "", glowColor }: MotionCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateY = ((x - centerX) / centerX) * 6;
    const rotateX = -((y - centerY) / centerY) * 6;
    ref.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  }

  function handleMouseLeave() {
    if (!ref.current) return;
    ref.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
  }

  const style: CSSProperties = {
    transformStyle: "preserve-3d",
    transition: "transform 0.2s ease-out",
    ...(glowColor ? { boxShadow: `0 0 20px -5px ${glowColor}` } : {}),
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={style}
    >
      {children}
    </div>
  );
}
