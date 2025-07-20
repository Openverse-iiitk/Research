import { cn } from "@/lib/utils";
import React from "react";

export const Subheading = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p
      className={cn(
        "text-base md:text-lg text-neutral-400 tracking-wide leading-relaxed max-w-3xl",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
};
