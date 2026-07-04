import { cn } from "@/lib/utils";

export function SectionTitle({
  eyebrow,
  title,
  text,
  align = "left",
  tone = "default",
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  align?: "left" | "center";
  tone?: "default" | "inverse";
}) {
  const inverse = tone === "inverse";

  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            "mb-2 text-xs font-bold uppercase tracking-[0.2em]",
            inverse ? "text-brand" : "text-brand-dark/55",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "text-balance text-3xl font-semibold tracking-normal sm:text-4xl",
          inverse ? "text-white" : "text-brand-dark",
        )}
      >
        {title}
      </h2>
      {text ? (
        <p
          className={cn(
            "mt-3 text-base leading-7",
            inverse ? "text-white/72" : "text-brand-dark/65",
          )}
        >
          {text}
        </p>
      ) : null}
    </div>
  );
}
