'use client';

import React, { useRef, useEffect, useState } from 'react';

interface GlowingBorderProps {
  children: React.ReactNode;
  className?: string;
  blur?: number;
  variant?: 'default' | 'white';
  glow?: boolean;
  disabled?: boolean;
  movementDuration?: number;
  borderWidth?: number;
}

export default function GlowingBorder({
  children,
  className = '',
  blur = 0,
  variant = 'default',
  glow = false,
  disabled = false,
  movementDuration = 2,
  borderWidth = 1
}: GlowingBorderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || disabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePosition({ x, y });
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [disabled]);

  const gradientColors = variant === 'white' 
    ? 'from-white via-gray-300 to-white'
    : 'from-blue-500 via-purple-500 to-cyan-500';

  const glowStyle = {
    background: `conic-gradient(from ${mousePosition.x + mousePosition.y}deg at ${mousePosition.x}px ${mousePosition.y}px, 
      ${variant === 'white' ? '#ffffff, #e5e7eb, #ffffff' : '#3b82f6, #8b5cf6, #06b6d4, #10b981, #f59e0b'})`
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-lg ${className}`}
      style={{
        padding: `${borderWidth}px`
      }}
    >
      {/* Glowing border effect */}
      <div
        className={`absolute inset-0 rounded-lg transition-opacity duration-300 ${
          (isHovered || glow) && !disabled ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          ...glowStyle,
          filter: blur > 0 ? `blur(${blur}px)` : 'none',
          animationDuration: `${movementDuration}s`
        }}
      />
      
      {/* Content container */}
      <div className="relative z-10 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-lg min-h-full w-full overflow-y-auto">
        {children}
      </div>
    </div>
  );
}