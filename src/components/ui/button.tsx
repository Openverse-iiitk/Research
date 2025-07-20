import { cn } from "@/lib/utils";
import React from "react";

interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  variant?: "simple" | "outline" | "primary" | "muted";
  as?: React.ElementType;
  className?: string;
  children?: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  as: Tag = "button",
  className,
  children,
  ...props
}) => {
  const variantClass =
    variant === "simple"
      ? "bg-transparent relative z-10 hover:border-cyan-400/50 hover:bg-cyan-400/10 hover:shadow-lg hover:shadow-cyan-400/20 border border-neutral-600 text-white text-sm md:text-sm transition-all font-medium duration-300 rounded-xl px-4 py-2 flex items-center justify-center backdrop-blur-sm"
      : variant === "outline"
      ? "bg-gradient-to-r from-cyan-500/20 to-gray-600/20 relative z-10 hover:from-cyan-400/30 hover:to-gray-500/30 hover:shadow-xl hover:shadow-cyan-400/20 text-white border border-cyan-400/50 hover:border-cyan-300 text-sm md:text-sm transition-all font-medium duration-300 rounded-xl px-4 py-2 flex items-center justify-center backdrop-blur-sm"
      : variant === "primary"
      ? "bg-gradient-to-r from-cyan-500 to-gray-600 relative z-10 hover:from-cyan-400 hover:to-gray-500 hover:shadow-lg hover:shadow-cyan-400/30 border border-cyan-400/50 text-white text-sm md:text-sm transition-all font-medium duration-300 rounded-xl px-4 py-2 flex items-center justify-center shadow-[0px_-1px_0px_0px_#FFFFFF30_inset,_0px_1px_0px_0px_#FFFFFF30_inset] hover:-translate-y-1 active:-translate-y-0"
      : variant === "muted"
      ? "bg-neutral-800/80 relative z-10 hover:bg-neutral-700/80 hover:shadow-lg hover:shadow-neutral-400/20 border border-neutral-600 text-white text-sm md:text-sm transition-all font-medium duration-300 rounded-xl px-4 py-2 flex items-center justify-center shadow-[0px_1px_0px_0px_#FFFFFF20_inset] backdrop-blur-sm"
      : "";
  return (
    <Tag
      className={cn(
        "bg-secondary relative z-10 bg-transparent hover:border-secondary hover:bg-secondary/50  border border-transparent text-white text-sm md:text-sm transition font-medium duration-200  rounded-md px-4 py-2  flex items-center justify-center ",
        variantClass,
        className
      )}
      {...props}
    >
      {children ?? `Get Started`}
    </Tag>
  );
};
