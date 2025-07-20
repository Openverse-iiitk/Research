"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X, Save, Eye } from "lucide-react";
import { useEffect } from "react";
import { createPost, getUser } from "@/lib/data-store";

interface NewPostForm {
  title: string;
  description: string;
  requirements: string[];
  duration: string;
  location: string;
  maxStudents: number;
  status: 'draft' | 'active';
}

export default function NewPost() {
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();
  const [currentRequirement, setCurrentRequirement] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<NewPostForm>({
    title: '',
    description: '',
    requirements: [],
    duration: '',
    location: '',
    maxStudents: 1,
    status: 'draft'
  });

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    if (user?.role !== 'teacher') {
      router.push('/'); // Redirect non-teachers to home
      return;
    }
  }, [isLoggedIn, user, router]);

  const handleInputChange = (field: keyof NewPostForm, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addRequirement = () => {
    if (currentRequirement.trim() && !formData.requirements.includes(currentRequirement.trim())) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, currentRequirement.trim()]
      }));
      setCurrentRequirement('');
    }
  };

  const removeRequirement = (requirement: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter(req => req !== requirement)
    }));
  };

  const handleSubmit = async (status: 'draft' | 'active') => {
    setIsSubmitting(true);
    
    try {
      // Get current user data
      const userData = getUser(user?.email || '');
      if (!userData) {
        throw new Error('User not found');
      }

      // Create deadline 30 days from now if not provided
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 30);

      // Create the post
      const newPost = await createPost({
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        duration: formData.duration,
        location: formData.location,
        maxStudents: formData.maxStudents,
        status: status,
        authorEmail: user?.email || '',
        authorName: userData.name,
        department: userData.department || 'Unknown Department',
        deadline: deadline.toISOString().split('T')[0],
        stipend: undefined // Can be added later
      });

      console.log('Post created successfully:', newPost);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        requirements: [],
        duration: '',
        location: '',
        maxStudents: 1,
        status: 'draft'
      });
      
      router.push('/teacher/my-posts');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoggedIn || user?.role !== 'teacher') {
    return null;
  }

  return (
    <div className="min-h-screen bg-charcoal text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-charcoal via-gray-900 to-charcoal border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <h1 className="text-3xl font-bold">Create New Post</h1>
              <p className="text-gray-400 mt-1">Share a new research opportunity with students</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="Enter project title..."
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Project Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={6}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                placeholder="Describe the project objectives, methodology, and expected outcomes..."
                required
              />
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Requirements & Skills
              </label>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={currentRequirement}
                    onChange={(e) => setCurrentRequirement(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="Add a requirement or skill..."
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={addRequirement}
                    className="px-4 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </motion.button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.requirements.map((requirement, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center space-x-2 px-3 py-1 bg-cyan-500/10 text-cyan-400 text-sm rounded-full border border-cyan-500/20"
                    >
                      <span>{requirement}</span>
                      <button
                        onClick={() => removeRequirement(requirement)}
                        className="hover:text-cyan-300 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Duration and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Duration *
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="e.g., 6 months, 1 semester..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="e.g., AI Lab, IIIT Kottayam..."
                  required
                />
              </div>
            </div>

            {/* Max Students */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Maximum Number of Students
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.maxStudents}
                onChange={(e) => handleInputChange('maxStudents', parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSubmit('draft')}
                disabled={isSubmitting || !formData.title || !formData.description}
                className="flex-1 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>{isSubmitting ? 'Saving...' : 'Save as Draft'}</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSubmit('active')}
                disabled={isSubmitting || !formData.title || !formData.description || !formData.duration || !formData.location}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 disabled:from-gray-600 disabled:to-gray-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Eye className="w-5 h-5" />
                <span>{isSubmitting ? 'Publishing...' : 'Publish Post'}</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
