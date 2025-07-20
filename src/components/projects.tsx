"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ModernCard } from "./ui/modern-card";
import { Badge } from "./ui/badge";
import { User, Calendar, MapPin, DollarSign, Clock, BookOpen, Search, Filter, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { projectAPI } from "@/lib/api";

// Local types
interface TeacherPost {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  duration: string;
  location: string;
  maxStudents: number;
  status: 'draft' | 'active' | 'closed';
  createdDate: string;
  authorEmail: string;
  authorName: string;
  department: string;
  stipend?: string;
  deadline: string;
  applications: any[];
  views: number;
}

interface ProjectItem {
  id: string;
  title: string;
  professor: string;
  department: string;
  duration: string;
  stipend?: string;
  deadline: string;
  description: string;
  skills: string[];
  type: 'project' | 'hackathon' | 'conference';
  location?: string;
  views?: number;
}

export const Projects = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("deadline");
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [showAllHackathons, setShowAllHackathons] = useState(false);
  const [showAllConferences, setShowAllConferences] = useState(false);
  const [realPosts, setRealPosts] = useState<TeacherPost[]>([]);
  
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();

    // Load real posts from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const apiProjects = await projectAPI.getAll();
        if (apiProjects && apiProjects.length > 0) {
          // Convert API response to TeacherPost format
          const convertedPosts: TeacherPost[] = apiProjects.map((project: any) => ({
            id: project.id,
            title: project.title,
            description: project.description,
            requirements: project.requirements || [],
            duration: project.duration,
            location: project.location,
            maxStudents: project.max_students,
            status: project.status,
            createdDate: project.created_at,
            authorEmail: project.teacher_email,
            authorName: project.teacher_name,
            department: project.department,
            deadline: project.deadline,
            stipend: project.stipend,
            applications: [], // Will be loaded separately if needed
            views: project.views || 0
          }));
          setRealPosts(convertedPosts);
        } else {
          setRealPosts([]);
        }
      } catch (error) {
        console.error('Error fetching projects from API:', error);
        setRealPosts([]);
      }
    };

    fetchProjects();
  }, []);

  // Convert TeacherPost to ProjectItem format
  const convertToProjectItem = (post: TeacherPost): ProjectItem => ({
    id: post.id,
    title: post.title,
    professor: post.authorName,
    department: post.department,
    duration: post.duration,
    stipend: post.stipend,
    deadline: post.deadline,
    description: post.description,
    skills: post.requirements,
    type: 'project',
    location: post.location,
    views: post.views
  });

  // Sample hackathons and conferences (static for now)
  const staticHackathons: ProjectItem[] = [
    {
      id: "h1",
      type: 'hackathon',
      title: "Smart India Hackathon 2025",
      professor: "Multiple Mentors",
      department: "All Departments",
      duration: "48 hours",
      deadline: "2025-01-25",
      description: "National level hackathon focusing on innovative solutions for smart cities, healthcare, and education.",
      skills: ["Innovation", "Problem Solving", "Teamwork", "Technology"]
    },
    {
      id: "h2",
      type: 'hackathon',
      title: "FinTech Innovation Challenge",
      professor: "Industry Experts",
      department: "Computer Science & Engineering",
      duration: "36 hours",
      deadline: "2025-02-08",
      description: "Build innovative financial technology solutions. Focus on digital payments, blockchain, and financial inclusion.",
      skills: ["FinTech", "Blockchain", "Mobile Development", "UI/UX"]
    },
    {
      id: "h3",
      type: 'hackathon',
      title: "Sustainability Hack 2025",
      professor: "Environmental Tech Team",
      department: "All Departments",
      duration: "24 hours",
      deadline: "2025-02-15",
      description: "Create technology solutions for environmental challenges. Focus on climate change, waste management, and green energy.",
      skills: ["Environmental Tech", "IoT", "Data Analytics", "Sustainability"]
    }
  ];

  const staticConferences: ProjectItem[] = [
    {
      id: "c1",
      type: 'conference',
      title: "International Conference on Machine Learning",
      professor: "Conference Organizers",
      department: "Computer Science & Engineering",
      duration: "3 days",
      deadline: "2025-02-01",
      description: "Premier conference for machine learning research and applications. Present your research and network with experts.",
      skills: ["Research", "Machine Learning", "Academic Writing", "Presentation"]
    },
    {
      id: "c2",
      type: 'conference',
      title: "IEEE Conference on Cybersecurity",
      professor: "IEEE Committee",
      department: "Computer Science & Engineering",
      duration: "2 days",
      deadline: "2025-02-12",
      description: "Latest developments in cybersecurity, network security, and digital forensics.",
      skills: ["Cybersecurity", "Network Security", "Research", "Digital Forensics"]
    }
  ];

  // Combine all items
  const realProjectItems = realPosts.map(convertToProjectItem);
  const allItems: ProjectItem[] = [...realProjectItems, ...staticHackathons, ...staticConferences];

  // Filter and sort logic
  const filteredItems = allItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.professor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case "deadline":
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      case "title":
        return a.title.localeCompare(b.title);
      case "department":
        return a.department.localeCompare(b.department);
      default:
        return 0;
    }
  });

  const projects = sortedItems.filter(item => item.type === 'project');
  const hackathons = sortedItems.filter(item => item.type === 'hackathon');
  const conferences = sortedItems.filter(item => item.type === 'conference');

  const displayedProjects = showAllProjects ? projects : projects.slice(0, 6);
  const displayedHackathons = showAllHackathons ? hackathons : hackathons.slice(0, 6);
  const displayedConferences = showAllConferences ? conferences : conferences.slice(0, 6);

  const handleApply = (item: ProjectItem) => {
    if (item.type === 'project') {
      // Only research projects require application form
      if (!isLoggedIn) {
        router.push('/login');
        return;
      }
      router.push(`/apply?projectId=${encodeURIComponent(item.id)}&project=${encodeURIComponent(item.title)}`);
    } else {
      // For hackathons and conferences, just show a message or redirect to external link
      alert(`Registration for ${item.type} "${item.title}" would redirect to external platform.`);
    }
  };

  const renderProjectCard = (item: ProjectItem, index: number) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="h-full"
    >
      <ModernCard className="h-full p-4 sm:p-6 lg:p-8 hover:scale-105 transition-transform duration-300">
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 leading-tight">
              {item.title}
            </h3>
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed line-clamp-3">
              {item.description}
            </p>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center space-x-2 text-neutral-400">
              <User className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm">{item.professor}</span>
            </div>
            <div className="flex items-center space-x-2 text-neutral-400">
              <BookOpen className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm">{item.department}</span>
            </div>
            <div className="flex items-center space-x-2 text-neutral-400">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm">{item.duration}</span>
            </div>
            {item.stipend && (
              <div className="flex items-center space-x-2 text-green-400">
                <DollarSign className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-semibold">{item.stipend}</span>
              </div>
            )}
            <div className="flex items-center space-x-2 text-orange-400">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm">Deadline: {new Date(item.deadline).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {item.skills.map((skill, skillIndex) => (
                <Badge key={skillIndex} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleApply(item)}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 text-sm sm:text-base"
            >
              {item.type === 'project' ? 'Apply Now' : 'Register'}
            </motion.button>
          </div>
        </div>
      </ModernCard>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-900 pt-28 sm:pt-32 lg:pt-36">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
        {/* Header with Search and Sort */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 text-center">
            Research Opportunities
          </h1>
          <p className="text-neutral-300 text-center mb-6 sm:mb-8 max-w-3xl mx-auto text-sm sm:text-base lg:text-lg">
            Discover amazing research projects, hackathons, and conferences to advance your academic journey.
          </p>

          {/* My Applications Button for Students */}
          {isLoggedIn && user?.role === 'student' && (
            <div className="flex justify-center mb-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/my-applications')}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
              >
                My Applications
              </motion.button>
            </div>
          )}

          {/* Search and Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search projects, professors, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-neutral-800/50 border border-neutral-600 rounded-xl text-white placeholder-neutral-400 focus:border-cyan-500 focus:outline-none transition-colors text-sm sm:text-base"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-10 pr-8 py-3 bg-neutral-800/50 border border-neutral-600 rounded-xl text-white focus:border-cyan-500 focus:outline-none transition-colors text-sm sm:text-base min-w-[160px]"
              >
                <option value="deadline">Sort by Deadline</option>
                <option value="title">Sort by Title</option>
                <option value="department">Sort by Department</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>
        </motion.div>

        {/* Projects Section */}
        <motion.section
          id="projects"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12 sm:mb-16 scroll-mt-32"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Research Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {displayedProjects.map((project, index) => renderProjectCard(project, index))}
          </div>
          {projects.length > 6 && (
            <div className="text-center mt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAllProjects(!showAllProjects)}
                className="bg-gradient-to-r from-neutral-700 to-neutral-600 hover:from-neutral-600 hover:to-neutral-500 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg"
              >
                {showAllProjects ? 'Show Less' : `Show All Projects (${projects.length})`}
              </motion.button>
            </div>
          )}
        </motion.section>

        {/* Hackathons Section */}
        <motion.section
          id="hackathons"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12 sm:mb-16 scroll-mt-32"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Hackathons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {displayedHackathons.map((hackathon, index) => renderProjectCard(hackathon, index))}
          </div>
          {hackathons.length > 6 && (
            <div className="text-center mt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAllHackathons(!showAllHackathons)}
                className="bg-gradient-to-r from-neutral-700 to-neutral-600 hover:from-neutral-600 hover:to-neutral-500 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg"
              >
                {showAllHackathons ? 'Show Less' : `Show All Hackathons (${hackathons.length})`}
              </motion.button>
            </div>
          )}
        </motion.section>

        {/* Conferences Section */}
        <motion.section
          id="conferences"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-12 sm:mb-16 scroll-mt-32"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Conferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {displayedConferences.map((conference, index) => renderProjectCard(conference, index))}
          </div>
          {conferences.length > 6 && (
            <div className="text-center mt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAllConferences(!showAllConferences)}
                className="bg-gradient-to-r from-neutral-700 to-neutral-600 hover:from-neutral-600 hover:to-neutral-500 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg"
              >
                {showAllConferences ? 'Show Less' : `Show All Conferences (${conferences.length})`}
              </motion.button>
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
};
