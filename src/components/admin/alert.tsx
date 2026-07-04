export function Alert({
  children,
  tone = "info",
}: {
  children: React.ReactNode;
  tone?: "info" | "success" | "warning";
}) {
  const classes = {
    info: "border-brand-dark/10 bg-white text-brand-dark/70",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
  };

  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${classes[tone]}`}>
      {children}
    </div>
  );
}
