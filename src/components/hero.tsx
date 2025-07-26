"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heading } from "./ui/heading";
import { Subheading } from "./ui/subheading";
import { Button } from "./ui/button";
import { Cover } from "./ui/cover";
import StarBackground from "./ui/star-background";
import ShootingStars from "./ui/shooting-stars";
import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

export const Hero = () => {
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();

  const handleExploreClick = () => {
    if (isLoggedIn) {
      router.push('/projects');
    } else {
      router.push('/login');
    }
  };

  const handleLoginClick = () => {
    if (isLoggedIn) {
      // Redirect based on user role
      if (user?.role === 'teacher') {
        router.push('/teacher');
      } else {
        router.push('/projects');
      }
    } else {
      router.push('/login');
    }
  };
  return (
    <div className="min-h-screen overflow-hidden relative flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Openverse Logo - Top Left - Position below navbar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="absolute top-16 sm:top-20 md:top-24 lg:top-28 left-4 sm:left-6 z-20"
      >
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="https://i.postimg.cc/mkYr3069/openverse2.png"
            alt="Openverse Logo"
            width={40}
            height={40}
            className="w-10 h-10"
          />
          <span className="text-xl font-bold text-white hidden sm:block">
            Openverse
          </span>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <StarBackground />
        <ShootingStars />
      </motion.div>
      
      <Heading
        as="h1"
        className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-semibold max-w-7xl mx-auto text-center mt-6 relative z-10 py-6 leading-tight px-4"
      >
        Bridge the Gap Between <Cover>Research Dreams</Cover> and Reality
      </Heading>
      
      <Subheading className="text-center mt-2 md:mt-6 text-sm sm:text-base md:text-xl text-muted max-w-4xl mx-auto relative z-10 leading-relaxed px-4">
        Despite IIIT Kottayam being a premier research institute, talented students remain unaware of exciting opportunities while dedicated faculty struggle to find passionate collaborators. 
        <br className="hidden sm:block" />
        <span className="text-cyan-400 font-semibold">It's time to change that.</span>
      </Subheading>
      
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 items-center justify-center mt-8 relative z-10 px-4 w-full max-w-2xl mx-auto">
        <Button onClick={handleExploreClick} variant="primary" className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold min-w-[200px]">
          Explore Research Opportunities
        </Button>
        <Button onClick={handleLoginClick} variant="outline" className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg min-w-[140px]">
          {isLoggedIn ? (user?.role === 'teacher' ? 'Dashboard' : 'Projects') : 'Login'}
        </Button>
      </div>
      
      {/* Statistics Preview */}
      <motion.div 
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-12 sm:mt-16 max-w-4xl mx-auto relative z-10 px-4 w-full"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 2 }}
      >
        <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20">
          <div className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-2">347</div>
          <div className="text-xs sm:text-sm text-neutral-400">Active Projects</div>
        </div>
        <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
          <div className="text-2xl sm:text-3xl font-bold text-blue-400 mb-2">892</div>
          <div className="text-xs sm:text-sm text-neutral-400">Publications</div>
        </div>
        <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
          <div className="text-2xl sm:text-3xl font-bold text-purple-400 mb-2">₹12.3Cr</div>
          <div className="text-xs sm:text-sm text-neutral-400">Research Funding</div>
        </div>
        <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20">
          <div className="text-2xl sm:text-3xl font-bold text-green-400 mb-2">73%</div>
          <div className="text-xs sm:text-sm text-neutral-400">Student Participation</div>
        </div>
      </motion.div>
      
      <div className="absolute inset-x-0 bottom-0 h-40 sm:h-80 w-full bg-gradient-to-t from-charcoal to-transparent" />
    </div>
  );
};
