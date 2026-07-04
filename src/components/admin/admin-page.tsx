import { Toast } from "@/components/admin/toast";

export function AdminPage({
  title,
  description,
  saved,
  children,
}: {
  title: string;
  description?: string;
  saved?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-dark/45">
            Painel
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-brand-dark">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-brand-dark/62">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      <Toast saved={saved} />
      {children}
    </div>
  );
}
