"use client";
import React from "react";
import { motion } from "framer-motion";
import { Heading } from "./ui/heading";
import { Subheading } from "./ui/subheading";
import { TypedMessage } from "./ui/typed-message";
import { 
  Github, 
  Linkedin, 
  Mail, 
  ExternalLink,
  Users,
  Brain,
  Zap,
  Heart
} from "lucide-react";
import Image from "next/image";

const teamMembers = [
  {
    name: "S Manvith Kumar",
    role: "Founder & Lead Developer",
    expertise: "Full-Stack Development, Open Source, Project Leadership",
    background: "Computer Science student at IIIT Kottayam, passionate about building open source solutions for the academic community.",
    contribution: "Founded Openverse to create better research collaboration opportunities and leads the technical development of the platform.",
    image: "https://i.postimg.cc/FK2c8Xw8/manchan.jpeg",
    social: {
      linkedin: "https://linkedin.com/in/manvith-sanisetty",
      github: "https://github.com/manvith12",
      email: "sanisettykumar24bcs0217@iiitkottayam.ac.in"
    },
    quote: "Building bridges between students and research opportunities through open source innovation.",
    skills: ["React/Next.js", "Full-Stack Development", "Open Source"],
    delay: 0.1
  },
  {
    name: "Sam Joe",
    role: "Backend Developer",
    expertise: "Backend Development, APIs, Database Design",
    background: "Sam is a backend developer who loves building robust APIs and scalable systems. He enjoys working with Node.js and cloud infrastructure.",
    contribution: "Develops and maintains the backend services powering Openverse, ensuring reliability and performance.",
    image: "/sam.jpeg",
    social: {
      linkedin: "https://www.linkedin.com/in/samjoe404",
      github: "https://github.com/KingRain",
      email: "contribute@openverse.org"
    },
    quote: "Great APIs are invisible, but their impact is everywhere.",
    skills: ["Node.js", "APIs", "Database Design", "Cloud"],
    delay: 0.15
  },
  {
    name: "Sudhanshu Rai",
    role: "Security Analyst",
    expertise: "Security Analysis, Penetration Testing, Cybersecurity",
    background: "Sudhanshu is a security analyst dedicated to keeping Openverse safe. He specializes in finding vulnerabilities and improving platform security.",
    contribution: "Ensures the security of Openverse by performing regular audits and implementing best practices.",
    image: "/sudhanshu.webp",
    social: {
      linkedin: "https://linkedin.com/in/sudhanshu-rai-5a3290335/",
      github: "https://github.com/SudhanshuRai356",
      email: "contribute@openverse.org"
    },
    quote: "Security is not a feature, it's a mindset.",
    skills: ["Security Analysis", "Penetration Testing", "Cybersecurity"],
    delay: 0.18
  },
  {
    name: "Could be You!",
    role: "Future Contributor",
    expertise: "Your Skills Here",
    background: "We're always looking for passionate developers, designers, and researchers to join our mission.",
    contribution: "Help us build the future of academic research collaboration and make education more accessible.",
    image: "/couldbeyou.jpg",
    social: {
      linkedin: "#contribute",
      github: "#contribute",
      email: "contribute@openverse.org"
    },
    quote: "Every great project starts with passionate contributors like you. Join us in making a difference!",
    skills: ["Your Skills", "Passion", "Innovation"],
    delay: 0.2
  },
  {
    name: "Could be You!",
    role: "Open Source Enthusiast",
    expertise: "Your Expertise",
    background: "Whether you're a student, researcher, or developer, there's a place for you in the Openverse community.",
    contribution: "Contribute code, design, documentation, or ideas to help improve research collaboration for everyone.",
    image: "/couldbeyou.jpg",
    social: {
      linkedin: "#contribute",
      github: "#contribute", 
      email: "contribute@openverse.org"
    },
    quote: "Open source thrives on diverse perspectives and fresh ideas. What will you bring to our community?",
    skills: ["Community", "Collaboration", "Impact"],
    delay: 0.3
  }
];

interface TeamMember {
  name: string;
  role: string;
  expertise: string;
  background: string;
  contribution: string;
  image: string;
  social: {
    linkedin: string;
    github: string;
    email: string;
  };
  quote: string;
  skills: string[];
  delay: number;
}

const TeamMemberCard: React.FC<{ member: TeamMember }> = ({ member }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay: member.delay,
        ease: [0.25, 0.25, 0, 1]
      }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.3 }
      }}
      className="group relative bg-gradient-to-br from-neutral-900/90 via-neutral-800/70 to-neutral-900/90 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-cyan-500/5 hover:shadow-cyan-500/20 hover:border-cyan-500/30 transition-all duration-500"
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-400/5 via-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Profile Image */}
      <div className="relative">
        <Image 
          src={member.image} 
          alt={member.name}
          width={400}
          height={256}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
            {member.name}
          </h3>
          <p className="text-cyan-400 font-semibold mb-1">{member.role}</p>
          <p className="text-sm text-neutral-400">{member.expertise}</p>
        </div>

        {/* Background */}
        <p className="text-neutral-300 text-sm leading-relaxed mb-6">
          {member.background}
        </p>

        {/* Skills */}
        <div className="mb-6">
          <p className="text-sm font-medium text-neutral-400 mb-3">Core Skills:</p>
          <div className="flex flex-wrap gap-2">
            {member.skills.map((skill: string, index: number) => (
              <span 
                key={index} 
                className="px-3 py-1 text-xs bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Quote */}
        <div className="mb-6 p-4 rounded-xl bg-neutral-800/50 border-l-4 border-cyan-500">
          <p className="text-sm italic text-neutral-300 leading-relaxed">
            "{member.quote}"
          </p>
        </div>

        {/* Social Links */}
        <div className="flex gap-3">
          <a
            href={member.social.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-neutral-800/50 border border-neutral-700/50 text-neutral-400 hover:text-white hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all duration-300"
          >
            <Github className="w-4 h-4" />
          </a>
          <a
            href={member.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-neutral-800/50 border border-neutral-700/50 text-neutral-400 hover:text-white hover:border-blue-500/50 hover:bg-blue-500/10 transition-all duration-300"
          >
            <Linkedin className="w-4 h-4" />
          </a>
          <a
            href={`mailto:${member.social.email}`}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-neutral-800/50 border border-neutral-700/50 text-neutral-400 hover:text-white hover:border-green-500/50 hover:bg-green-500/10 transition-all duration-300"
          >
            <Mail className="w-4 h-4" />
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export function AboutUs() {
  return (
    <section className="py-24 px-4 bg-gradient-to-br from-charcoal via-neutral-900 to-charcoal relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 via-transparent to-blue-500/5" />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        
        {/* Our Club Section */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6"
          >
            <Heart className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-300">Our Club</span>
          </motion.div>
          
          <Heading as="h2" className="text-4xl md:text-6xl font-bold mb-12">
            Welcome to <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Openverse</span>
          </Heading>
        </div>

        {/* Club Card with TypedMessage */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-neutral-900/90 via-neutral-800/70 to-neutral-900/90 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-cyan-500/5 hover:shadow-cyan-500/20 hover:border-cyan-500/30 transition-all duration-500 mb-20"
        >
          <div className="flex flex-col lg:flex-row">
            {/* Image Section */}
            <div className="lg:w-1/3 relative">
              <div className="relative h-64 lg:h-full min-h-[300px]">
                <Image
                  src="https://i.postimg.cc/mkYr3069/openverse2.png"
                  alt="Openverse Logo"
                  fill
                  className="object-contain p-8"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20" />
              </div>
            </div>
            
            {/* Content Section */}
            <div className="lg:w-2/3 p-8 lg:p-12">
              <div className="mb-6">
                <h3 className="text-3xl font-bold text-white mb-4">Openverse</h3>
                <div className="text-xl text-cyan-400 font-semibold mb-4">
                  <TypedMessage message="The Open Source Club of IIIT Kottayam" speed={80} />
                </div>
              </div>
              
              <div className="space-y-4 text-neutral-300 leading-relaxed">
                <p>
                  Openverse is the premier open source community at IIIT Kottayam, where innovation meets collaboration. 
                  We are passionate students and faculty members working together to create impactful solutions for the 
                  academic world and beyond.
                </p>
                <p>
                  Our club fosters a culture of learning, sharing, and building. From research collaboration platforms 
                  to educational tools, we develop open source projects that make a real difference in how students 
                  and educators interact with technology.
                </p>
                <p>
                  At Openverse, we believe in the power of open source to democratize technology and create opportunities 
                  for everyone. Whether you're a beginner or an expert, there's a place for you in our community.
                </p>
              </div>
              
              <div className="mt-8 flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 rounded-full text-sm font-medium">
                  Open Source
                </span>
                <span className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-full text-sm font-medium">
                  Research Collaboration
                </span>
                <span className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-full text-sm font-medium">
                  Innovation
                </span>
                <span className="px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-300 rounded-full text-sm font-medium">
                  Community
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 backdrop-blur-xl border border-cyan-500/20 rounded-3xl p-12 text-center max-w-4xl mx-auto mb-20"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
              <Brain className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          
          <h3 className="text-3xl font-bold text-white mb-6">Our Mission</h3>
          
          <p className="text-lg text-neutral-300 leading-relaxed mb-8">
            To bridge the gap between passionate students and groundbreaking faculty research, 
            creating a thriving ecosystem where academic curiosity meets real-world innovation. 
            We believe that every student has the potential to contribute to meaningful research, 
            and every faculty member deserves access to motivated, talented collaborators.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-cyan-400" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Innovation</h4>
              <p className="text-sm text-neutral-400">Fostering cutting-edge research</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Collaboration</h4>
              <p className="text-sm text-neutral-400">Connecting brilliant minds</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-3">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Excellence</h4>
              <p className="text-sm text-neutral-400">Driving academic achievement</p>
            </div>
          </div>
        </motion.div>

        {/* Our Team Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6"
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-300">Our Team</span>
          </motion.div>
          
          <Heading as="h2" className="text-4xl md:text-6xl font-bold mb-6">
            Meet the <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Contributors</span>
          </Heading>
          
          <Subheading className="text-xl text-neutral-300 max-w-3xl mx-auto leading-relaxed">
            The passionate individuals building the future of research collaboration
          </Subheading>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <TeamMemberCard key={index} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
}
