import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

type ButtonProps = {
  href?: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "dark" | "ghost";
  className?: string;
  target?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
};

const variants = {
  primary:
    "bg-brand text-brand-dark shadow-[0_18px_45px_rgba(246,196,0,0.22)] hover:bg-[#ffd633]",
  secondary:
    "border border-brand-dark/15 bg-white text-brand-dark hover:border-brand-dark/35 hover:bg-brand/10",
  dark: "bg-brand-dark text-white hover:bg-black",
  ghost: "text-brand-dark hover:bg-brand-dark/5",
};

export function Button({
  href,
  children,
  variant = "primary",
  className,
  target,
  type = "button",
  disabled,
}: ButtonProps) {
  const classes = cn(
    "inline-flex h-12 items-center justify-center gap-2 rounded-md px-5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:pointer-events-none disabled:opacity-60",
    variants[variant],
    className,
  );

  if (href) {
    const isExternal = href.startsWith("http");
    return (
      <Link
        href={href}
        className={classes}
        target={target ?? (isExternal ? "_blank" : undefined)}
        rel={isExternal ? "noopener noreferrer" : undefined}
      >
        {children}
        {isExternal ? <ArrowUpRight aria-hidden className="size-4" /> : null}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled}>
      {children}
    </button>
  );
}
