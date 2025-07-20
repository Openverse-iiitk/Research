"use client";
import React, { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, ArrowRight, AlertCircle, CheckCircle, Key } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface PasswordInputProps {
  name: string;
  onInput: (name: string, value: string) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ 
  name, 
  onInput, 
  className, 
  disabled = false, 
  placeholder = name 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [value, setValue] = useState("");

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    onInput(name, e.target.value);
  };

  const togglePasswordVisibility = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  return (
    <div className={cn("password-control relative mb-6", className)}>
      <input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={handleInput}
        required
        disabled={disabled}
        placeholder={placeholder}
        className="w-full h-18 bg-transparent border-0 outline-none text-white/96 text-lg pl-12 pr-14 py-0 transition-all duration-300 disabled:opacity-50 border-b border-white/20 focus:border-cyan-400"
        style={{ height: "72px" }}
      />
      <label className="absolute top-1/2 left-8 -translate-y-1/2 text-neutral-400 pointer-events-none capitalize transition-all duration-400">
        {placeholder}
      </label>
      <Lock className="absolute top-1/2 left-0 -translate-y-1/2 text-neutral-400 w-6 h-6 pointer-events-none transition-all duration-300" />
      <button
        type="button"
        onMouseDown={togglePasswordVisibility}
        className="absolute top-1/2 right-0 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-transparent border-0 outline-none cursor-pointer transition-all duration-300 hover:text-cyan-400"
      >
        {showPassword ? (
          <EyeOff className="w-6 h-6" />
        ) : (
          <Eye className="w-6 h-6" />
        )}
      </button>
    </div>
  );
};

const ResetPasswordContent: React.FC = () => {
  const [formState, setFormState] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  
  const { updatePassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if we have a valid reset session
    const checkResetSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking session:', error);
          setError('Invalid or expired reset link');
          setCheckingSession(false);
          return;
        }

        if (session) {
          setIsValidSession(true);
        } else {
          setError('Invalid or expired reset link. Please request a new password reset.');
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('Something went wrong. Please try again.');
      } finally {
        setCheckingSession(false);
      }
    };

    checkResetSession();
  }, []);

  const handleInput = (name: string, value: string) => {
    setFormState({
      ...formState,
      [name]: value,
    });
    // Clear errors when user starts typing
    if (error) {
      setError("");
    }
    if (message) {
      setMessage("");
    }
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    // Validate passwords match
    if (formState.newPassword !== formState.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Validate password strength
    const passwordError = validatePassword(formState.newPassword);
    if (passwordError) {
      setError(passwordError);
      setIsLoading(false);
      return;
    }

    const result = await updatePassword(formState.newPassword);
    
    if (result.success) {
      setMessage("Password updated successfully! Redirecting to login...");
      setTimeout(() => {
        router.push('/login?message=password_reset_success');
      }, 2000);
    } else {
      setError(result.error || "Failed to update password. Please try again.");
    }
    
    setIsLoading(false);
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-lg">Validating reset link...</p>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-4">Reset Link Invalid</h1>
            <p className="text-white/70 mb-8">{error}</p>
            <button
              onClick={() => router.push('/login')}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Back to Login
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] [background-size:20px_20px]"></div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8"
          >
            <div className="text-center mb-8">
              <Key className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
              <p className="text-white/70">Enter your new password below</p>
            </div>

            {message && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-green-300 text-sm">{message}</span>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-red-300 text-sm">{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <PasswordInput
                name="newPassword"
                placeholder="New Password"
                onInput={handleInput}
                disabled={isLoading}
              />

              <PasswordInput
                name="confirmPassword"
                placeholder="Confirm Password"
                onInput={handleInput}
                disabled={isLoading}
              />

              <div className="text-xs text-white/60 space-y-1">
                <p>Password requirements:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>At least 8 characters long</li>
                  <li>One uppercase and one lowercase letter</li>
                  <li>At least one number</li>
                </ul>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={!isLoading ? { scale: 1.02 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    Update Password
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => router.push('/login')}
                className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200 text-sm"
              >
                Back to Login
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Loading component for Suspense fallback
const ResetPasswordLoading = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-white">Loading...</div>
  </div>
);

// Main component that wraps ResetPasswordContent with Suspense
const ResetPasswordPage: React.FC = () => {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordContent />
    </Suspense>
  );
};

export default ResetPasswordPage;
