"use client";
import React from "react";
import { motion } from "framer-motion";
import { BookOpen, ArrowRight, Calendar, User } from "lucide-react";
import Link from "next/link";
import { ModernCard } from "./ui/modern-card";
import { Button } from "./ui/button";
import { getPublishedBlogPosts } from "@/lib/blog-store";

export const BlogSection: React.FC = () => {
  const recentPosts = getPublishedBlogPosts().slice(0, 3);

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 via-transparent to-blue-500/5" />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-300">Research Blog</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Latest Research <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Insights</span>
          </h2>
          
          <p className="text-xl text-neutral-300 max-w-3xl mx-auto leading-relaxed">
            Discover the latest research developments, project updates, and academic breakthroughs from our community
          </p>
        </motion.div>

        {/* Recent Blog Posts */}
        {recentPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {recentPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  ease: [0.25, 0.25, 0, 1]
                }}
                whileHover={{ y: -4 }}
                className="group"
              >
                <ModernCard className="h-full flex flex-col hover:border-cyan-500/50 transition-all duration-300">
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors line-clamp-2">
                      <Link href={`/blog/${post.id}`} className="hover:underline">
                        {post.title}
                      </Link>
                    </h3>

                    {/* Excerpt */}
                    <p className="text-neutral-300 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
                      {post.excerpt}
                    </p>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-xs text-neutral-400 border-t border-neutral-700 pt-3">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </ModernCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <ModernCard className="max-w-2xl mx-auto">
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-8 h-8 text-cyan-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Research Stories Await
                </h3>
                <p className="text-neutral-300 text-lg leading-relaxed">
                  Our community is just getting started. Be among the first to share your research journey and inspire others.
                </p>
              </div>
            </ModernCard>
          </motion.div>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button as={Link} href="/blog" variant="primary" className="group">
              Explore All Posts
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button as={Link} href="/blog/create" variant="outline">
              Share Your Research
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
