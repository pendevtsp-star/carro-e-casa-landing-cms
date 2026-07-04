import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-brand-dark/10 bg-white shadow-[0_18px_60px_rgba(5,8,10,0.06)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
