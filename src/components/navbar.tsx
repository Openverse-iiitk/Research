"use client";
import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { LogOut, User, Settings } from "lucide-react";

const homeNavItems = [
  { name: "Home", href: "/" },
  { name: "Features", href: "/#features" },
  { name: "About", href: "/#team" },
  { name: "Blog", href: "/blog" },
  { name: "Opportunities", href: "/#opportunities" },
  { name: "Statistics", href: "/#statistics" },
];

const projectsNavItems = [
  { name: "Home", href: "/" },
  { name: "Projects", href: "/projects" },
  { name: "Blog", href: "/blog" },
  { name: "Conferences", href: "/projects#conferences" },
  { name: "Hackathons", href: "/projects#hackathons" },
];

export const Navbar = () => {
  const { scrollY } = useScroll();
  const [showBackground, setShowBackground] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, user, logout } = useAuth();

  // Determine which nav items to show based on current page
  const isProjectsPage = pathname?.startsWith('/projects') || pathname?.startsWith('/login') || pathname?.startsWith('/my-applications') || pathname?.startsWith('/teacher') || pathname?.startsWith('/blog') || pathname?.startsWith('/apply');
  const navItems = isProjectsPage ? projectsNavItems : homeNavItems;

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    router.push('/');
  };

  const handleAuthClick = () => {
    if (isLoggedIn) {
      if (user?.role === 'teacher') {
        router.push('/teacher');
      } else {
        router.push('/projects');
      }
    } else {
      router.push('/login');
    }
  };

  useMotionValueEvent(scrollY, "change", (value) => {
    if (value > 100) {
      setShowBackground(true);
    } else {
      setShowBackground(false);
    }
  });

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuOpen && !(event.target as Element).closest('.user-menu-container')) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  return (
        <motion.nav className="max-w-7xl fixed top-6 mx-auto inset-x-0 z-50 w-[95%] lg:w-full">
      <motion.div
        className={cn(
          "w-full flex relative justify-between px-6 py-4 rounded-3xl transition-all duration-500 mx-auto",
          "backdrop-blur-xl border border-white/10",
          "shadow-2xl shadow-cyan-500/10"
        )}
        animate={{
          width: showBackground ? "85%" : "100%",
          background: showBackground 
            ? "linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 50%, rgba(15, 23, 42, 0.9) 100%)"
            : "linear-gradient(135deg, rgba(15, 23, 42, 0.3) 0%, rgba(30, 41, 59, 0.2) 50%, rgba(15, 23, 42, 0.3) 100%)",
          borderColor: showBackground ? "rgba(56, 189, 248, 0.3)" : "rgba(255, 255, 255, 0.1)",
          boxShadow: showBackground 
            ? "0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(56, 189, 248, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
            : "0 25px 50px -12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)"
        }}
        transition={{
          duration: 0.6,
          ease: [0.23, 1, 0.32, 1]
        }}
      >
        <AnimatePresence>
          {showBackground && (
            <motion.div
              key={String(showBackground)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 1,
              }}
              className="absolute inset-0 h-full w-full bg-neutral-900 pointer-events-none [mask-image:linear-gradient(to_bottom,white,transparent,white)] rounded-full"
            />
          )}
        </AnimatePresence>
        
        <div className="flex flex-row gap-2 items-center">
          <Link href="/" className="text-xl font-bold text-white relative z-10">
            Research Connect
          </Link>
          <div className="hidden lg:flex items-center gap-1.5 ml-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => {
                  if (item.href.includes('#') && item.href.startsWith('/projects')) {
                    e.preventDefault();
                    const sectionId = item.href.split('#')[1];
                    const element = document.getElementById(sectionId);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }
                }}
                className="text-sm text-neutral-300 hover:text-white transition-colors px-3 py-2 rounded-md hover:bg-neutral-800/50 relative z-10"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="hidden lg:flex space-x-2 items-center relative z-10">
          {isLoggedIn ? (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-neutral-300">
                Welcome, {user?.email} ({user?.role})
              </span>
              <div className="relative user-menu-container">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 bg-neutral-800/50 hover:bg-neutral-700/50 rounded-lg border border-neutral-600 text-white transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm">{user?.role === 'teacher' ? 'Dashboard' : 'Profile'}</span>
                </motion.button>
                
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-neutral-900/95 backdrop-blur-xl border border-neutral-700 rounded-xl shadow-2xl p-2"
                    >
                      {user?.role === 'teacher' ? (
                        <>
                          <button
                            onClick={() => {
                              router.push('/teacher');
                              setUserMenuOpen(false);
                            }}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-left text-neutral-300 hover:text-white hover:bg-neutral-800/50 rounded-lg transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                            <span>Dashboard</span>
                          </button>
                          <button
                            onClick={() => {
                              router.push('/teacher/my-posts');
                              setUserMenuOpen(false);
                            }}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-left text-neutral-300 hover:text-white hover:bg-neutral-800/50 rounded-lg transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                            <span>My Posts</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              router.push('/projects');
                              setUserMenuOpen(false);
                            }}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-left text-neutral-300 hover:text-white hover:bg-neutral-800/50 rounded-lg transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                            <span>Projects</span>
                          </button>
                          <button
                            onClick={() => {
                              router.push('/my-applications');
                              setUserMenuOpen(false);
                            }}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-left text-neutral-300 hover:text-white hover:bg-neutral-800/50 rounded-lg transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                            <span>My Applications</span>
                          </button>
                        </>
                      )}
                      <hr className="my-2 border-neutral-700" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <>
              {isProjectsPage ? (
                <>
                  <Button variant="simple" as={Link} href="/">
                    Home
                  </Button>
                  <Button variant="primary" onClick={handleAuthClick}>
                    Login
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="simple" as={Link} href="/#team">
                    Contact
                  </Button>
                  <Button variant="primary" onClick={handleAuthClick}>
                    Get Started
                  </Button>
                </>
              )}
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="lg:hidden flex items-center relative z-10">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-neutral-300 hover:text-white transition-colors p-2"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </motion.div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="lg:hidden mt-4 mx-4 bg-gradient-to-br from-neutral-900/95 via-neutral-800/90 to-neutral-900/95 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 shadow-2xl shadow-cyan-500/10"
          >
            <div className="flex flex-col space-y-4">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    className="block text-lg text-neutral-300 hover:text-cyan-400 transition-all duration-300 px-4 py-3 rounded-xl hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/20"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              <div className="flex flex-col space-y-3 pt-4 border-t border-neutral-700/50">
                {isLoggedIn ? (
                  <>
                    <div className="px-4 py-2 text-sm text-neutral-400">
                      Welcome, {user?.email} ({user?.role})
                    </div>
                    {user?.role === 'teacher' ? (
                      <>
                        <Button variant="simple" onClick={() => { router.push('/teacher'); setMobileMenuOpen(false); }} className="w-full">
                          Dashboard
                        </Button>
                        <Button variant="simple" onClick={() => { router.push('/teacher/my-posts'); setMobileMenuOpen(false); }} className="w-full">
                          My Posts
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="simple" onClick={() => { router.push('/projects'); setMobileMenuOpen(false); }} className="w-full">
                          Projects
                        </Button>
                        <Button variant="simple" onClick={() => { router.push('/my-applications'); setMobileMenuOpen(false); }} className="w-full">
                          My Applications
                        </Button>
                      </>
                    )}
                    <Button variant="outline" onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full text-red-400 border-red-400 hover:bg-red-500/10">
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    {isProjectsPage ? (
                      <>
                        <Button variant="simple" as={Link} href="/" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                          Home
                        </Button>
                        <Button variant="primary" onClick={() => { handleAuthClick(); setMobileMenuOpen(false); }} className="w-full">
                          Login
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="simple" as={Link} href="/#team" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                          Contact
                        </Button>
                        <Button variant="primary" onClick={() => { handleAuthClick(); setMobileMenuOpen(false); }} className="w-full">
                          Get Started
                        </Button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
