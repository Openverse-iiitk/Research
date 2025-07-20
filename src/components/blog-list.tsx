"use client";
import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Calendar, Clock, User, Tag, Plus, Filter } from "lucide-react";
import Link from "next/link";
import { ModernCard } from "./ui/modern-card";
import { Button } from "./ui/button";
import { useAuth } from "@/context/auth-context";
import { getPublishedBlogPosts, getAllTags, searchBlogPosts, getBlogPostsByTag, type BlogPost } from "@/lib/blog-store";

export const BlogList: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const allPosts = getPublishedBlogPosts();
  const allTags = getAllTags();

  const filteredPosts = useMemo(() => {
    let posts = allPosts;
    
    if (searchQuery.trim()) {
      posts = searchBlogPosts(searchQuery.trim());
    }
    
    if (selectedTag) {
      posts = posts.filter(post => 
        post.tags.some(tag => tag.toLowerCase() === selectedTag.toLowerCase())
      );
    }
    
    return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allPosts, searchQuery, selectedTag]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTag(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-900 pt-28 sm:pt-32 lg:pt-36 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Research <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Blog</span>
          </h1>
          <p className="text-xl text-neutral-300 max-w-3xl mx-auto leading-relaxed">
            Discover the latest research insights, project updates, and academic breakthroughs from our community
          </p>
        </motion.div>

        {/* Action Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-2xl">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search blog posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-neutral-800/50 border border-neutral-600 rounded-xl text-white placeholder-neutral-400 focus:border-cyan-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="whitespace-nowrap"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* Create Post Button */}
            {isLoggedIn && (
              <Button as={Link} href="/blog/create" variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                Write Post
              </Button>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-neutral-800/30 border border-neutral-700 rounded-xl"
            >
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-300 mb-2 block">
                    Filter by Tag:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedTag(null)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        !selectedTag
                          ? 'bg-cyan-500 text-white'
                          : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                      }`}
                    >
                      All
                    </button>
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(tag)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedTag === tag
                            ? 'bg-cyan-500 text-white'
                            : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                
                {(searchQuery || selectedTag) && (
                  <div className="flex justify-between items-center pt-2 border-t border-neutral-700">
                    <span className="text-sm text-neutral-400">
                      {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''} found
                    </span>
                    <button
                      onClick={clearFilters}
                      className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-16"
            >
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No posts found</h3>
                <p className="text-neutral-400 mb-6">
                  {searchQuery || selectedTag 
                    ? "Try adjusting your search criteria or clear the filters."
                    : "Be the first to share your research journey!"}
                </p>
                {isLoggedIn && (
                  <Button as={Link} href="/blog/create" variant="primary">
                    Write the first post
                  </Button>
                )}
              </div>
            </motion.div>
          ) : (
            filteredPosts.map((post, index) => (
              <BlogPostCard key={post.id} post={post} index={index} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

interface BlogPostCardProps {
  post: BlogPost;
  index: number;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ post, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
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
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 rounded-full"
              >
                {tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="px-2 py-1 text-xs bg-neutral-700 text-neutral-400 rounded-full">
                +{post.tags.length - 3} more
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors line-clamp-2">
            <Link href={`/blog/${post.id}`} className="hover:underline">
              {post.title}
            </Link>
          </h2>

          {/* Excerpt */}
          <p className="text-neutral-300 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
            {post.excerpt}
          </p>

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-neutral-400 border-t border-neutral-700 pt-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{post.readTime} min read</span>
            </div>
          </div>
        </div>
      </ModernCard>
    </motion.div>
  );
};
