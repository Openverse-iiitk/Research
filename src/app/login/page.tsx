"use client";
import React, { Suspense } from "react";
import { LoginPage } from "@/components/login";

function LoginPageWithSuspense() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-charcoal flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    }>
      <LoginPage />
    </Suspense>
  );
}

export default function Login() {
  return <LoginPageWithSuspense />;
}
