import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  BookOpenCheck,
  BriefcaseBusiness,
  Camera,
  CheckCircle2,
  ClipboardList,
  Clock,
  GraduationCap,
  Mail,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { BrandCarousel } from "@/components/public/brand-carousel";
import { Carousel } from "@/components/public/carousel";
import { CategoryCard } from "@/components/public/category-card";
import { FAQAccordion } from "@/components/public/faq-accordion";
import { GoogleReviewsSection } from "@/components/public/google-reviews-section";
import { HeroVideoSequence } from "@/components/animations/hero-video-sequence";
import { FadeIn } from "@/components/animations/fade-in";
import { PublicShell } from "@/components/public/public-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "@/components/ui/section-title";
import {
  getBrands,
  getCarouselSlides,
  getCategories,
  getFaqItems,
  getGoogleReviewSetting,
  getGoogleReviews,
  getHero,
  getSeoSetting,
  getSiteSetting,
} from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { buildWhatsappUrl } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(await getSeoSetting("home"));
}

const differentiators: Array<[string, string, LucideIcon]> = [
  ["+50 marcas premium", "Curadoria para qualidade, performance e confiança.", BadgeCheck],
  ["Atendimento especializado", "Orientação direta para escolher o produto ideal.", MessageCircle],
  ["Carro e casa", "Soluções para veículos, superfícies e rotina doméstica.", Store],
  ["Clientes e profissionais", "Produtos para uso final, lava-jatos e detalhadores.", Sparkles],
  ["Marcas reconhecidas", "Mix com nomes fortes do mercado de cuidado premium.", ShieldCheck],
  ["Compra orientada", "Atendimento pelo WhatsApp, sem virar e-commerce complexo.", CheckCircle2],
];

const institutionalContacts = [
  ["Comercial", "comercial@lojacarroecasa.com.br"],
  ["Financeiro", "financeiro@lojacarroecasa.com.br"],
  ["Administrativo", "adm@lojacarroecasa.com.br"],
];

const businessServices: Array<[string, string, LucideIcon]> = [
  ["Consultoria especializada", "Suporte para aprimorar protocolos, escolhas técnicas e resultados.", BriefcaseBusiness],
  ["Treinamentos personalizados", "Capacitação objetiva para equipes, profissionais e rotinas de atendimento.", GraduationCap],
  ["Cardápio de serviços", "Estruturação de ofertas para detalhamento, estética e cuidados recorrentes.", ClipboardList],
  ["Acompanhamento técnico", "Orientação contínua para evolução, segurança e crescimento profissional.", BookOpenCheck],
];

export default async function HomePage() {
  const [settings, hero, slides, brands, categories, faqs, googleReviewSetting, googleReviews] =
    await Promise.all([
    getSiteSetting(),
    getHero(),
    getCarouselSlides(true),
    getBrands(true),
    getCategories(true),
    getFaqItems(true),
    getGoogleReviewSetting(),
    getGoogleReviews(true),
  ]);

  const whatsappUrl = buildWhatsappUrl(settings.whatsappNumber, settings.whatsappMessage);
  const primaryHeroUrl = hero.primaryButtonUrl || whatsappUrl;
  const secondaryHeroUrl = hero.secondaryButtonUrl || settings.instagramUrl;

  return (
    <PublicShell>
      <main>
        <HeroVideoSequence hero={hero} whatsappUrl={whatsappUrl} />

        <section className="bg-background py-16">
          <Container>
            <FadeIn>
              <Carousel slides={slides} />
            </FadeIn>
          </Container>
        </section>

        <section id="marcas" className="bg-white py-16">
          <Container>
            <FadeIn>
              <SectionTitle
                align="center"
                eyebrow="Marcas"
                title="Marcas premium em destaque"
                text="Trabalhamos com mais de 50 marcas para oferecer qualidade, performance e confiança em cada escolha."
              />
              <BrandCarousel brands={brands} />
            </FadeIn>
          </Container>
        </section>

        <section id="produtos" className="bg-background py-16">
          <Container>
            <FadeIn direction="up">
              <SectionTitle
                eyebrow="Produtos"
                title="Soluções para cada cuidado"
                text="Uma seleção objetiva para carros, casa, profissionais e quem valoriza acabamento de alto nível."
              />
              <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categories.map((category, idx) => (
                  <FadeIn key={category.name} delay={idx * 0.1}>
                    <CategoryCard
                      category={category}
                      whatsappNumber={settings.whatsappNumber}
                    />
                  </FadeIn>
                ))}
              </div>
            </FadeIn>
          </Container>
        </section>

        <section id="empresas" className="bg-white py-16">
          <Container className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <FadeIn direction="right">
              <SectionTitle
                eyebrow="Empresas"
                title="Atendimento técnico para empresas e profissionais"
                text="Além da venda para consumo final, a Carro & Casa apoia empresas, lava-jatos e profissionais com consultorias, treinamentos e orientação estratégica para elevar a qualidade dos serviços."
              />
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button href="/empresas">
                  Conhecer soluções PJ
                </Button>
                <Button
                  href={buildWhatsappUrl(
                    settings.whatsappNumber,
                    "Olá! Quero saber mais sobre atendimento, consultoria e treinamentos para empresas.",
                  )}
                  variant="secondary"
                  target="_blank"
                >
                  <MessageCircle className="size-4" aria-hidden />
                  Falar com comercial
                </Button>
              </div>
            </FadeIn>
            <FadeIn direction="left" className="grid gap-3 sm:grid-cols-2">
              {businessServices.map(([title, text, Icon]) => (
                <Card key={title} className="group p-4 transition-all duration-300 hover:-translate-y-1 hover:border-brand/60 hover:shadow-md">
                  <div className="flex size-9 items-center justify-center rounded-md bg-brand/20 text-brand-dark transition-colors duration-300 group-hover:bg-brand">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-brand-dark transition-colors duration-200 group-hover:text-black">{title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-brand-dark/65">{text}</p>
                </Card>
              ))}
            </FadeIn>
          </Container>
        </section>

        <section id="sobre" className="relative overflow-hidden bg-brand-dark py-16 text-white">
          <div className="absolute inset-0">
            <Image
              src="/generated/carousel-home-care.png"
              alt=""
              fill
              sizes="100vw"
              className="object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/92 via-brand-dark/76 to-brand-dark/58" />
            <div className="absolute inset-0 bg-brand-dark/8" />
          </div>
          <Container className="relative grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <FadeIn direction="right">
              <SectionTitle
                eyebrow="Sobre"
                title={settings.businessName}
                text={settings.institutionalText}
                tone="inverse"
              />
            </FadeIn>
            <FadeIn direction="left" className="grid gap-3 sm:grid-cols-2">
              {differentiators.map(([title, text, Icon], idx) => (
                <div key={title as string} className="group rounded-lg border border-white/12 bg-white/[0.08] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.12)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand/50 hover:bg-white/[0.12]">
                  <Icon className="size-5 text-brand transition-transform duration-300 group-hover:scale-110" aria-hidden />
                  <h3 className="mt-3 text-base font-semibold">{title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-white/65">{text}</p>
                </div>
              ))}
            </FadeIn>
          </Container>
        </section>

        <section className="bg-brand py-12 text-brand-dark">
          <Container className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <FadeIn direction="right">
              <h2 className="text-balance text-3xl font-semibold">
                Quer encontrar o produto ideal?
              </h2>
              <p className="mt-2 max-w-2xl text-base leading-7 text-brand-dark/72">
                Fale com a equipe da Carro & Casa pelo WhatsApp e receba um atendimento direto e especializado.
              </p>
            </FadeIn>
            <FadeIn direction="left">
              <Button href={whatsappUrl} variant="dark" target="_blank">
                <MessageCircle className="size-4" aria-hidden />
                Chamar no WhatsApp
              </Button>
            </FadeIn>
          </Container>
        </section>

        <GoogleReviewsSection setting={googleReviewSetting} reviews={googleReviews} />

        <section id="faq" className="bg-background py-16">
          <Container className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <FadeIn direction="right" className="flex flex-col gap-6">
              <div>
                <SectionTitle
                  eyebrow="FAQ"
                  title="Dúvidas frequentes"
                  text="Respostas rápidas sobre atendimento, marcas e produtos."
                />
                <Button href="/faq" variant="secondary" className="mt-4">
                  Ver FAQ completo
                </Button>
              </div>

              <Card className="p-5 border-brand-dark/10 bg-white shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand text-brand-dark shadow-sm">
                    <MessageCircle className="size-5" aria-hidden />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-brand-dark">Atendimento Direto</h4>
                    <p className="text-xs text-brand-dark/60">Orientação técnica via WhatsApp</p>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-5 text-brand-dark/68">
                  Não encontrou o que procurava? Fale diretamente com nossos consultores para escolher o produto ideal para a sua necessidade.
                </p>
                {settings.openingHours ? (
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-brand-dark/60 border-t border-brand-dark/8 pt-3">
                    <Clock className="size-3.5 shrink-0 text-brand-dark/70" aria-hidden />
                    <span>{settings.openingHours}</span>
                  </p>
                ) : null}
                <Button
                  href={buildWhatsappUrl(
                    settings.whatsappNumber,
                    "Olá! Tenho uma dúvida sobre os produtos e gostaria de orientação.",
                  )}
                  className="mt-4 w-full h-10 text-xs"
                  target="_blank"
                >
                  <MessageCircle className="size-3.5" aria-hidden />
                  Tirar dúvidas no WhatsApp
                </Button>
              </Card>
            </FadeIn>
            <FadeIn direction="left">
              <FAQAccordion items={faqs.slice(0, 6)} />
            </FadeIn>
          </Container>
        </section>

        <section id="contato" className="bg-white py-16">
          <Container className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <FadeIn direction="right">
              <SectionTitle
                eyebrow="Contato"
                title="Atendimento direto pelos canais oficiais"
                text="Fale com a equipe pelo WhatsApp, acompanhe novidades no Instagram ou use o e-mail institucional ideal para cada assunto."
              />
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button href={whatsappUrl} target="_blank">
                  <MessageCircle className="size-4" aria-hidden />
                  WhatsApp
                </Button>
                <Button href={settings.instagramUrl} variant="secondary" target="_blank">
                  <Camera className="size-4" aria-hidden />
                  Instagram
                </Button>
              </div>
              
              {settings.googleMapsUrl && settings.address ? (
                <div className="mt-8 h-[250px] w-full overflow-hidden rounded-xl border border-brand-dark/10 shadow-sm">
                  <iframe 
                    src={`https://www.google.com/maps?q=${encodeURIComponent(settings.address)}&output=embed`}
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Localização da Loja"
                  />
                </div>
              ) : settings.googleMapsUrl ? (
                <Link href={settings.googleMapsUrl} target="_blank" className="mt-8 inline-block font-semibold text-brand-dark underline decoration-brand decoration-2 underline-offset-4">
                  Abrir localização no Google Maps
                </Link>
              ) : null}
            </FadeIn>
            <FadeIn direction="left">
              <Card className="p-5">
                <div>
                  <h3 className="text-lg font-semibold text-brand-dark">Canais institucionais</h3>
                  <p className="mt-1 text-sm leading-6 text-brand-dark/58">
                    Direcione sua mensagem para a área certa e mantenha o atendimento organizado.
                  </p>
                </div>
                <div className="mt-5 grid gap-3">
                  {institutionalContacts.map(([area, email]) => (
                    <a
                      key={email}
                      href={`mailto:${email}`}
                      className="group grid grid-cols-[2.5rem_1fr] gap-3 rounded-lg border border-brand-dark/8 bg-background/70 p-3 transition hover:border-brand/70 hover:bg-white"
                    >
                      <span className="flex size-10 items-center justify-center rounded-md bg-brand text-brand-dark">
                        <Mail className="size-4" aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-brand-dark">{area}</span>
                        <span className="mt-0.5 block break-words text-xs text-brand-dark/62 group-hover:text-brand-dark sm:text-sm">
                          {email}
                        </span>
                      </span>
                    </a>
                  ))}
                </div>
                <div className="mt-5 grid gap-4 border-t border-brand-dark/10 pt-5 text-sm leading-6 text-brand-dark/68">
                  {settings.address ? (
                    <p className="flex gap-3">
                      <MapPin className="mt-1 size-5 shrink-0 text-brand-dark" aria-hidden />
                      <span>{settings.address}</span>
                    </p>
                  ) : null}
                  {settings.openingHours ? (
                    <p>
                      <strong className="text-brand-dark">Horário:</strong> {settings.openingHours}
                    </p>
                  ) : null}
                  {settings.email ? (
                    <p>
                      <strong className="text-brand-dark">E-mail geral:</strong> {settings.email}
                    </p>
                  ) : null}
                </div>
              </Card>
            </FadeIn>
          </Container>
        </section>
      </main>
    </PublicShell>
  );
}
