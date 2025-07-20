"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Eye, X, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ModernCard } from "./ui/modern-card";
import { Button } from "./ui/button";
import { MarkdownRenderer } from "./ui/markdown-renderer";
import { useAuth } from "@/context/auth-context";
import { createBlogPost, updateBlogPost, getBlogPostById, type BlogPost } from "@/lib/blog-store";

interface BlogPostFormProps {
  postId?: string; // For editing existing posts
}

interface FormData {
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  published: boolean;
}

export const BlogPostForm: React.FC<BlogPostFormProps> = ({ postId }) => {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const isEditing = !!postId;

  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
    excerpt: "",
    tags: [],
    published: false
  });

  const [tagInput, setTagInput] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing post data if editing
  React.useEffect(() => {
    if (isEditing && postId) {
      const existingPost = getBlogPostById(postId);
      if (existingPost) {
        setFormData({
          title: existingPost.title,
          content: existingPost.content,
          excerpt: existingPost.excerpt,
          tags: existingPost.tags,
          published: existingPost.published
        });
      } else {
        router.push('/blog');
      }
    }
  }, [isEditing, postId, router]);

  // Redirect if not logged in
  React.useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const generateExcerpt = () => {
    if (formData.content) {
      // Remove markdown formatting and get first 200 characters
      const plainText = formData.content
        .replace(/#{1,6}\s+/g, '') // Remove headers
        .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
        .replace(/\*(.+?)\*/g, '$1') // Remove italic
        .replace(/`(.+?)`/g, '$1') // Remove inline code
        .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links
        .replace(/\n+/g, ' ') // Replace newlines with spaces
        .trim();
      
      const excerpt = plainText.length > 200 ? 
        plainText.substring(0, 200) + '...' : 
        plainText;
      
      setFormData(prev => ({
        ...prev,
        excerpt
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      if (!formData.content.trim()) {
        throw new Error('Content is required');
      }
      if (!formData.excerpt.trim()) {
        throw new Error('Excerpt is required');
      }
      if (formData.tags.length === 0) {
        throw new Error('At least one tag is required');
      }

      if (!user) {
        throw new Error('User not authenticated');
      }

      let success = false;

      if (isEditing && postId) {
        // Update existing post
        success = updateBlogPost(postId, {
          title: formData.title.trim(),
          content: formData.content.trim(),
          excerpt: formData.excerpt.trim(),
          tags: formData.tags,
          published: formData.published
        });
      } else {
        // Create new post
        success = createBlogPost({
          title: formData.title.trim(),
          content: formData.content.trim(),
          excerpt: formData.excerpt.trim(),
          tags: formData.tags,
          published: formData.published,
          author: user.email.split('@')[0],
          authorEmail: user.email
        });
      }

      if (success) {
        router.push('/blog');
      } else {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} blog post`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-900 pt-28 sm:pt-32 lg:pt-36 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-neutral-400">Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-900 pt-28 sm:pt-32 lg:pt-36 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <Link 
              href="/blog"
              className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Blog
            </Link>
            
            <Button
              onClick={() => setShowPreview(!showPreview)}
              variant="outline"
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? 'Edit' : 'Preview'}
            </Button>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-white mt-6">
            {isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {showPreview ? (
            // Preview Mode
            <div className="space-y-8">
              <ModernCard>
                <div className="p-8">
                  <div className="flex flex-wrap gap-2 mb-6">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 text-sm bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                    {formData.title || 'Untitled Post'}
                  </h1>
                  <p className="text-xl text-neutral-300 leading-relaxed mb-8">
                    {formData.excerpt || 'No excerpt provided...'}
                  </p>
                  <div className="text-sm text-neutral-400 border-t border-neutral-700 pt-6">
                    <span>By {user?.email.split('@')[0]} • {new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </ModernCard>
              
              <ModernCard>
                <div className="p-8">
                  <MarkdownRenderer content={formData.content || '*No content yet...*'} />
                </div>
              </ModernCard>
            </div>
          ) : (
            // Edit Mode
            <form onSubmit={handleSubmit} className="space-y-8">
              <ModernCard>
                <div className="p-8">
                  {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Title */}
                  <div className="mb-6">
                    <label className="block text-white font-semibold mb-3">
                      Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-600 rounded-xl text-white placeholder-neutral-400 focus:border-cyan-500 focus:outline-none transition-colors"
                      placeholder="Enter your blog post title..."
                    />
                  </div>

                  {/* Excerpt */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-white font-semibold">
                        Excerpt <span className="text-red-400">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={generateExcerpt}
                        className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        Auto-generate from content
                      </button>
                    </div>
                    <textarea
                      name="excerpt"
                      value={formData.excerpt}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-600 rounded-xl text-white placeholder-neutral-400 focus:border-cyan-500 focus:outline-none transition-colors resize-none"
                      placeholder="Write a brief summary of your post..."
                    />
                  </div>

                  {/* Tags */}
                  <div className="mb-6">
                    <label className="block text-white font-semibold mb-3">
                      Tags <span className="text-red-400">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 rounded-full text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-2 text-cyan-400 hover:text-cyan-300"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={handleTagInputKeyPress}
                        className="flex-1 px-4 py-2 bg-neutral-800/50 border border-neutral-600 rounded-xl text-white placeholder-neutral-400 focus:border-cyan-500 focus:outline-none transition-colors"
                        placeholder="Add a tag..."
                      />
                      <Button
                        type="button"
                        onClick={handleAddTag}
                        variant="outline"
                        disabled={!tagInput.trim()}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Published Toggle */}
                  <div className="mb-6">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name="published"
                        checked={formData.published}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-cyan-500 bg-neutral-800 border-neutral-600 rounded focus:ring-cyan-500 focus:ring-2"
                      />
                      <span className="text-white font-semibold">
                        Publish immediately
                      </span>
                    </label>
                    <p className="text-sm text-neutral-400 mt-1">
                      If unchecked, the post will be saved as a draft
                    </p>
                  </div>
                </div>
              </ModernCard>

              {/* Content Editor */}
              <ModernCard>
                <div className="p-8">
                  <label className="block text-white font-semibold mb-3">
                    Content <span className="text-red-400">*</span>
                  </label>
                  <p className="text-sm text-neutral-400 mb-4">
                    Write your content in Markdown format. You can use headers, lists, code blocks, links, and more.
                  </p>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                    rows={20}
                    className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-600 rounded-xl text-white placeholder-neutral-400 focus:border-cyan-500 focus:outline-none transition-colors resize-none font-mono text-sm"
                    placeholder="# Your Blog Post Title

## Introduction

Write your introduction here...

## Main Content

Add your main content with:

- **Bold text**
- *Italic text*
- `Inline code`
- [Links](https://example.com)

```javascript
// Code blocks
function example() {
  return 'Hello, World!';
}
```

## Conclusion

Wrap up your post here..."
                  />
                </div>
              </ModernCard>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  variant="primary"
                  className="min-w-[150px]"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      {isEditing ? 'Updating...' : 'Publishing...'}
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Save className="w-4 h-4 mr-2" />
                      {isEditing ? 'Update Post' : 'Publish Post'}
                    </div>
                  )}
                </Button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};
