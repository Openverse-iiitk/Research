"use client";
import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AuthCodeError() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md text-center"
      >
        <div className="bg-gradient-to-br from-neutral-900/95 via-neutral-800/90 to-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </div>
          
          <h1 className="text-2xl font-light text-white mb-4">Authentication Error</h1>
          <p className="text-neutral-400 mb-8">
            There was an error during the authentication process. This could be due to:
          </p>
          
          <ul className="text-left text-neutral-400 mb-8 space-y-2">
            <li>• Invalid or expired authentication code</li>
            <li>• Network connectivity issues</li>
            <li>• Server configuration problems</li>
          </ul>
          
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium py-3 rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Login
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
