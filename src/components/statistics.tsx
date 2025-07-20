"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Heading } from "./ui/heading";
import { Subheading } from "./ui/subheading";
import { 
  TrendingUpIcon, 
  FileTextIcon, 
  DollarSignIcon, 
  UsersIcon,
  BookOpenIcon,
  AwardIcon,
  ClockIcon,
  StarIcon
} from "lucide-react";

interface CountUpProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}

const CountUp: React.FC<CountUpProps> = ({ end, duration = 2, suffix = "", prefix = "" }) => {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true });

  useEffect(() => {
    if (inView) {
      let start = 0;
      const increment = end / (duration * 60);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 1000 / 60);

      return () => clearInterval(timer);
    }
  }, [inView, end, duration]);

  return (
    <span ref={ref}>
      {prefix}{count}{suffix}
    </span>
  );
};

const StatCard = ({ 
  icon, 
  value, 
  label, 
  description, 
  delay = 0,
  suffix = "",
  prefix = ""
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  description: string;
  delay?: number;
  suffix?: string;
  prefix?: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="group relative p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl bg-gradient-to-br from-neutral-900/80 via-neutral-800/60 to-neutral-900/80 backdrop-blur-xl border border-white/10 hover:border-cyan-500/30 transition-all duration-300"
      style={{
        backdropFilter: "blur(20px)",
        boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
      }}
    >
      {/* Icon */}
      <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-lg sm:rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>

      {/* Value */}
      <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
        <CountUp end={value} suffix={suffix} prefix={prefix} />
      </div>

      {/* Label */}
      <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-white mb-2 sm:mb-3">{label}</h3>

      {/* Description */}
      <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">{description}</p>

      {/* Glow effect */}
      <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-cyan-400/5 via-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
};

const stats = [
  {
    icon: <TrendingUpIcon className="w-8 h-8 text-cyan-400" />,
    value: 347,
    label: "Active Research Projects",
    description: "Ongoing collaborative research initiatives across multiple departments and disciplines."
  },
  {
    icon: <FileTextIcon className="w-8 h-8 text-blue-400" />,
    value: 892,
    label: "Published Papers",
    description: "Research publications in prestigious journals and conferences in the last academic year."
  },
  {
    icon: <DollarSignIcon className="w-8 h-8 text-green-400" />,
    value: 12.3,
    label: "Research Funding Secured",
    suffix: " Crores",
    prefix: "₹",
    description: "Total research grants and funding secured from government and industry partners."
  },
  {
    icon: <UsersIcon className="w-8 h-8 text-purple-400" />,
    value: 45,
    label: "Industry Collaborations",
    description: "Active partnerships with leading technology companies and research organizations."
  },
  {
    icon: <BookOpenIcon className="w-8 h-8 text-orange-400" />,
    value: 73,
    label: "Student Participation Rate",
    suffix: "%",
    description: "Increase in student involvement in research activities since platform launch."
  },
  {
    icon: <ClockIcon className="w-8 h-8 text-pink-400" />,
    value: 4.2,
    label: "Average Project Duration",
    suffix: " months",
    description: "Typical timeframe for completion of student research projects."
  },
  {
    icon: <StarIcon className="w-8 h-8 text-yellow-400" />,
    value: 4.7,
    label: "Student Satisfaction Score",
    suffix: "/5.0",
    description: "Average rating from students who participated in research programs."
  },
  {
    icon: <AwardIcon className="w-8 h-8 text-indigo-400" />,
    value: 156,
    label: "Awards & Recognitions",
    description: "Academic awards and recognitions received by faculty and students for research excellence."
  }
];

const skillsData = [
  { name: "Python", percentage: 95, color: "from-blue-400 to-blue-600" },
  { name: "Machine Learning", percentage: 78, color: "from-purple-400 to-purple-600" },
  { name: "Data Analysis", percentage: 65, color: "from-green-400 to-green-600" },
  { name: "Research Methodology", percentage: 85, color: "from-orange-400 to-orange-600" }
];

export const Statistics = () => {
  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/10 via-blue-950/20 to-cyan-950/10" />
      
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
            Research Excellence in Numbers
          </Heading>
          <Subheading className="text-neutral-300 max-w-4xl mx-auto text-sm sm:text-base lg:text-lg">
            Our platform drives measurable impact in research collaboration, 
            fostering innovation and academic excellence across IIIT Kottayam.
          </Subheading>
        </motion.div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-20">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              {...stat}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Skills Section */}
        <div className="bg-gradient-to-br from-neutral-900/80 via-neutral-800/60 to-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8">
          <motion.h3 
            className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            Most In-Demand Research Skills
          </motion.h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {skillsData.map((skill, index) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="space-y-2 sm:space-y-3"
              >
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold text-sm sm:text-base">{skill.name}</span>
                  <span className="text-neutral-400 text-sm sm:text-base">{skill.percentage}%</span>
                </div>
                <div className="w-full bg-neutral-700/50 rounded-full h-2 sm:h-3 overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${skill.color} rounded-full`}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.percentage}%` }}
                    transition={{ duration: 1.5, delay: index * 0.2 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
