"use client";
import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, User, Tag, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ModernCard } from "./ui/modern-card";
import { Button } from "./ui/button";
import { MarkdownRenderer } from "./ui/markdown-renderer";
import { useAuth } from "@/context/auth-context";
import { getBlogPostById, deleteBlogPost, type BlogPost } from "@/lib/blog-store";

interface BlogPostDetailProps {
  postId: string;
}

export const BlogPostDetail: React.FC<BlogPostDetailProps> = ({ postId }) => {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const [post, setPost] = React.useState<BlogPost | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    const fetchPost = () => {
      const blogPost = getBlogPostById(postId);
      setPost(blogPost);
      setLoading(false);
    };

    fetchPost();
  }, [postId]);

  const handleDelete = async () => {
    if (!post || !user) return;
    
    const confirmed = window.confirm("Are you sure you want to delete this blog post? This action cannot be undone.");
    if (!confirmed) return;

    setDeleting(true);
    const success = deleteBlogPost(post.id);
    
    if (success) {
      router.push('/blog');
    } else {
      alert('Failed to delete blog post. Please try again.');
      setDeleting(false);
    }
  };

  const canEdit = isLoggedIn && user && post && user.email === post.authorEmail;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-900 pt-28 sm:pt-32 lg:pt-36 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-neutral-400">Loading blog post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-900 pt-28 sm:pt-32 lg:pt-36 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-white mb-4">Blog Post Not Found</h1>
            <p className="text-neutral-400 mb-8">The blog post you're looking for doesn't exist or has been removed.</p>
            <Button as={Link} href="/blog" variant="primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-900 pt-28 sm:pt-32 lg:pt-36 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link 
            href="/blog"
            className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Blog
          </Link>
        </motion.div>

        {/* Article Header */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <ModernCard className="mb-8">
            <div className="p-8 sm:p-12">
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="inline-flex items-center px-3 py-1 text-sm bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 rounded-full hover:bg-cyan-500/20 transition-colors"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Link>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Excerpt */}
              <p className="text-xl text-neutral-300 leading-relaxed mb-8">
                {post.excerpt}
              </p>

              {/* Metadata */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-neutral-700 pt-6">
                <div className="flex items-center gap-6 text-sm text-neutral-400">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="font-medium text-neutral-300">{post.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{post.readTime} min read</span>
                  </div>
                </div>

                {/* Edit/Delete Actions */}
                {canEdit && (
                  <div className="flex items-center gap-3">
                    <Button
                      as={Link}
                      href={`/blog/edit/${post.id}`}
                      variant="outline"
                      className="text-sm px-3 py-2"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      onClick={handleDelete}
                      disabled={deleting}
                      variant="outline"
                      className="text-sm px-3 py-2 text-red-400 border-red-400/20 hover:bg-red-500/10 hover:border-red-400/40"
                    >
                      {deleting ? (
                        <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin mr-2" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      {deleting ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </ModernCard>

          {/* Article Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <ModernCard>
              <div className="p-8 sm:p-12">
                <MarkdownRenderer content={post.content} />
              </div>
            </ModernCard>
          </motion.div>

          {/* Updated Info */}
          {post.updatedAt !== post.createdAt && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-6 text-center text-sm text-neutral-500"
            >
              Last updated: {formatDate(post.updatedAt)}
            </motion.div>
          )}
        </motion.article>

        {/* Related Posts or Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 mb-8"
        >
          <ModernCard>
            <div className="p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">
                Enjoyed this post?
              </h3>
              <p className="text-neutral-300 mb-6">
                Explore more research insights and join our community of innovators.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button as={Link} href="/blog" variant="outline">
                  Read More Posts
                </Button>
                {isLoggedIn ? (
                  <Button as={Link} href="/blog/create" variant="primary">
                    Share Your Research
                  </Button>
                ) : (
                  <Button as={Link} href="/login" variant="primary">
                    Join the Community
                  </Button>
                )}
              </div>
            </div>
          </ModernCard>
        </motion.div>
      </div>
    </div>
  );
};
