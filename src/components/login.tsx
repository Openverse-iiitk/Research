"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { useRouter, useSearchParams } from "next/navigation";

interface PasswordInputProps {
  name: string;
  onInput: (name: string, value: string) => void;
  className?: string;
  disabled?: boolean;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ name, onInput, className, disabled = false }) => {
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
        className="w-full h-18 bg-transparent border-0 outline-none text-white/96 text-lg pl-12 pr-14 py-0 transition-all duration-300 disabled:opacity-50"
        style={{ height: "72px" }}
      />
      <label className="absolute top-1/2 left-8 -translate-y-1/2 text-neutral-400 pointer-events-none capitalize transition-all duration-400 peer-focus:text-cyan-400 peer-valid:text-cyan-400 peer-focus:-translate-x-9 peer-focus:-translate-y-11 peer-focus:scale-87 peer-valid:-translate-x-9 peer-valid:-translate-y-11 peer-valid:scale-87">
        {name}
      </label>
      <Lock className="absolute top-1/2 left-0 -translate-y-1/2 text-neutral-400 w-6 h-6 pointer-events-none transition-all duration-300" />
      <button
        type="button"
        onMouseDown={togglePasswordVisibility}
        className="absolute top-1/2 right-0 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-transparent border-0 outline-none cursor-pointer transition-all duration-300 hover:text-cyan-400"
      >
        {showPassword ? (
          <EyeOff className="w-6 h-6 text-neutral-400" />
        ) : (
          <Eye className="w-6 h-6 text-neutral-400" />
        )}
      </button>
      <div className="absolute left-0 right-0 bottom-0 w-full h-0.5 rounded-sm bg-white/6">
        <div className="absolute inset-0 rounded-inherit bg-cyan-400 scale-x-0 opacity-0 transition-all duration-300 focus-within:scale-x-100 focus-within:opacity-100" />
      </div>
      
      <style jsx>{`
        .password-control input:focus ~ label,
        .password-control input:valid ~ label {
          transform: translate(-36px, -44px) scale(0.875);
          color: #22d3ee;
        }
        
        .password-control input:focus ~ div > div {
          transform: scaleX(1);
          opacity: 1;
        }
        
        .password-control input:focus ~ .lock-icon,
        .password-control input:valid ~ .lock-icon {
          color: rgb(255 255 255 / 96%);
        }
      `}</style>
    </div>
  );
};

export const LoginPage: React.FC = () => {
  const [formState, setFormState] = useState({
    username: "",
    password: "",
  });
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  const { signInWithPassword, signInWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for errors from OAuth callback
  React.useEffect(() => {
    const error = searchParams.get('error');
    const details = searchParams.get('details');
    const email = searchParams.get('email');
    
    if (error) {
      switch (error) {
        case 'invalid_domain':
          setLoginError(`Only @iiitkottayam.ac.in email addresses are allowed. ${email ? `You tried to login with: ${email}` : ''}`);
          break;
        case 'auth_failed':
          setLoginError(`Authentication failed: ${details || 'Unknown error'}`);
          break;
        case 'db_error':
          setLoginError(`Database error: ${details || 'Unable to access user data'}`);
          break;
        case 'unexpected':
          setLoginError(`Unexpected error: ${details || 'Please try again'}`);
          break;
        case 'no_code':
          setLoginError('Authentication code missing. Please try again.');
          break;
        default:
          setLoginError(`Authentication error: ${error}`);
      }
    }
  }, [searchParams]);

  const handleInput = (name: string, value: string) => {
    setFormState({
      ...formState,
      [name]: value,
    });
    // Clear error when user starts typing
    if (loginError) {
      setLoginError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");

    const result = await signInWithPassword(formState.username, formState.password);
    
    if (result.success) {
      // Auth context will handle redirect based on user role
      router.refresh();
    } else {
      setLoginError(result.error || "Invalid credentials. Please try again.");
    }
    
    setIsLoading(false);
  };

  const handleGoogleSignIn = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsGoogleLoading(true);
    setLoginError("");

    const result = await signInWithGoogle();
    
    if (!result.success) {
      setLoginError(result.error || "Failed to sign in with Google. Please try again.");
      setIsGoogleLoading(false);
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
      <div className="absolute inset-0 bg-black/50 z-1" />

      {/* Animated Background Clouds */}
      <motion.div
        className="fixed -top-1/2 left-0 h-[150vh] opacity-10 z-2"
        animate={{
          scale: [1, 1.25, 1],
          x: [0, -100, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear",
        }}
      >
        <svg
          width="100vw"
          height="150vh"
          viewBox="0 0 1000 1500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 200C200 150 300 180 400 200C500 220 600 180 700 200C800 220 900 180 1000 200V1500H0V200C50 180 80 190 100 200Z"
            fill="white"
            fillOpacity="0.1"
          />
          <path
            d="M0 300C100 280 200 320 300 300C400 280 500 320 600 300C700 280 800 320 900 300C950 290 980 295 1000 300V1500H0V300Z"
            fill="white"
            fillOpacity="0.05"
          />
        </svg>
      </motion.div>

      {/* Login Form Container */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="fixed top-0 left-0 h-full w-full max-w-md bg-gradient-to-br from-neutral-900/95 via-neutral-800/90 to-neutral-900/95 backdrop-blur-xl border-r border-white/10 z-10 flex flex-col justify-center px-15"
        style={{
          width: "70%",
          maxWidth: "400px",
          padding: "200px 60px",
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.90) 50%, rgba(15, 23, 42, 0.95) 100%)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-3xl font-light mb-3 text-white/96 m-0">Login</h2>
          <h3 className="text-base font-normal mb-8 text-neutral-400 m-0">
            Welcome back to Research Connect!
          </h3>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Username Input */}
            <div className="password-control relative mb-6">
              <input
                type="text"
                value={formState.username}
                onChange={(e) => handleInput("username", e.target.value)}
                required
                disabled={isLoading || isGoogleLoading}
                className="w-full bg-transparent border-0 outline-none text-white/96 text-lg pl-12 pr-4 py-0 transition-all duration-300 peer disabled:opacity-50"
                style={{ height: "72px" }}
              />
              <label className="absolute top-1/2 left-8 -translate-y-1/2 text-neutral-400 pointer-events-none capitalize transition-all duration-400 peer-focus:text-cyan-400 peer-valid:text-cyan-400 peer-focus:-translate-x-9 peer-focus:-translate-y-11 peer-focus:scale-87 peer-valid:-translate-x-9 peer-valid:-translate-y-11 peer-valid:scale-87">
                username
              </label>
              <div className="absolute top-1/2 left-0 -translate-y-1/2 text-neutral-400 text-xl pointer-events-none transition-all duration-300">
                @
              </div>
              <div className="absolute left-0 right-0 bottom-0 w-full h-0.5 rounded-sm bg-white/6">
                <div className="absolute inset-0 rounded-inherit bg-cyan-400 scale-x-0 opacity-0 transition-all duration-300 peer-focus:scale-x-100 peer-focus:opacity-100" />
              </div>
            </div>

            {/* Password Input */}
            <PasswordInput name="password" onInput={handleInput} disabled={isLoading || isGoogleLoading} />

            {/* Forgot Password Button */}
            <div className="flex justify-end mb-2">
              <a
                href="/auth/reset-password/"
                className="text-cyan-400 hover:underline text-sm font-medium"
              >
                Forgot Password?
              </a>
            </div>

            {/* Error Message */}
            {loginError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{loginError}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={!formState.username.length || !formState.password.length || isLoading || isGoogleLoading}
              whileHover={{ scale: isLoading || isGoogleLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading || isGoogleLoading ? 1 : 0.98 }}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-lg rounded-xl border-0 outline-none cursor-pointer transition-all duration-300 flex items-center justify-between px-6 tracking-wide shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40"
              style={{ height: "60px", padding: "0 12px 0 24px" }}
            >
              <span>{isLoading ? "Logging in..." : "Login"}</span>
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <ArrowRight className="w-6 h-6" />
              )}
            </motion.button>

            {/* Divider */}
            <div className="flex items-center my-4">
              <div className="flex-1 h-px bg-neutral-600"></div>
              <span className="px-4 text-neutral-400 text-sm">or</span>
              <div className="flex-1 h-px bg-neutral-600"></div>
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading || isGoogleLoading}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-white text-neutral-900 font-medium text-lg rounded-xl border-0 outline-none cursor-pointer transition-all duration-300 shadow-md hover:bg-neutral-100 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ minHeight: "48px" }}
            >
              {isGoogleLoading ? (
                <div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
              ) : (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_17_40)">
                      <path d="M23.766 12.276c0-.818-.074-1.604-.213-2.356H12.24v4.478h6.48c-.28 1.5-1.12 2.773-2.38 3.63v3.018h3.84c2.25-2.073 3.586-5.13 3.586-8.77z" fill="#4285F4"/>
                      <path d="M12.24 24c3.24 0 5.963-1.073 7.95-2.92l-3.84-3.018c-1.07.72-2.44 1.15-4.11 1.15-3.16 0-5.84-2.13-6.8-4.99H1.48v3.13C3.46 21.3 7.54 24 12.24 24z" fill="#34A853"/>
                      <path d="M5.44 14.222A7.23 7.23 0 0 1 4.8 12c0-.77.13-1.52.36-2.22V6.65H1.48A11.97 11.97 0 0 0 0 12c0 1.88.45 3.66 1.48 5.35l3.96-3.13z" fill="#FBBC05"/>
                      <path d="M12.24 4.77c1.77 0 3.36.61 4.62 1.8l3.45-3.45C18.2 1.07 15.48 0 12.24 0 7.54 0 3.46 2.7 1.48 6.65l3.96 3.13c.96-2.86 3.64-4.99 6.8-4.99z" fill="#EA4335"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_17_40">
                        <rect width="24" height="24" fill="white"/>
                      </clipPath>
                    </defs>
                  </svg>
                  Sign in with Google
                </>
              )}
            </button>

            {/* Domain Notice */}
            <div className="mt-4 text-center text-neutral-500 text-xs">
              <p>Google sign-in is restricted to @iiitkottayam.ac.in emails</p>
            </div>
          </form>
        </motion.div>
      </motion.div>

      <style jsx>{`
        .password-control input:focus ~ label,
        .password-control input:valid ~ label {
          transform: translate(-36px, -44px) scale(0.875);
          color: #22d3ee;
        }
        
        .password-control input:focus ~ div > div {
          transform: scaleX(1);
          opacity: 1;
        }
      `}</style>
    </div>
  );
};
