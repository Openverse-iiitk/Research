"use client";
import React, { useEffect, useState, useRef } from "react";

interface ShootingStar {
  id: number;
  x: number;
  y: number;
  angle: number;
  scale: number;
  speed: number;
  distance: number;
}

const getRandomStartPoint = () => {
  const side = Math.floor(Math.random() * 4);
  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
  const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 1000;
  const offset = Math.random();

  switch (side) {
    case 0: // Top edge
      return { x: offset * windowWidth, y: -50, angle: Math.random() * 60 + 45 };
    case 1: // Right edge
      return { x: windowWidth + 50, y: offset * windowHeight, angle: Math.random() * 60 + 135 };
    case 2: // Bottom edge
      return { x: offset * windowWidth, y: windowHeight + 50, angle: Math.random() * 60 + 225 };
    case 3: // Left edge
      return { x: -50, y: offset * windowHeight, angle: Math.random() * 60 + 315 };
    default:
      return { x: 0, y: 0, angle: 45 };
  }
};

const ShootingStars: React.FC = () => {
  const [stars, setStars] = useState<ShootingStar[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const createStar = () => {
      const { x, y, angle } = getRandomStartPoint();
      const newStar: ShootingStar = {
        id: Date.now() + Math.random(),
        x,
        y,
        angle,
        scale: Math.random() * 0.8 + 0.4,
        speed: Math.random() * 3 + 2,
        distance: 0,
      };
      
      setStars(prev => [...prev, newStar]);

      // More frequent shooting stars
      const randomDelay = Math.random() * 1500 + 800; // 0.8-2.3s intervals
      setTimeout(createStar, randomDelay);
    };

    createStar();
    
    return () => {
      setStars([]);
    };
  }, []);

  useEffect(() => {
    const animate = () => {
      setStars(prev => prev.map(star => ({
        ...star,
        distance: star.distance + star.speed
      })).filter(star => star.distance < 800)); // Remove stars that have traveled far enough

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <svg
      className="absolute inset-0 h-full w-full pointer-events-none z-10"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="mainTrailGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#ffffff", stopOpacity: 0 }} />
          <stop offset="5%" style={{ stopColor: "#22d3ee", stopOpacity: 0.2 }} />
          <stop offset="15%" style={{ stopColor: "#06b6d4", stopOpacity: 0.5 }} />
          <stop offset="35%" style={{ stopColor: "#3b82f6", stopOpacity: 0.8 }} />
          <stop offset="55%" style={{ stopColor: "#8b5cf6", stopOpacity: 0.9 }} />
          <stop offset="75%" style={{ stopColor: "#ec4899", stopOpacity: 0.7 }} />
          <stop offset="90%" style={{ stopColor: "#f97316", stopOpacity: 0.4 }} />
          <stop offset="100%" style={{ stopColor: "#ffffff", stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="glowTrailGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: "#22d3ee", stopOpacity: 0 }} />
          <stop offset="20%" style={{ stopColor: "#06b6d4", stopOpacity: 0.3 }} />
          <stop offset="50%" style={{ stopColor: "#3b82f6", stopOpacity: 0.6 }} />
          <stop offset="80%" style={{ stopColor: "#8b5cf6", stopOpacity: 0.8 }} />
          <stop offset="100%" style={{ stopColor: "#ffffff", stopOpacity: 1 }} />
        </linearGradient>
        <radialGradient id="starHead" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style={{ stopColor: "#ffffff", stopOpacity: 1 }} />
          <stop offset="30%" style={{ stopColor: "#22d3ee", stopOpacity: 0.9 }} />
          <stop offset="70%" style={{ stopColor: "#3b82f6", stopOpacity: 0.6 }} />
          <stop offset="100%" style={{ stopColor: "#8b5cf6", stopOpacity: 0.2 }} />
        </radialGradient>
      </defs>
      
      {stars.map((star) => {
        const currentX = star.x + Math.cos((star.angle * Math.PI) / 180) * star.distance;
        const currentY = star.y + Math.sin((star.angle * Math.PI) / 180) * star.distance;
        const trailLength = 100 * star.scale;
        const trailStartX = currentX - Math.cos((star.angle * Math.PI) / 180) * trailLength;
        const trailStartY = currentY - Math.sin((star.angle * Math.PI) / 180) * trailLength;
        
        // Calculate opacity based on distance traveled
        const opacity = Math.max(0, 1 - (star.distance / 600));
        
        return (
          <g key={star.id}>
            {/* Outer glow trail */}
            <line
              x1={trailStartX + Math.cos((star.angle * Math.PI) / 180) * trailLength * 0.1}
              y1={trailStartY + Math.sin((star.angle * Math.PI) / 180) * trailLength * 0.1}
              x2={currentX}
              y2={currentY}
              stroke="url(#glowTrailGradient)"
              strokeWidth={8 * star.scale}
              strokeLinecap="round"
              opacity={opacity * 0.3}
              filter="blur(1px)"
            />
            
            {/* Main shooting star trail */}
            <line
              x1={trailStartX}
              y1={trailStartY}
              x2={currentX}
              y2={currentY}
              stroke="url(#mainTrailGradient)"
              strokeWidth={4 * star.scale}
              strokeLinecap="round"
              opacity={opacity * 0.9}
            />
            
            {/* Inner bright trail */}
            <line
              x1={trailStartX + Math.cos((star.angle * Math.PI) / 180) * trailLength * 0.6}
              y1={trailStartY + Math.sin((star.angle * Math.PI) / 180) * trailLength * 0.6}
              x2={currentX}
              y2={currentY}
              stroke="url(#glowTrailGradient)"
              strokeWidth={2 * star.scale}
              strokeLinecap="round"
              opacity={opacity * 0.7}
            />
            
            {/* Bright head with gradient */}
            <circle
              cx={currentX}
              cy={currentY}
              r={3 * star.scale}
              fill="url(#starHead)"
              opacity={opacity * 0.9}
            />
            
            {/* Core bright center */}
            <circle
              cx={currentX}
              cy={currentY}
              r={1.5 * star.scale}
              fill="#ffffff"
              opacity={opacity * 0.9}
            />
          </g>
        );
      })}
    </svg>
  );
};

export default ShootingStars;
