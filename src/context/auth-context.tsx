"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

type UserRole = 'student' | 'teacher';

interface User {
  email: string;
  role: UserRole;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  requireAuth: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userData = localStorage.getItem('user');
    if (loggedIn && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    // Simple fake authentication with role-based users
    let userData: User | null = null;
    
    if (email === 'admin' && password === 'admin') {
      userData = { email: 'admin', role: 'student' };
    } else if (email === 'teacher' && password === 'teacher') {
      userData = { email: 'teacher', role: 'teacher' };
    }
    
    if (userData) {
      setIsLoggedIn(true);
      setUser(userData);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
  };

  const requireAuth = (): boolean => {
    if (!isLoggedIn) {
      // Redirect to login page
      window.location.href = '/login';
      return false;
    }
    return true;
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, requireAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
