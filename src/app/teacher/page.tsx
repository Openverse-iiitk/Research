"use client";
import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { Plus, FileText, Users, Eye } from "lucide-react";
import { useEffect } from "react";

export default function TeacherDashboard() {
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();

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

  if (!isLoggedIn || user?.role !== 'teacher') {
    return null;
  }

  const menuItems = [
    {
      title: 'My Posts',
      description: 'View and manage your research project posts',
      icon: FileText,
      href: '/teacher/my-posts',
      color: 'from-cyan-500 to-blue-600'
    },
    {
      title: 'Applications',
      description: 'Review student applications for your projects',
      icon: Users,
      href: '/teacher/applications',
      color: 'from-purple-500 to-pink-600'
    },
    {
      title: 'Write New Post',
      description: 'Create a new research project opportunity',
      icon: Plus,
      href: '/teacher/new-post',
      color: 'from-green-500 to-emerald-600'
    }
  ];

  return (
    <div className="min-h-screen bg-charcoal text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-charcoal via-gray-900 to-charcoal border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">Teacher Dashboard</h1>
            <p className="text-gray-400 text-lg">Welcome back, {user?.email}</p>
          </div>
        </div>
      </div>

      {/* Dashboard Menu */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(item.href)}
                className="cursor-pointer"
              >
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-gray-600 transition-all duration-300 h-full">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${item.color} flex items-center justify-center mb-6`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold mb-8 text-center">Quick Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">5</div>
              <div className="text-gray-400">Active Posts</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">12</div>
              <div className="text-gray-400">Applications</div>
            </div>
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">3</div>
              <div className="text-gray-400">Accepted Students</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-orange-400 mb-2">245</div>
              <div className="text-gray-400">Total Views</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
