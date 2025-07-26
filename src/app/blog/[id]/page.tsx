import React from "react";
import { BlogPostDetail } from "@/components/blog-post-detail";
import { getPublishedBlogPosts } from "@/lib/blog-api-wrapper";

interface BlogPostPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const posts = await getPublishedBlogPosts();
  return posts.map((post) => ({
    id: post.id,
  }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { id } = await params;
  return <BlogPostDetail postId={id} />;
}
