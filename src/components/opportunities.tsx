"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heading } from "./ui/heading";
import { Subheading } from "./ui/subheading";
import { OpportunityCard } from "./ui/opportunity-card";

const opportunities = [
  {
    professor: "Dr. Sarah Chen",
    department: "Computer Science",
    title: "AI-Powered Healthcare Diagnostics",
    field: "Artificial Intelligence & Healthcare Technology",
    skills: ["Python", "Machine Learning", "TensorFlow", "Medical Imaging"],
    duration: "6 months (Part-time)",
    description: "Develop machine learning algorithms for early disease detection using medical imaging data. Students will work on cutting-edge deep learning models and contribute to potentially life-saving healthcare technology.",
    compensation: "Research credits + potential publication opportunities",
    featured: true
  },
  {
    professor: "Dr. Raj Patel",
    department: "Electronics & Communication",
    title: "Sustainable IoT Systems for Smart Cities",
    field: "Internet of Things & Environmental Engineering",
    skills: ["Arduino", "C++", "Sensor Networks", "Data Analysis"],
    duration: "4 months (Flexible hours)",
    description: "Design and implement IoT sensor networks for monitoring air quality and energy consumption in urban environments. Join a project with real-world impact on environmental sustainability.",
    compensation: "Stipend + industry mentorship"
  },
  {
    professor: "Dr. Maria Rodriguez",
    department: "Cybersecurity",
    title: "Blockchain for Secure Academic Credentials",
    field: "Blockchain Technology & Educational Systems",
    skills: ["Solidity", "Web3.js", "Cryptography", "System Design"],
    duration: "8 months (20 hrs/week)",
    description: "Build a decentralized system for secure academic credential verification. This project addresses global challenges in education authenticity and has potential for international deployment.",
    compensation: "Research grant + conference presentation opportunities"
  }
];

export const Opportunities = () => {
  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden" id="opportunities">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-purple-950/10 to-cyan-950/20" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Heading 
            as="h2" 
            size="xl"
            className="text-white mb-4 sm:mb-6 text-2xl sm:text-3xl lg:text-4xl"
          >
            Research Opportunities
          </Heading>
          <Subheading className="text-neutral-300 max-w-4xl mx-auto text-sm sm:text-base lg:text-lg">
            Discover exciting research projects that match your interests and skills. 
            Join cutting-edge research that makes a real-world impact.
          </Subheading>
        </motion.div>

        {/* Opportunities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
          {opportunities.map((opportunity, index) => (
            <OpportunityCard
              key={index}
              {...opportunity}
              delay={index * 0.2}
            />
          ))}
        </div>

        {/* Call to Action */}
        <motion.div 
          className="text-center mt-12 sm:mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <p className="text-neutral-300 mb-6 text-sm sm:text-base">
            Ready to start your research journey?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <button className="px-6 sm:px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/25 text-sm sm:text-base">
              Browse All Opportunities
            </button>
            <button className="px-6 sm:px-8 py-3 border border-white/20 text-white hover:border-cyan-500/50 hover:text-cyan-400 font-semibold rounded-xl transition-all duration-300 text-sm sm:text-base">
              Post a Project
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
