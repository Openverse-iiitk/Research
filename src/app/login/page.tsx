"use client";
import React, { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { useRouter, useSearchParams } from "next/navigation";

function LoginContent() {
  const { signInWithGoogle, isLoggedIn, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle successful login redirect
  useEffect(() => {
    if (isLoggedIn && user) {
      // User successfully logged in, redirect will be handled by auth context
      console.log('User logged in successfully:', user.email, 'role:', user.role);
    }
  }, [isLoggedIn, user]);

  // Check for errors from OAuth callback
  useEffect(() => {
    const errorParam = searchParams.get('error');
    const details = searchParams.get('details');
    const email = searchParams.get('email');
    const message = searchParams.get('message');
    
    if (message) {
      setError(message);
    }
    
    if (errorParam) {
      switch (errorParam) {
        case 'invalid_domain':
          setError(`Only @iiitkottayam.ac.in email addresses are allowed. ${email ? `You tried to login with: ${email}` : ''}`);
          break;
        case 'auth_failed':
          setError(`Authentication failed: ${details || 'Unknown error'}`);
          break;
        case 'db_error':
          setError(`Database error: ${details || 'Unable to access user data'}`);
          break;
        case 'unexpected':
          setError(`Unexpected error: ${details || 'Please try again'}`);
          break;
        case 'no_code':
          setError('Authentication code missing. Please try again.');
          break;
        case 'oauth_error':
          setError(`OAuth error: ${details || 'Please try again'}`);
          break;
        default:
          setError(`Authentication error: ${errorParam}`);
      }
    }
  }, [searchParams]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");

    const result = await signInWithGoogle();
    
    if (!result.success) {
      setError(result.error || "Failed to sign in with Google. Please try again.");
      setIsLoading(false);
    }
    // If successful, the OAuth flow will handle the redirect
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/bg-video.mp4" type="video/mp4" />
      </video>
      
      {/* Video Credit */}
      <div className="absolute bottom-4 right-4 z-20 text-white/60 text-xs font-light bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
        Video by Kaustubh Bhalerao, '26 Batch
      </div>
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-charcoal/90 via-charcoal/80 to-blue-900/70 z-10" />
      
      {/* Content */}
      <div className="relative z-20 min-h-screen flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl font-bold text-white mb-2"
            >
              Welcome Back
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-neutral-300"
            >
              Sign in to continue to IIIT Kottayam Research Portal
            </motion.p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
            >
              <p className="text-red-400 text-sm text-center">{error}</p>
            </motion.div>
          )}

          {/* Google Sign In Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-gray-50 disabled:bg-gray-200 text-gray-900 font-medium rounded-xl transition-all duration-300 shadow-lg shadow-black/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            <span>
              {isLoading ? 'Signing in...' : 'Continue with Google'}
            </span>
          </motion.button>

          {/* Info Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-6 text-center"
          >
            <p className="text-neutral-400 text-sm">
              Only @iiitkottayam.ac.in email addresses are allowed
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/bg-video.mp4" type="video/mp4" />
      </video>
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-charcoal/90 via-charcoal/80 to-blue-900/70 z-10" />
      
      {/* Loading Content */}
      <div className="relative z-20 min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mb-4" />
        <p className="text-white/80">Loading...</p>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoginContent />
    </Suspense>
  );
}
