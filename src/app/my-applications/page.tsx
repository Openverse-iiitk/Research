"use client";
import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, CheckCircle, XCircle, Calendar, MapPin, User } from "lucide-react";
import { useEffect } from "react";

interface Application {
  id: string;
  projectTitle: string;
  projectType: 'project' | 'hackathon' | 'conference';
  status: 'pending' | 'accepted' | 'rejected';
  appliedDate: string;
  description: string;
  location?: string;
  supervisor?: string;
}

// Mock data for applications
const mockApplications: Application[] = [
  {
    id: '1',
    projectTitle: 'AI-Powered Medical Diagnosis System',
    projectType: 'project',
    status: 'pending',
    appliedDate: '2025-01-15',
    description: 'Developing machine learning models for early disease detection using medical imaging data.',
    supervisor: 'Dr. Sarah Johnson'
  },
  {
    id: '2',
    projectTitle: 'TechCrunch Disrupt 2025',
    projectType: 'hackathon',
    status: 'accepted',
    appliedDate: '2025-01-10',
    description: 'Build innovative solutions for sustainable technology in 48 hours.',
    location: 'San Francisco, CA'
  },
  {
    id: '3',
    projectTitle: 'International Conference on Machine Learning',
    projectType: 'conference',
    status: 'rejected',
    appliedDate: '2025-01-05',
    description: 'Premier conference for machine learning research and applications.',
    location: 'Vienna, Austria'
  },
  {
    id: '4',
    projectTitle: 'Blockchain Supply Chain Management',
    projectType: 'project',
    status: 'accepted',
    appliedDate: '2025-01-12',
    description: 'Creating a transparent and efficient supply chain system using blockchain technology.',
    supervisor: 'Prof. Michael Chen'
  },
  {
    id: '5',
    projectTitle: 'NASA Space Apps Challenge',
    projectType: 'hackathon',
    status: 'pending',
    appliedDate: '2025-01-18',
    description: 'Global hackathon focused on solving challenges in space exploration.',
    location: 'Multiple Locations'
  }
];

const StatusBadge: React.FC<{ status: Application['status'] }> = ({ status }) => {
  const getStatusConfig = (status: Application['status']) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-400',
          bg: 'bg-yellow-400/10',
          border: 'border-yellow-400/20',
          text: 'Pending'
        };
      case 'accepted':
        return {
          icon: CheckCircle,
          color: 'text-green-400',
          bg: 'bg-green-400/10',
          border: 'border-green-400/20',
          text: 'Accepted'
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-red-400',
          bg: 'bg-red-400/10',
          border: 'border-red-400/20',
          text: 'Rejected'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border ${config.bg} ${config.border}`}>
      <Icon className={`w-4 h-4 ${config.color}`} />
      <span className={`text-sm font-medium ${config.color}`}>{config.text}</span>
    </div>
  );
};

export default function MyApplications() {
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    if (user?.role !== 'student') {
      router.push('/'); // Redirect non-students to home
      return;
    }
  }, [isLoggedIn, user, router]);

  if (!isLoggedIn || user?.role !== 'student') {
    return null;
  }

  const getProjectTypeColor = (type: Application['projectType']) => {
    switch (type) {
      case 'project':
        return 'text-cyan-400';
      case 'hackathon':
        return 'text-purple-400';
      case 'conference':
        return 'text-orange-400';
    }
  };

  return (
    <div className="min-h-screen bg-charcoal text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-charcoal via-gray-900 to-charcoal border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.back()}
                className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              <div>
                <h1 className="text-3xl font-bold">My Applications</h1>
                <p className="text-gray-400 mt-1">Track your project applications and status</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {mockApplications.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-800 flex items-center justify-center">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Applications Yet</h3>
            <p className="text-gray-400 mb-6">You haven't applied to any projects, hackathons, or conferences.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/projects')}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
            >
              Browse Opportunities
            </motion.button>
          </div>
        ) : (
          <div className="space-y-6">
            {mockApplications.map((application, index) => (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{application.projectTitle}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                          <span className={`font-medium capitalize ${getProjectTypeColor(application.projectType)}`}>
                            {application.projectType}
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Applied: {new Date(application.appliedDate).toLocaleDateString()}</span>
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={application.status} />
                    </div>

                    <p className="text-gray-300 mb-4 leading-relaxed">{application.description}</p>

                    <div className="flex flex-wrap items-center space-x-6 text-sm text-gray-400">
                      {application.supervisor && (
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>Supervisor: {application.supervisor}</span>
                        </div>
                      )}
                      {application.location && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{application.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
