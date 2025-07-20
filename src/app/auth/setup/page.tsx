"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { User, Lock, Users, Building2 } from "lucide-react";

export default function AuthSetup() {
  const { session, user, setupUsernamePassword, isLoading } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    role: "student" as "student" | "teacher",
    department: ""
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Redirect if not authenticated
    if (!isLoading && !session) {
      router.push('/login');
    }
  }, [session, isLoading, router]);

  // Pre-fill form with existing user data if available
  useEffect(() => {
    if (user && session) {
      setFormData(prev => ({
        ...prev,
        name: user.name || session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
        role: (user.role === 'teacher' ? 'teacher' : 'student') as 'student' | 'teacher',
        department: user.department || '',
        username: user.username || ''
      }));
    }
  }, [user, session]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = "Username can only contain letters, numbers, and underscores";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (formData.role === "teacher" && !formData.department.trim()) {
      newErrors.department = "Department is required for teachers";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    const result = await setupUsernamePassword(
      formData.username,
      formData.password,
      formData.name,
      formData.role,
      formData.department || undefined
    );

    if (result.success) {
      // Redirect based on role
      const redirectTo = formData.role === 'teacher' ? '/teacher' : '/projects';
      router.push(redirectTo);
    } else {
      setErrors({ submit: result.error || 'Failed to setup account' });
    }

    setIsSubmitting(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-gradient-to-br from-neutral-900/95 via-neutral-800/90 to-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-light text-white mb-2">Complete Setup</h1>
            <p className="text-neutral-400">Create your username and password</p>
            <p className="text-sm text-cyan-400 mt-2">Welcome to Research Connect!</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div className="relative">
              <User className="absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Username"
                className="w-full bg-neutral-800/50 border border-neutral-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-neutral-400 focus:border-cyan-400 focus:outline-none transition-colors"
              />
              {errors.username && <p className="text-red-400 text-sm mt-1">{errors.username}</p>}
            </div>

            {/* Full Name */}
            <div className="relative">
              <User className="absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Full Name"
                className="w-full bg-neutral-800/50 border border-neutral-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-neutral-400 focus:border-cyan-400 focus:outline-none transition-colors"
              />
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Role */}
            <div className="relative">
              <Users className="absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <select
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="w-full bg-neutral-800/50 border border-neutral-700 rounded-xl pl-10 pr-4 py-3 text-white focus:border-cyan-400 focus:outline-none transition-colors"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>

            {/* Department (for teachers) */}
            {formData.role === 'teacher' && (
              <div className="relative">
                <Building2 className="absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  placeholder="Department"
                  className="w-full bg-neutral-800/50 border border-neutral-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-neutral-400 focus:border-cyan-400 focus:outline-none transition-colors"
                />
                {errors.department && <p className="text-red-400 text-sm mt-1">{errors.department}</p>}
              </div>
            )}

            {/* Password */}
            <div className="relative">
              <Lock className="absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Password"
                className="w-full bg-neutral-800/50 border border-neutral-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-neutral-400 focus:border-cyan-400 focus:outline-none transition-colors"
              />
              {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Lock className="absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Confirm Password"
                className="w-full bg-neutral-800/50 border border-neutral-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-neutral-400 focus:border-cyan-400 focus:outline-none transition-colors"
              />
              {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                {errors.submit}
              </div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/25"
            >
              {isSubmitting ? "Setting up..." : "Complete Setup"}
            </motion.button>
          </form>

          <div className="mt-6 text-center text-neutral-400 text-sm">
            <p>Your account is secured with Google OAuth</p>
            <p>Email: {session?.user?.email}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
