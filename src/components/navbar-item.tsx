"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
  active?: boolean;
  className?: string;
  target?: string;
};

export function NavbarItem({
  children,
  href,
  active,
  target,
  className,
}: Props) {
  const pathname = usePathname();
  const isActive = active || pathname === href;

  return (
    <Link
      href={href}
      target={target}
      className={cn(
        "text-sm text-neutral-300 hover:text-white transition-colors px-3 py-2 rounded-md hover:bg-neutral-800/50 relative",
        isActive && "text-white bg-neutral-800/30",
        className
      )}
    >
      {children}
    </Link>
  );
}
