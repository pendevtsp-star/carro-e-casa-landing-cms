import Link from "next/link";
import {
  FileQuestion,
  GalleryHorizontal,
  Image,
  MessageCircle,
  Search,
  Settings,
  Star,
  Tags,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { AdminPage } from "@/components/admin/admin-page";
import { InstitutionalEmailCard } from "@/components/admin/institutional-email-card";
import { Card } from "@/components/ui/card";
import { getCurrentAdminUser } from "@/lib/admin-auth";
import { canAccessAdminPath } from "@/lib/admin-permissions";
import {
  getBrands,
  getCarouselSlides,
  getCategories,
  getFaqItems,
  getGoogleReviews,
  getSiteSetting,
} from "@/lib/content";

const cards: Array<[string, string, LucideIcon, string]> = [
  ["Configurações", "/admin/configuracoes", Settings, "WhatsApp, Instagram, endereço e acesso futuro ao sistema."],
  ["Home", "/admin/home", MessageCircle, "Hero, chamadas principais e imagem de destaque."],
  ["Carrossel", "/admin/carrossel", GalleryHorizontal, "Banners e campanhas institucionais."],
  ["Marcas", "/admin/marcas", Tags, "Marcas premium em destaque."],
  ["Avaliações", "/admin/avaliacoes", Star, "Depoimentos Google exibidos na landing."],
  ["FAQ", "/admin/faq", FileQuestion, "Perguntas frequentes da home e página completa."],
  ["Mídia", "/admin/midia", Image, "Upload e URLs das imagens."],
  ["SEO", "/admin/seo", Search, "Títulos, descrições e Open Graph."],
];

type DashboardProps = {
  searchParams: Promise<{ denied?: string }>;
};

export default async function AdminDashboardPage({ searchParams }: DashboardProps) {
  const [params, currentUser, settings, slides, brands, categories, faqs, reviews] = await Promise.all([
    searchParams,
    getCurrentAdminUser(),
    getSiteSetting(),
    getCarouselSlides(false),
    getBrands(false),
    getCategories(false),
    getFaqItems(false),
    getGoogleReviews(false),
  ]);
  const visibleCards = cards.filter(([, href]) => canAccessAdminPath(currentUser.role, href));

  return (
    <AdminPage
      title="Dashboard"
      description="Atalhos para manter a landing institucional da Carro & Casa sem mexer em código."
    >
      {params.denied === "1" ? (
        <Card className="border-amber-300 bg-amber-50 p-4 text-sm font-medium text-amber-900">
          Seu perfil não tem permissão para acessar aquela área.
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Slides", slides.length],
          ["Marcas", brands.length],
          ["Categorias", categories.length],
          ["FAQs", faqs.length],
          ["Avaliações", reviews.length],
        ].map(([label, value]) => (
          <Card key={label} className="p-5">
            <p className="text-sm text-brand-dark/55">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-brand-dark">{value}</p>
          </Card>
        ))}
      </div>

      <InstitutionalEmailCard email={currentUser.institutionalEmail} />

      <Card className="p-5">
        <p className="text-sm font-semibold text-brand-dark">Status do botão do sistema</p>
        <p className="mt-2 text-sm leading-6 text-brand-dark/62">
          {settings.appAccessEnabled
            ? `Ativo e apontando para ${settings.appAccessUrl}`
            : "Oculto por padrão até o SaaS estar pronto."}
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleCards.map(([label, href, Icon, text]) => (
          <Link key={href} href={href}>
            <Card className="h-full p-5 transition hover:-translate-y-1 hover:border-brand/60">
              <Icon className="size-6 text-brand-dark" aria-hidden />
              <h2 className="mt-4 text-lg font-semibold text-brand-dark">{label}</h2>
              <p className="mt-2 text-sm leading-6 text-brand-dark/58">{text}</p>
            </Card>
          </Link>
        ))}
      </div>
    </AdminPage>
  );
}
