"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

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
    email: "",
    password: "",
  });
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

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

    // Simulate API call delay
    setTimeout(() => {
      const success = login(formState.email, formState.password);
      
      if (success) {
        // Role-based redirect logic will be handled by useEffect in auth context
        // For now, we'll redirect based on email
        if (formState.email === 'teacher') {
          router.push('/teacher');
        } else {
          router.push('/projects');
        }
      } else {
        setLoginError("Invalid credentials. Use admin/admin or teacher/teacher to login.");
      }
      
      setIsLoading(false);
    }, 1000);
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
            {/* Email Input */}
            <div className="password-control relative mb-6">
              <input
                type="text"
                value={formState.email}
                onChange={(e) => handleInput("email", e.target.value)}
                required
                disabled={isLoading}
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
            <PasswordInput name="password" onInput={handleInput} disabled={isLoading} />

            {/* Error Message */}
            {loginError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
              >
                {loginError}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={!formState.email.length || !formState.password.length || isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
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
