"use client";
import React from "react";
import { motion } from "framer-motion";
import { Heading } from "./ui/heading";
import { Subheading } from "./ui/subheading";
import { ModernCard, CardIcon, CardTitle, CardDescription } from "./ui/modern-card";
import { 
  SearchIcon, 
  UsersIcon, 
  TrendingUpIcon, 
  BookOpenIcon,
  AlertTriangleIcon,
  TargetIcon
} from "lucide-react";

const problems = [
  {
    icon: <AlertTriangleIcon className="w-8 h-8 text-red-400" />,
    title: "Student Perspective",
    description: "Talented students with passion for research often remain unaware of exciting projects that match their interests and skills, leading to missed opportunities for academic and professional growth."
  },
  {
    icon: <UsersIcon className="w-8 h-8 text-orange-400" />,
    title: "Faculty Perspective", 
    description: "Dedicated researchers struggle to find qualified, motivated students for their projects, resulting in delayed research timelines and reduced project impact."
  },
  {
    icon: <TrendingUpIcon className="w-8 h-8 text-yellow-400" />,
    title: "Institutional Impact",
    description: "This communication breakdown limits the institution's research output, reduces collaborative opportunities, and diminishes the overall academic reputation of IIIT Kottayam."
  },
  {
    icon: <BookOpenIcon className="w-8 h-8 text-purple-400" />,
    title: "Broader Implications",
    description: "The lack of efficient research matchmaking affects funding opportunities, publication rates, industry partnerships, and the institution's standing in academic rankings."
  }
];

const solutions = [
  {
    icon: <SearchIcon className="w-8 h-8 text-cyan-400" />,
    title: "Opportunity Discovery Engine",
    description: "Advanced search and filtering system that matches students with relevant research projects based on skills, interests, academic level, and availability."
  },
  {
    icon: <TargetIcon className="w-8 h-8 text-blue-400" />,
    title: "Faculty Project Management",
    description: "Intuitive interface for faculty to post detailed project descriptions, requirements, timelines, and application processes."
  }
];

export const Features = () => {
  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden" id="features">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/5 to-transparent" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center mb-12 sm:mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Heading 
            as="h2" 
            size="xl"
            className="text-white mb-4 sm:mb-6 text-2xl sm:text-3xl lg:text-4xl"
          >
            Understanding the Research Gap
          </Heading>
          <Subheading className="text-neutral-300 max-w-4xl mx-auto text-sm sm:text-base lg:text-lg">
            Despite IIIT Kottayam being a research institute, very few are aware of this potential. 
            We need to bridge the gap and increase research collaboration between faculty and students.
          </Subheading>
        </motion.div>

        {/* Problems Section */}
        <div className="mb-12 sm:mb-20">
          <motion.h3 
            className="text-xl sm:text-2xl lg:text-3xl font-bold text-center text-white mb-8 sm:mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            The Current Challenges
          </motion.h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {problems.map((problem, index) => (
              <ModernCard key={index} delay={index * 0.1}>
                <CardIcon>
                  {problem.icon}
                </CardIcon>
                <CardTitle className="text-lg sm:text-xl lg:text-2xl">{problem.title}</CardTitle>
                <CardDescription className="text-sm sm:text-base">{problem.description}</CardDescription>
              </ModernCard>
            ))}
          </div>
        </div>

        {/* Solutions Section */}
        <div>
          <motion.h3 
            className="text-xl sm:text-2xl lg:text-3xl font-bold text-center text-white mb-8 sm:mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            Our Solution
          </motion.h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {solutions.map((solution, index) => (
              <ModernCard key={index} delay={index * 0.1}>
                <CardIcon>
                  {solution.icon}
                </CardIcon>
                <CardTitle className="text-lg sm:text-xl lg:text-2xl">{solution.title}</CardTitle>
                <CardDescription className="text-sm sm:text-base">{solution.description}</CardDescription>
              </ModernCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
