"use client";
import React from "react";
import { Suspense } from "react";
import { TeacherPostForm } from "@/components/teacher-post-form";

interface EditPostPageProps {
  params: {
    id: string;
  };
}

function EditPostContent({ postId }: { postId: string }) {
  return <TeacherPostForm postId={postId} />;
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const { id } = params;

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-900 pt-28 sm:pt-32 lg:pt-36 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-neutral-400">Loading post...</p>
          </div>
        </div>
      </div>
    }>
      <EditPostContent postId={id} />
    </Suspense>
  );
}
