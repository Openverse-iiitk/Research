"use client";
import React, { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import { Vortex } from "@/components/ui/vortex";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

function LoginContent() {
  const { signInWithGoogle, isLoggedIn, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginMode, setLoginMode] = useState<'signin' | 'signup'>('signin');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    department: ''
  });

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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear error when user starts typing
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return false;
    }

    if (!formData.email.endsWith('@iiitkottayam.ac.in')) {
      setError('Only @iiitkottayam.ac.in email addresses are allowed');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (loginMode === 'signup') {
      if (!formData.name || !formData.department) {
        setError('Name and department are required for signup');
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }

    return true;
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // TODO: Implement email/password authentication with Supabase
      setError('Email/password authentication is not yet implemented. Please use Google Sign-In.');
    } catch (error) {
      setError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Vortex Background */}
      <Vortex
        backgroundColor="#000"
        rangeY={800}
        particleCount={500}
        baseHue={180} // Cyan/Blue base
        className="flex items-center flex-col justify-center px-2 md:px-10 py-4 w-full h-full"
      >
        {/* Content */}
        <div className="relative z-20 min-h-screen flex flex-col items-center justify-center px-4 w-full">
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
                {loginMode === 'signin' ? 'Welcome Back' : 'Join Us'}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-neutral-300"
              >
                {loginMode === 'signin' 
                  ? 'Sign in to continue to IIIT Kottayam Research Portal'
                  : 'Create your account to access the Research Portal'
                }
              </motion.p>
            </div>

            {/* Toggle between Sign In and Sign Up */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex mb-6 bg-white/10 backdrop-blur-sm rounded-xl p-1"
            >
              <button
                onClick={() => setLoginMode('signin')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                  loginMode === 'signin'
                    ? 'bg-white text-gray-900 shadow-lg'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setLoginMode('signup')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                  loginMode === 'signup'
                    ? 'bg-white text-gray-900 shadow-lg'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Sign Up
              </button>
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur-sm"
              >
                <p className="text-red-400 text-sm text-center">{error}</p>
              </motion.div>
            )}

            {/* Email/Password Form */}
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              onSubmit={handleEmailAuth}
              className="space-y-4 mb-6"
            >
              {/* Name Field (Sign Up only) */}
              {loginMode === 'signup' && (
                <div className="space-y-2">
                  <label className="text-white text-sm font-medium">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-neutral-400 focus:border-cyan-500 focus:outline-none transition-colors backdrop-blur-sm"
                    placeholder="Enter your full name"
                    required={loginMode === 'signup'}
                  />
                </div>
              )}

              {/* Department Field (Sign Up only) */}
              {loginMode === 'signup' && (
                <div className="space-y-2">
                  <label className="text-white text-sm font-medium">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-cyan-500 focus:outline-none transition-colors backdrop-blur-sm"
                    required={loginMode === 'signup'}
                  >
                    <option value="" className="bg-gray-800">Select Department</option>
                    <option value="Computer Science" className="bg-gray-800">Computer Science</option>
                    <option value="Electronics & Communication" className="bg-gray-800">Electronics & Communication</option>
                    <option value="Mathematics" className="bg-gray-800">Mathematics</option>
                    <option value="Physics" className="bg-gray-800">Physics</option>
                    <option value="Other" className="bg-gray-800">Other</option>
                  </select>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-white text-sm font-medium">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-neutral-400 focus:border-cyan-500 focus:outline-none transition-colors backdrop-blur-sm"
                    placeholder="your.email@iiitkottayam.ac.in"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-white text-sm font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-neutral-400 focus:border-cyan-500 focus:outline-none transition-colors backdrop-blur-sm"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field (Sign Up only) */}
              {loginMode === 'signup' && (
                <div className="space-y-2">
                  <label className="text-white text-sm font-medium">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-neutral-400 focus:border-cyan-500 focus:outline-none transition-colors backdrop-blur-sm"
                      placeholder="Confirm your password"
                      required={loginMode === 'signup'}
                    />
                  </div>
                </div>
              )}

              {/* Email Auth Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-cyan-600 disabled:to-blue-700 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    <span>
                      {loginMode === 'signin' ? 'Sign In with Email' : 'Create Account'}
                    </span>
                  </>
                )}
              </motion.button>
            </motion.form>

            {/* Divider */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="relative mb-6"
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-neutral-400">or continue with</span>
              </div>
            </motion.div>

            {/* Google Sign In Button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
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
      </Vortex>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-black">
      <Vortex
        backgroundColor="#000"
        rangeY={800}
        particleCount={300}
        baseHue={180}
        className="flex items-center flex-col justify-center px-2 md:px-10 py-4 w-full h-full"
      >
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mb-4" />
        <p className="text-white/80">Loading...</p>
      </Vortex>
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
