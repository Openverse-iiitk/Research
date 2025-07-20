"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const ModernCard: React.FC<ModernCardProps> = ({ 
  children, 
  className,
  delay = 0 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
      className={cn(
        "group relative p-8 rounded-3xl",
        "bg-gradient-to-br from-neutral-900/80 via-neutral-800/50 to-neutral-900/80",
        "backdrop-blur-xl border border-white/10",
        "shadow-2xl shadow-cyan-500/5",
        "hover:shadow-cyan-500/20 hover:border-cyan-500/30",
        "transition-all duration-300",
        className
      )}
      style={{
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 50%, rgba(15, 23, 42, 0.8) 100%)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
      }}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-400/5 via-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Corner accent */}
      <div className="absolute top-4 right-4 w-2 h-2 bg-cyan-400 rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
};

export const CardIcon = ({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) => {
  return (
    <div className={cn(
      "w-16 h-16 rounded-2xl mb-6",
      "bg-gradient-to-br from-cyan-500/20 to-blue-600/20",
      "border border-cyan-500/30",
      "flex items-center justify-center",
      "shadow-lg shadow-cyan-500/10",
      className
    )}>
      {children}
    </div>
  );
};

export const CardTitle = ({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) => {
  return (
    <h3 className={cn(
      "text-2xl font-bold text-white mb-4 leading-tight",
      className
    )}>
      {children}
    </h3>
  );
};

export const CardDescription = ({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) => {
  return (
    <p className={cn(
      "text-neutral-300 leading-relaxed text-base",
      className
    )}>
      {children}
    </p>
  );
};
