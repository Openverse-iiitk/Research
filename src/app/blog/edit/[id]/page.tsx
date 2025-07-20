import React from "react";
import { BlogPostForm } from "@/components/blog-post-form";
import { getBlogPosts } from "@/lib/blog-store";

export async function generateStaticParams() {
  const posts = getBlogPosts();
  return posts.map((post) => ({
    id: post.id,
  }));
}

interface EditBlogPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const { id } = await params;
  return <BlogPostForm postId={id} />;
}
