"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Eye, EyeOff, Lock, ArrowRight, AlertCircle, CheckCircle, Building } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";

type UserRole = 'student' | 'teacher';

interface InputProps {
  name: string;
  type?: string;
  icon: React.ReactNode;
  onInput: (name: string, value: string) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
}

const Input: React.FC<InputProps> = ({ 
  name, 
  type = "text", 
  icon, 
  onInput, 
  className, 
  disabled = false, 
  placeholder = name,
  required = false
}) => {
  const [value, setValue] = useState("");

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    onInput(name, e.target.value);
  };

  return (
    <div className={cn("relative mb-6", className)}>
      <input
        type={type}
        value={value}
        onChange={handleInput}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full h-18 bg-transparent border-0 outline-none text-white/96 text-lg pl-12 pr-4 py-0 transition-all duration-300 disabled:opacity-50 border-b border-white/20 focus:border-cyan-400"
        style={{ height: "72px" }}
      />
      <div className="absolute top-1/2 left-0 -translate-y-1/2 text-neutral-400 w-6 h-6 pointer-events-none transition-all duration-300">
        {icon}
      </div>
    </div>
  );
};

interface PasswordInputProps {
  name: string;
  onInput: (name: string, value: string) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ 
  name, 
  onInput, 
  className, 
  disabled = false, 
  placeholder = name,
  required = false
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
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full h-18 bg-transparent border-0 outline-none text-white/96 text-lg pl-12 pr-14 py-0 transition-all duration-300 disabled:opacity-50 border-b border-white/20 focus:border-cyan-400"
        style={{ height: "72px" }}
      />
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

const RegisterPage: React.FC = () => {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student" as UserRole,
    department: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  
  const { signUpWithEmail } = useAuth();
  const router = useRouter();

  const departments = [
    "Computer Science & Engineering",
    "Electronics & Communication Engineering", 
    "Mechanical Engineering",
    "Civil Engineering",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Humanities & Social Sciences",
    "Management Studies",
    "Other"
  ];

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

  const handleRoleChange = (role: UserRole) => {
    setFormState({
      ...formState,
      role: role,
    });
  };

  const validateEmail = (email: string): string | null => {
    if (!email.endsWith('@iiitkottayam.ac.in')) {
      return "Only @iiitkottayam.ac.in email addresses are allowed";
    }
    return null;
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

    // Validate email
    const emailError = validateEmail(formState.email);
    if (emailError) {
      setError(emailError);
      setIsLoading(false);
      return;
    }

    // Validate passwords match
    if (formState.password !== formState.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Validate password strength
    const passwordError = validatePassword(formState.password);
    if (passwordError) {
      setError(passwordError);
      setIsLoading(false);
      return;
    }

    // Validate required fields
    if (!formState.name.trim()) {
      setError("Name is required");
      setIsLoading(false);
      return;
    }

    if (formState.role === 'teacher' && !formState.department) {
      setError("Department is required for teachers");
      setIsLoading(false);
      return;
    }

    const result = await signUpWithEmail(
      formState.email,
      formState.password,
      formState.name.trim(),
      formState.role,
      formState.department || undefined
    );
    
    if (result.success) {
      if (result.needsConfirmation) {
        setNeedsConfirmation(true);
        setMessage(`Registration successful! Please check your email (${formState.email}) for a confirmation link.`);
      } else {
        setMessage("Registration successful! Redirecting...");
        setTimeout(() => {
          router.push('/projects');
        }, 2000);
      }
    } else {
      setError(result.error || "Registration failed. Please try again.");
    }
    
    setIsLoading(false);
  };

  if (needsConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] [background-size:20px_20px]"></div>
        
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8 text-center"
            >
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-white mb-4">Check Your Email</h1>
              <p className="text-white/70 mb-6">{message}</p>
              <p className="text-white/60 text-sm mb-8">
                Didn't receive the email? Check your spam folder or contact support.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Back to Login
              </Link>
            </motion.div>
          </div>
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
              <User className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
              <p className="text-white/70">Join the IIIT Kottayam research community</p>
            </div>

            {message && !needsConfirmation && (
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
              <Input
                name="name"
                type="text"
                icon={<User className="w-6 h-6" />}
                placeholder="Full Name"
                onInput={handleInput}
                disabled={isLoading}
                required
              />

              <Input
                name="email"
                type="email"
                icon={<Mail className="w-6 h-6" />}
                placeholder="Email (@iiitkottayam.ac.in)"
                onInput={handleInput}
                disabled={isLoading}
                required
              />

              {/* Role Selection */}
              <div className="mb-6">
                <p className="text-white/70 text-sm mb-3">I am a:</p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="student"
                      checked={formState.role === 'student'}
                      onChange={() => handleRoleChange('student')}
                      className="text-cyan-400 focus:ring-cyan-400"
                      disabled={isLoading}
                    />
                    <span className="text-white/90">Student</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value="teacher"
                      checked={formState.role === 'teacher'}
                      onChange={() => handleRoleChange('teacher')}
                      className="text-cyan-400 focus:ring-cyan-400"
                      disabled={isLoading}
                    />
                    <span className="text-white/90">Faculty</span>
                  </label>
                </div>
              </div>

              {/* Department Selection for Teachers */}
              {formState.role === 'teacher' && (
                <div className="mb-6">
                  <select
                    value={formState.department}
                    onChange={(e) => handleInput('department', e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full h-18 bg-white/5 border border-white/20 outline-none text-white/96 text-lg px-4 py-0 transition-all duration-300 disabled:opacity-50 rounded-lg focus:border-cyan-400"
                    style={{ height: "72px" }}
                  >
                    <option value="" className="bg-slate-800">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept} className="bg-slate-800">
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <PasswordInput
                name="password"
                placeholder="Password"
                onInput={handleInput}
                disabled={isLoading}
                required
              />

              <PasswordInput
                name="confirmPassword"
                placeholder="Confirm Password"
                onInput={handleInput}
                disabled={isLoading}
                required
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
                    Create Account
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-white/60 text-sm">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
