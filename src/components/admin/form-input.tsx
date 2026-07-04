import { cn } from "@/lib/utils";

type BaseProps = {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  placeholder?: string;
  help?: string;
  required?: boolean;
  className?: string;
};

export function FormInput({
  label,
  name,
  defaultValue,
  placeholder,
  help,
  required,
  className,
  type = "text",
}: BaseProps & { type?: string }) {
  return (
    <label className={cn("grid gap-2", className)}>
      <span className="text-sm font-semibold text-brand-dark">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        required={required}
        className="h-11 rounded-md border border-brand-dark/12 bg-white px-3 text-sm text-brand-dark shadow-sm transition placeholder:text-brand-dark/35 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
      />
      {help ? <span className="text-xs leading-5 text-brand-dark/55">{help}</span> : null}
    </label>
  );
}

export function FormTextarea({
  label,
  name,
  defaultValue,
  placeholder,
  help,
  required,
  className,
  rows = 5,
}: BaseProps & { rows?: number }) {
  return (
    <label className={cn("grid gap-2", className)}>
      <span className="text-sm font-semibold text-brand-dark">{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className="rounded-md border border-brand-dark/12 bg-white px-3 py-3 text-sm leading-6 text-brand-dark shadow-sm transition placeholder:text-brand-dark/35 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
      />
      {help ? <span className="text-xs leading-5 text-brand-dark/55">{help}</span> : null}
    </label>
  );
}

export function FormCheckbox({
  label,
  name,
  defaultChecked,
  help,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
  help?: string;
}) {
  return (
    <label className="flex items-start gap-3 rounded-md border border-brand-dark/10 bg-white px-3 py-3">
      <input
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="mt-1 size-4 accent-brand"
      />
      <span>
        <span className="block text-sm font-semibold text-brand-dark">{label}</span>
        {help ? <span className="text-xs leading-5 text-brand-dark/55">{help}</span> : null}
      </span>
    </label>
  );
}

export function FormSelect({
  label,
  name,
  defaultValue,
  help,
  required,
  className,
  options,
}: BaseProps & { options: Array<{ label: string; value: string }> }) {
  return (
    <label className={cn("grid gap-2", className)}>
      <span className="text-sm font-semibold text-brand-dark">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        className="h-11 rounded-md border border-brand-dark/12 bg-white px-3 text-sm text-brand-dark shadow-sm transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {help ? <span className="text-xs leading-5 text-brand-dark/55">{help}</span> : null}
    </label>
  );
}
