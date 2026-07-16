import Link from "next/link";
import {
  FileQuestion,
  FileText,
  GalleryHorizontal,
  BarChart3,
  Home,
  Image,
  LayoutDashboard,
  LogOut,
  Palette,
  Search,
  Settings,
  Shapes,
  Star,
  Tags,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { logoutAction } from "@/app/admin/actions";
import { canAccessAdminPath } from "@/lib/admin-permissions";

const links: Array<[string, string, LucideIcon]> = [
  ["Dashboard", "/admin", LayoutDashboard],
  ["Métricas", "/admin/metricas", BarChart3],
  ["Configurações", "/admin/configuracoes", Settings],
  ["Home", "/admin/home", Home],
  ["Carrossel", "/admin/carrossel", GalleryHorizontal],
  ["Marcas", "/admin/marcas", Tags],
  ["Avaliações", "/admin/avaliacoes", Star],
  ["Categorias", "/admin/categorias", Shapes],
  ["FAQ", "/admin/faq", FileQuestion],
  ["Páginas legais", "/admin/paginas-legais", FileText],
  ["Mídia", "/admin/midia", Image],
  ["SEO", "/admin/seo", Search],
  ["Usuários", "/admin/usuarios", Users],
];

export function AdminSidebar({ role }: { role: string }) {
  const visibleLinks = links.filter(([, href]) => canAccessAdminPath(role, href));

  return (
    <aside className="border-r border-brand-dark/10 bg-white lg:min-h-screen">
      <div className="sticky top-0 flex h-full flex-col gap-6 p-4">
        <Link href="/admin" className="flex items-center gap-3 rounded-lg bg-brand-dark px-4 py-3 text-white">
          <Palette className="size-5 text-brand" aria-hidden />
          <span className="font-semibold">Carro & Casa</span>
        </Link>
        <nav className="grid gap-1" aria-label="Admin">
          {visibleLinks.map(([label, href, Icon]) => (
            <Link
              key={href}
              href={href as string}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-brand-dark/70 transition hover:bg-brand/15 hover:text-brand-dark"
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </Link>
          ))}
        </nav>
        <form action={logoutAction} className="mt-auto">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-brand-dark/70 transition hover:bg-brand-dark/5"
          >
            <LogOut className="size-4" aria-hidden />
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
