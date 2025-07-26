"use client";
import React, { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, User, Calendar, Mail, Phone, FileText, CheckCircle, XCircle, Clock, Download } from "lucide-react";
import { getApplicationsByTeacher, updateApplicationStatus, type StudentApplication } from "@/lib/data-store";
import { applicationAPI } from "@/lib/api";

const StatusBadge: React.FC<{ status: StudentApplication['status'] }> = ({ status }) => {
  const getStatusConfig = (status: StudentApplication['status']) => {
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
      default:
        return {
          icon: Clock,
          color: 'text-gray-400',
          bg: 'bg-gray-400/10',
          border: 'border-gray-400/20',
          text: 'Unknown'
        };
    }
  };

  const config = getStatusConfig(status);
  const IconComponent = config.icon;

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full border ${config.bg} ${config.border}`}>
      <IconComponent className={`w-4 h-4 mr-2 ${config.color}`} />
      <span className={`text-sm font-medium ${config.color}`}>{config.text}</span>
    </div>
  );
};

function ApplicationsContent() {
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<StudentApplication[]>([]);
  const postId = searchParams.get('postId');

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    if (user?.role !== 'teacher') {
      router.push('/'); // Redirect non-teachers to home
      return;
    }

    // Load applications for the teacher
    const loadApplications = async () => {
      if (user?.email) {
        try {
          const apiApplications = await applicationAPI.getByTeacher(user.id);
          
          // Convert API response to StudentApplication format
          const teacherApplications: StudentApplication[] = apiApplications.map((app: any) => ({
            id: app.id,
            studentEmail: app.student_email,
            studentName: app.student_name,
            studentPhone: app.student_phone,
            projectId: app.project_id,
            projectTitle: app.project_title,
            teacherEmail: app.teacher_email,
            coverLetter: app.cover_letter,
            skills: Array.isArray(app.skills) ? app.skills : [app.skills],
            gpa: app.student_gpa,
            year: app.student_year,
            resumeFile: undefined, // File objects don't persist
            resumeFileName: app.resume_url ? app.resume_url.split('/').pop() : undefined,
            status: app.status,
            appliedDate: app.applied_at,
            updatedAt: app.updated_at
          }));
          
          setApplications(teacherApplications);
          
          // Filter by specific post if postId is provided
          if (postId) {
            const filtered = teacherApplications.filter(app => app.projectId === postId);
            setFilteredApplications(filtered);
          } else {
            setFilteredApplications(teacherApplications);
          }
        } catch (error) {
          console.error('Error loading applications:', error);
          setApplications([]);
          setFilteredApplications([]);
        }
      }
    };

    loadApplications();
  }, [isLoggedIn, user, router, postId]);

  const handleStatusUpdate = (applicationId: string, newStatus: 'accepted' | 'rejected') => {
    const success = updateApplicationStatus(applicationId, newStatus);
    if (success) {
      // Update local state
      const updatedApplications = applications.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      );
      setApplications(updatedApplications);
      
      // Update filtered applications as well
      const updatedFilteredApplications = filteredApplications.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      );
      setFilteredApplications(updatedFilteredApplications);
    } else {
      alert('Failed to update application status');
    }
  };

  const handleDownloadResume = (application: StudentApplication) => {
    try {
      if (application.resumeFile && application.resumeFile instanceof File) {
        // Create a download link for the file
        const url = URL.createObjectURL(application.resumeFile);
        const a = document.createElement('a');
        a.href = url;
        a.download = application.resumeFileName || `${application.studentName}_resume.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (application.resumeFileName) {
        // If file object is not available but filename exists, show message
        alert(`Resume file "${application.resumeFileName}" was uploaded but cannot be downloaded due to browser limitations. In a real application, this would download from the server.`);
      } else {
        alert('No resume file available');
      }
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Failed to download resume file. The file may have been corrupted during storage.');
    }
  };

  if (!isLoggedIn || user?.role !== 'teacher') {
    return null;
  }

  return (
    <div className="min-h-screen bg-charcoal text-white pt-20 sm:pt-24 lg:pt-28">
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
                <h1 className="text-3xl font-bold">Applications</h1>
                <p className="text-gray-400 mt-1">
                  {postId ? 'Applications for specific project' : 'All applications for your projects'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No applications yet</p>
              <p className="text-gray-500 mt-2">Students haven't applied to your projects yet</p>
            </div>
          ) : (
            filteredApplications.map((application, index) => (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold">{application.studentName}</h3>
                          <StatusBadge status={application.status} />
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Applied: {new Date(application.appliedDate).toLocaleDateString()}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Mail className="w-4 h-4" />
                            <span>{application.studentEmail}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Phone className="w-4 h-4" />
                            <span>{application.studentPhone}</span>
                          </span>
                        </div>
                        <p className="text-cyan-400 font-semibold mb-3">{application.projectTitle}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-400 mb-2">Academic Details:</h4>
                        <div className="space-y-1 text-sm text-gray-300">
                          <p>Year: {application.year}</p>
                          <p>GPA: {application.gpa}/10</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-400 mb-2">Skills:</h4>
                        <div className="flex flex-wrap gap-2">
                          {application.skills.map((skill: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-xs rounded-full border border-cyan-500/20"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-400 mb-2">Cover Letter:</h4>
                      <p className="text-gray-300 text-sm leading-relaxed">{application.coverLetter}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {(application.resumeFile || application.resumeFileName) && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDownloadResume(application)}
                            className={`p-2 rounded-lg transition-colors ${
                              application.resumeFile instanceof File 
                                ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400' 
                                : 'bg-gray-600/20 hover:bg-gray-600/30 text-gray-400'
                            }`}
                            title={
                              application.resumeFile instanceof File 
                                ? 'Download Resume' 
                                : `Resume: ${application.resumeFileName || 'File available'} (Demo limitation: file cannot be downloaded)`
                            }
                          >
                            <Download className="w-4 h-4" />
                          </motion.button>
                        )}
                      </div>

                      {application.status === 'pending' && (
                        <div className="flex items-center space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleStatusUpdate(application.id, 'accepted')}
                            className="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors text-sm font-medium"
                          >
                            Accept
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleStatusUpdate(application.id, 'rejected')}
                            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors text-sm font-medium"
                          >
                            Reject
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function Applications() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-charcoal text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading applications...</p>
        </div>
      </div>
    }>
      <ApplicationsContent />
    </Suspense>
  );
}
