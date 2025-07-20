"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface OpportunityCardProps {
  professor: string;
  department: string;
  title: string;
  field: string;
  skills: string[];
  duration: string;
  description: string;
  compensation: string;
  featured?: boolean;
  delay?: number;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  professor,
  department,
  title,
  field,
  skills,
  duration,
  description,
  compensation,
  featured = false,
  delay = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.3 }
      }}
      className={cn(
        "group relative p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl",
        "bg-gradient-to-br from-neutral-900/90 via-neutral-800/70 to-neutral-900/90",
        "backdrop-blur-xl border",
        "shadow-2xl transition-all duration-300",
        featured 
          ? "border-cyan-500/50 shadow-cyan-500/20 ring-2 ring-cyan-500/20" 
          : "border-white/10 shadow-black/20 hover:border-cyan-500/30 hover:shadow-cyan-500/10",
        "h-full flex flex-col"
      )}
      style={{
        background: featured 
          ? "linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(59, 130, 246, 0.1) 50%, rgba(147, 51, 234, 0.1) 100%)"
          : "linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.7) 50%, rgba(15, 23, 42, 0.9) 100%)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Featured Badge */}
      {featured && (
        <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold">
            Featured Opportunity
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors leading-tight">
          {title}
        </h3>
        <div className="text-cyan-400 font-semibold mb-1 text-sm sm:text-base">{professor}</div>
        <div className="text-neutral-400 text-xs sm:text-sm">{department}</div>
      </div>

      {/* Field Tag */}
      <div className="mb-4">
        <span className="inline-block bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
          {field}
        </span>
      </div>

      {/* Skills */}
      <div className="mb-4 sm:mb-6 flex-grow">
        <h4 className="text-white font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Required Skills:</h4>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {skills.map((skill, index) => (
            <span 
              key={index}
              className="bg-neutral-700/50 border border-neutral-600/50 text-neutral-300 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="mb-3 sm:mb-4">
        <span className="text-neutral-400 text-xs sm:text-sm">Duration: </span>
        <span className="text-white font-semibold text-xs sm:text-sm">{duration}</span>
      </div>

      {/* Description */}
      <p className="text-neutral-300 mb-4 sm:mb-6 leading-relaxed flex-grow text-sm sm:text-base">
        {description}
      </p>

      {/* Compensation */}
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl">
        <div className="text-green-400 font-semibold text-xs sm:text-sm mb-1">Compensation:</div>
        <div className="text-white text-xs sm:text-sm">{compensation}</div>
      </div>

      {/* Apply Button */}
      <Button
        variant="primary"
        className={cn(
          "w-full py-2.5 sm:py-3 font-semibold transition-all duration-300 text-sm sm:text-base",
          featured 
            ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 shadow-lg shadow-cyan-500/25" 
            : "hover:shadow-lg hover:shadow-blue-500/25"
        )}
      >
        Apply Now
      </Button>

      {/* Glow effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-400/5 via-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  );
};
