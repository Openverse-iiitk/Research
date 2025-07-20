"use client";
import React, { Suspense } from "react";
import { ApplicationForm } from "@/components/application-form";

function ApplicationFormWithSuspense() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    }>
      <ApplicationForm />
    </Suspense>
  );
}

export default function ApplyPage() {
  return <ApplicationFormWithSuspense />;
}
