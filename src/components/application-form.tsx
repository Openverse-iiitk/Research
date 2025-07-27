"use client";
import React, { useState, Suspense } from "react";
import { motion } from "framer-motion";
import { ExternalLink, User, Mail, Hash, FileText, Send, ArrowLeft } from "lucide-react";
import { ModernCard } from "./ui/modern-card";
import { Button } from "./ui/button";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { createApplication } from "@/lib/project-api-wrapper";

interface FormData {
  name: string;
  phone: string;
  email: string;
  year: string;
  gpa: string;
  skills: string;
  reason: string;
  resumeLink: string;
  portfolioLink: string;
}

const ApplicationFormContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoggedIn } = useAuth();
  const projectId = searchParams.get('projectId');
  const projectTitle = searchParams.get('project') || 'Research Project';
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    email: user?.email || "",
    year: "",
    gpa: "",
    skills: "",
    reason: "",
    resumeLink: "",
    portfolioLink: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not logged in
  React.useEffect(() => {
    if (!isLoggedIn || user?.role !== 'student') {
      router.push('/login');
    }
    if (!projectId) {
      router.push('/projects');
    }
  }, [isLoggedIn, user, router, projectId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // This function is no longer needed, but keeping for now to avoid breaking changes
  };

  const validateGoogleDriveLink = (url: string): boolean => {
    if (!url) {
      return true; // Optional field
    }
    return url.includes('drive.google.com') || url.includes('docs.google.com');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.name || !formData.phone || !formData.email || !formData.year || !formData.gpa || !formData.reason) {
        throw new Error('Please fill in all required fields');
      }

      if (!projectId) {
        throw new Error('Project ID is missing');
      }

      // Validate Google Drive links if provided
      if (formData.resumeLink && !validateGoogleDriveLink(formData.resumeLink)) {
        throw new Error('Resume link must be a valid Google Drive or Google Docs link');
      }

      if (formData.portfolioLink && !validateGoogleDriveLink(formData.portfolioLink)) {
        throw new Error('Portfolio link must be a valid Google Drive or Google Docs link');
      }

      // Parse skills from comma-separated string
      const skillsArray = formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);

      // Create application using API wrapper
      const application = await createApplication({
        studentEmail: user?.email || formData.email,
        studentName: formData.name,
        studentPhone: formData.phone,
        projectId: projectId,
        projectTitle: projectTitle,
        coverLetter: formData.reason,
        skills: skillsArray,
        gpa: parseFloat(formData.gpa),
        year: formData.year,
        resumeLink: formData.resumeLink,
        portfolioLink: formData.portfolioLink
      });

      if (application && application.id) {
        setSubmitted(true);
      } else {
        throw new Error('Failed to submit application. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-900 pt-20 sm:pt-28 md:pt-32 lg:pt-36 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <ModernCard className="text-center p-8 sm:p-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Send className="w-10 h-10 text-white" />
              </motion.div>
              
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Application Submitted Successfully!
              </h1>
              
              <p className="text-neutral-300 mb-8 text-sm sm:text-base">
                Your application for <span className="text-cyan-400 font-semibold">"{projectTitle}"</span> has been submitted. 
                The professor will review your application and contact you soon.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button as={Link} href="/projects" variant="primary">
                  Browse More Projects
                </Button>
                <Button as={Link} href="/" variant="outline">
                  Back to Home
                </Button>
              </div>
            </ModernCard>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-900 pt-20 sm:pt-28 md:pt-32 lg:pt-36 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link 
            href="/projects"
            className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Projects
          </Link>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Apply for Research Project
          </h1>
          <p className="text-neutral-300 text-lg">
            Applying for: <span className="text-cyan-400 font-semibold">"{projectTitle}"</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <ModernCard className="p-6 sm:p-8 lg:p-10">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-white font-semibold mb-3 text-sm sm:text-base">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-neutral-800/50 border border-neutral-600 rounded-xl text-white placeholder-neutral-400 focus:border-cyan-500 focus:outline-none transition-colors text-sm sm:text-base"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-white font-semibold mb-3 text-sm sm:text-base">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-neutral-800/50 border border-neutral-600 rounded-xl text-white placeholder-neutral-400 focus:border-cyan-500 focus:outline-none transition-colors text-sm sm:text-base"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              {/* Year Field */}
              <div>
                <label className="block text-white font-semibold mb-3 text-sm sm:text-base">
                  Academic Year <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-4 bg-neutral-800/50 border border-neutral-600 rounded-xl text-white focus:border-cyan-500 focus:outline-none transition-colors text-sm sm:text-base"
                  >
                    <option value="">Select your year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Masters">Masters</option>
                    <option value="PhD">PhD</option>
                  </select>
                </div>
              </div>

              {/* GPA Field */}
              <div>
                <label className="block text-white font-semibold mb-3 text-sm sm:text-base">
                  GPA/CGPA <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="gpa"
                    value={formData.gpa}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    max="10"
                    required
                    className="w-full px-4 py-4 bg-neutral-800/50 border border-neutral-600 rounded-xl text-white placeholder-neutral-400 focus:border-cyan-500 focus:outline-none transition-colors text-sm sm:text-base"
                    placeholder="Enter your GPA (out of 10)"
                  />
                </div>
              </div>

              {/* Skills Field */}
              <div>
                <label className="block text-white font-semibold mb-3 text-sm sm:text-base">
                  Relevant Skills <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-4 bg-neutral-800/50 border border-neutral-600 rounded-xl text-white placeholder-neutral-400 focus:border-cyan-500 focus:outline-none transition-colors text-sm sm:text-base"
                    placeholder="Enter relevant skills (comma-separated)"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-white font-semibold mb-3 text-sm sm:text-base">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-neutral-800/50 border border-neutral-600 rounded-xl text-white placeholder-neutral-400 focus:border-cyan-500 focus:outline-none transition-colors text-sm sm:text-base"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              {/* Reason Field */}
              <div>
                <label className="block text-white font-semibold mb-3 text-sm sm:text-base">
                  Why do you think you are fit for this project? <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-4 text-neutral-400 w-5 h-5" />
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full pl-12 pr-4 py-4 bg-neutral-800/50 border border-neutral-600 rounded-xl text-white placeholder-neutral-400 focus:border-cyan-500 focus:outline-none transition-colors resize-none text-sm sm:text-base"
                    placeholder="Explain your relevant skills, experience, and motivation for this project..."
                  />
                </div>
              </div>

              {/* Resume/CV Google Drive Link */}
              <div>
                <label className="block text-white font-semibold mb-3 text-sm sm:text-base">
                  Resume/CV Google Drive Link <span className="text-neutral-400">(Optional)</span>
                </label>
                <div className="relative">
                  <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                  <input
                    type="url"
                    name="resumeLink"
                    value={formData.resumeLink}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 bg-neutral-800/50 border border-neutral-600 rounded-xl text-white placeholder-neutral-400 focus:border-cyan-500 focus:outline-none transition-colors text-sm sm:text-base"
                    placeholder="https://drive.google.com/file/d/..."
                  />
                </div>
                <p className="text-neutral-400 text-xs mt-2">
                  Share your resume via Google Drive with view access for anyone with the link
                </p>
              </div>

              {/* Portfolio Google Drive Link */}
              <div>
                <label className="block text-white font-semibold mb-3 text-sm sm:text-base">
                  Portfolio/Projects Link <span className="text-neutral-400">(Optional)</span>
                </label>
                <div className="relative">
                  <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                  <input
                    type="url"
                    name="portfolioLink"
                    value={formData.portfolioLink}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 bg-neutral-800/50 border border-neutral-600 rounded-xl text-white placeholder-neutral-400 focus:border-cyan-500 focus:outline-none transition-colors text-sm sm:text-base"
                    placeholder="https://drive.google.com/folder/d/..."
                  />
                </div>
                <p className="text-neutral-400 text-xs mt-2">
                  Share your portfolio, projects, or additional documents via Google Drive
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <motion.button
                  type="submit"
                  disabled={isSubmitting || !formData.name || !formData.phone || !formData.email || !formData.year || !formData.gpa || !formData.skills || !formData.reason}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-lg py-4 rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                      Submitting Application...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Send className="w-6 h-6 mr-3" />
                      Submit Application
                    </div>
                  )}
                </motion.button>
              </div>
            </form>
          </ModernCard>
        </motion.div>
      </div>
    </div>
  );
};

export const ApplicationForm: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-900 pt-20 sm:pt-28 md:pt-32 lg:pt-36 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-neutral-400">Loading application form...</p>
          </div>
        </div>
      </div>
    }>
      <ApplicationFormContent />
    </Suspense>
  );
};
