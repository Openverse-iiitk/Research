"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface TypedMessageProps {
  message: string;
  speed?: number;
}

export const TypedMessage: React.FC<TypedMessageProps> = ({ message, speed = 100 }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText("");
    setIsComplete(false);
    
    let currentIndex = 0;
    const timer = setInterval(() => {
      if (currentIndex <= message.length) {
        setDisplayedText(message.slice(0, currentIndex));
        currentIndex++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [message, speed]);

  return (
    <div className="typed-message">
      <span className="text-white">{displayedText}</span>
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
          className="text-cyan-400 ml-1"
        >
          |
        </motion.span>
      )}
    </div>
  );
};
