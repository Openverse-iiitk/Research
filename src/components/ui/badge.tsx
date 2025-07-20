"use client";
import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = "default", 
  className 
}) => {
  const variants = {
    default: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-transparent",
    secondary: "bg-neutral-800/50 text-neutral-300 border-white/10",
    destructive: "bg-red-500/20 text-red-400 border-red-500/30",
    outline: "bg-transparent text-neutral-300 border-white/20"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-colors",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
