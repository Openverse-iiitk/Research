"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X, Save, Eye, Calendar } from "lucide-react";
import { createPost, updatePost, getPostById } from "@/lib/project-api-wrapper";

interface PostForm {
  title: string;
  description: string;
  requirements: string[];
  duration: string;
  location: string;
  maxStudents: number;
  status: 'draft' | 'active' | 'closed';
  department: string;
  deadline: string;
  stipend: string;
  outcome: string;
}

interface TeacherPostFormProps {
  postId?: string; // For editing existing posts
}

export const TeacherPostForm: React.FC<TeacherPostFormProps> = ({ postId }) => {
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();
  const [currentRequirement, setCurrentRequirement] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(!!postId);
  const isEditing = !!postId;

  const [formData, setFormData] = useState<PostForm>({
    title: '',
    description: '',
    requirements: [],
    duration: '',
    location: '',
    maxStudents: 1,
    status: 'draft',
    department: '',
    deadline: '',
    stipend: '',
    outcome: ''
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

    // Load existing post data if editing
    const loadPostData = async () => {
      if (isEditing && postId) {
        try {
          setLoading(true);
          const existingPost = await getPostById(postId);
          if (existingPost) {
            // Convert API response to form format
            setFormData({
              title: existingPost.title,
              description: existingPost.description,
              requirements: existingPost.requirements || [],
              duration: existingPost.duration,
              location: existingPost.location,
              maxStudents: existingPost.maxStudents,
              status: existingPost.status,
              department: existingPost.department,
              deadline: existingPost.deadline.split('T')[0], // Convert to YYYY-MM-DD format
              stipend: existingPost.stipend || '',
              outcome: existingPost.outcome || ''
            });
          } else {
            router.push('/teacher/my-posts');
          }
        } catch (error) {
          console.error('Error loading post:', error);
          router.push('/teacher/my-posts');
        } finally {
          setLoading(false);
        }
      } else {
        // Set default deadline for new posts (30 days from now)
        const defaultDeadline = new Date();
        defaultDeadline.setDate(defaultDeadline.getDate() + 30);
        setFormData(prev => ({
          ...prev,
          department: user?.department || '',
          deadline: defaultDeadline.toISOString().split('T')[0]
        }));
        setLoading(false);
      }
    };

    loadPostData();
  }, [isLoggedIn, user, router, isEditing, postId]);

  const handleInputChange = (field: keyof PostForm, value: string | number) => {
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
      if (!user) {
        throw new Error('User not found - please log in');
      }

      const postData = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        duration: formData.duration,
        location: formData.location,
        maxStudents: formData.maxStudents,
        status: status,
        authorEmail: user?.email || '',
        authorName: user?.name || user?.username || 'Unknown Author',
        department: formData.department,
        deadline: formData.deadline,
        stipend: formData.stipend || undefined,
        outcome: formData.outcome
      };

      if (isEditing && postId) {
        await updatePost(postId, postData);
        console.log('Post updated successfully');
      } else {
        await createPost(postData);
        console.log('Post created successfully');
      }
      
      router.push('/teacher/my-posts');
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} post:`, error);
      alert(`Failed to ${isEditing ? 'update' : 'create'} post. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoggedIn || user?.role !== 'teacher') {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-900 pt-28 sm:pt-32 lg:pt-36 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-neutral-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-900 pt-28 sm:pt-32 lg:pt-36 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to My Posts
            </button>
          </div>
          <h1 className="text-4xl font-bold text-white mt-4">
            {isEditing ? 'Edit Research Post' : 'Create Research Post'}
          </h1>
          <p className="text-neutral-400 mt-2">
            {isEditing ? 'Update your research opportunity' : 'Share a new research opportunity with students'}
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-neutral-800/50 border border-neutral-700 rounded-2xl p-8"
        >
          <form className="space-y-8">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600 rounded-xl text-white placeholder-neutral-400 focus:border-cyan-500 focus:outline-none transition-colors"
                placeholder="Enter project title"
                required
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Department/Field *
              </label>
              <select
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600 rounded-xl text-white focus:border-cyan-500 focus:outline-none transition-colors"
                required
              >
                <option value="">Select Department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Electronics">Electronics & Communication</option>
                <option value="Mechanical">Mechanical Engineering</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biotechnology">Biotechnology</option>
                <option value="Data Science">Data Science</option>
                <option value="AI/ML">Artificial Intelligence/Machine Learning</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Project Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={6}
                className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600 rounded-xl text-white placeholder-neutral-400 focus:border-cyan-500 focus:outline-none transition-colors resize-none"
                placeholder="Describe the research project, objectives, and methodology"
                required
              />
            </div>

            {/* Outcome */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Expected Outcomes *
              </label>
              <textarea
                value={formData.outcome}
                onChange={(e) => handleInputChange('outcome', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600 rounded-xl text-white placeholder-neutral-400 focus:border-cyan-500 focus:outline-none transition-colors resize-none"
                placeholder="What will students gain from this project? (publications, skills, etc.)"
                required
              />
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Requirements & Skills
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={currentRequirement}
                  onChange={(e) => setCurrentRequirement(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                  className="flex-1 px-4 py-3 bg-neutral-700/50 border border-neutral-600 rounded-xl text-white placeholder-neutral-400 focus:border-cyan-500 focus:outline-none transition-colors"
                  placeholder="Add a requirement or skill"
                />
                <button
                  type="button"
                  onClick={addRequirement}
                  className="px-4 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.requirements.map((req, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded-full text-sm"
                  >
                    {req}
                    <button
                      type="button"
                      onClick={() => removeRequirement(req)}
                      className="hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Duration and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Duration *
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600 rounded-xl text-white placeholder-neutral-400 focus:border-cyan-500 focus:outline-none transition-colors"
                  placeholder="e.g., 3 months, 1 semester"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600 rounded-xl text-white placeholder-neutral-400 focus:border-cyan-500 focus:outline-none transition-colors"
                  placeholder="e.g., On-campus, Remote, Hybrid"
                  required
                />
              </div>
            </div>

            {/* Max Students, Deadline, and Stipend */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Max Students *
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.maxStudents}
                  onChange={(e) => handleInputChange('maxStudents', parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600 rounded-xl text-white placeholder-neutral-400 focus:border-cyan-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Application Deadline *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleInputChange('deadline', e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600 rounded-xl text-white focus:border-cyan-500 focus:outline-none transition-colors"
                    required
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Stipend (Optional)
                </label>
                <input
                  type="text"
                  value={formData.stipend}
                  onChange={(e) => handleInputChange('stipend', e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600 rounded-xl text-white placeholder-neutral-400 focus:border-cyan-500 focus:outline-none transition-colors"
                  placeholder="e.g., ₹5000/month"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-neutral-700">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSubmit('draft')}
                disabled={isSubmitting || !formData.title || !formData.description}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-neutral-600 hover:bg-neutral-500 disabled:bg-neutral-700 disabled:opacity-50 text-white rounded-xl transition-colors"
              >
                <Save className="w-5 h-5" />
                {isSubmitting ? 'Saving...' : 'Save as Draft'}
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSubmit('active')}
                disabled={isSubmitting || !formData.title || !formData.description || !formData.outcome}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white rounded-xl transition-all duration-300"
              >
                <Eye className="w-5 h-5" />
                {isSubmitting ? 'Publishing...' : 'Publish Post'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};
