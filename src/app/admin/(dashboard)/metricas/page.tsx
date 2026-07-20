import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Download,
  MousePointerClick,
  Users,
  View,
} from "lucide-react";

import { AdminPage } from "@/components/admin/admin-page";
import { CampaignLinkBuilder } from "@/components/admin/campaign-link-builder";
import { ExecutiveMetricsGrid, InsightList, MetricsDetailSection } from "@/components/admin/executive-metrics";
import { Card } from "@/components/ui/card";
import { requireCapability } from "@/lib/admin-auth";
import { getSiteSetting } from "@/lib/content";
import { buildExecutiveMetrics, formatMetricPageLabel, formatMetricPercent } from "@/lib/metrics-summary";
import { prisma } from "@/lib/prisma";
import { buildWhatsappUrl, cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type MetricsPageProps = {
  searchParams: Promise<{
    period?: string;
    start?: string;
    end?: string;
    category?: string;
    event?: string;
    device?: string;
    source?: string;
  }>;
};

type MetricEvent = {
  id: string;
  eventName: string;
  eventCategory: string;
  eventLabel: string | null;
  pagePath: string;
  targetUrl: string | null;
  utmSource: string | null;
  deviceType: string;
  browser: string | null;
  os: string | null;
  visitorId: string | null;
  sessionId: string | null;
  createdAt: Date;
};

const eventLabels: Record<string, string> = {
  page_view: "Visualização de página",
  section_view: "Visualização de seção",
  click_whatsapp: "Clique no WhatsApp",
  click_instagram: "Clique no Instagram",
  click_email: "Clique em e-mail",
  click_maps: "Clique no Maps",
  click_business_page: "Clique em empresas",
  click_anchor: "Clique no menu/seção",
};

const categoryLabels: Record<string, string> = {
  traffic: "Tráfego",
  conversion: "Conversão",
  social: "Social",
  contact: "Contato",
  navigation: "Navegação",
  engagement: "Engajamento",
};

const deviceLabels: Record<string, string> = {
  desktop: "Desktop",
  mobile: "Celular",
  tablet: "Tablet",
  unknown: "Indefinido",
};

type SummaryCard = [string, number, string, LucideIcon];

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function parseDate(value?: string) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatInputDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatDisplayDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(date);
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getDateRange(params: Awaited<MetricsPageProps["searchParams"]>) {
  const now = new Date();
  const explicitStart = parseDate(params.start);
  const explicitEnd = parseDate(params.end);
  if (explicitStart && explicitEnd) {
    return { start: startOfDay(explicitStart), end: endOfDay(explicitEnd), period: "custom" };
  }

  if (params.period === "today") {
    return { start: startOfDay(now), end: endOfDay(now), period: "today" };
  }

  if (params.period === "month") {
    return {
      start: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)),
      end: endOfDay(now),
      period: "month",
    };
  }

  const days = params.period === "90" ? 90 : params.period === "7" ? 7 : 30;
  const start = startOfDay(new Date(now));
  start.setDate(start.getDate() - (days - 1));
  return { start, end: endOfDay(now), period: String(days) };
}

function buildQuery(
  params: Awaited<MetricsPageProps["searchParams"]>,
  overrides: Record<string, string | null>,
) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  Object.entries(overrides).forEach(([key, value]) => {
    if (value) {
      query.set(key, value);
    } else {
      query.delete(key);
    }
  });
  return query.toString();
}

function hrefWithQuery(
  params: Awaited<MetricsPageProps["searchParams"]>,
  overrides: Record<string, string | null>,
) {
  const query = buildQuery(params, overrides);
  return query ? `/admin/metricas?${query}` : "/admin/metricas";
}

function percent(value: number, total: number) {
  if (!total) return "0%";
  return `${((value / total) * 100).toFixed(1).replace(".", ",")}%`;
}

function compactNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function groupCount<T extends string | null | undefined>(items: MetricEvent[], pick: (item: MetricEvent) => T) {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    const key = pick(item) || "Indefinido";
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function eventNameLabel(eventName: string) {
  return eventLabels[eventName] || eventName;
}

function sourceLabel(source: string | null) {
  return source || "Direto / sem UTM";
}

export default async function MetricsPage({ searchParams }: MetricsPageProps) {
  await requireCapability("viewMetrics");
  const params = await searchParams;
  const { start, end, period } = getDateRange(params);

  const where = {
    createdAt: { gte: start, lte: end },
    ...(params.category ? { eventCategory: params.category } : {}),
    ...(params.event ? { eventName: params.event } : {}),
    ...(params.device ? { deviceType: params.device } : {}),
    ...(params.source ? { utmSource: params.source === "__direct" ? null : params.source } : {}),
  };

  const [settings, events, allEventNames, allCategories, allDevices, allSources] = await Promise.all([
    getSiteSetting(),
    prisma.analyticsEvent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        eventName: true,
        eventCategory: true,
        eventLabel: true,
        pagePath: true,
        targetUrl: true,
        utmSource: true,
        deviceType: true,
        browser: true,
        os: true,
        visitorId: true,
        sessionId: true,
        createdAt: true,
      },
    }),
    prisma.analyticsEvent.groupBy({ by: ["eventName"], orderBy: { eventName: "asc" } }),
    prisma.analyticsEvent.groupBy({ by: ["eventCategory"], orderBy: { eventCategory: "asc" } }),
    prisma.analyticsEvent.groupBy({ by: ["deviceType"], orderBy: { deviceType: "asc" } }),
    prisma.analyticsEvent.groupBy({ by: ["utmSource"], orderBy: { utmSource: "asc" } }),
  ]);

  const executive = buildExecutiveMetrics(events);
  const pageViews = executive.pageViews;
  const whatsappClicks = executive.whatsappClicks;
  const contactClicks = executive.contactClicks;
  const visitors = executive.visitors;
  const sessions = executive.sessions;
  const conversionRate = executive.conversionRate;

  const previousStart = new Date(start);
  previousStart.setDate(previousStart.getDate() - Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000)));
  const previousEnd = new Date(start);
  previousEnd.setMilliseconds(previousEnd.getMilliseconds() - 1);
  const previousPageViews = await prisma.analyticsEvent.count({
    where: {
      eventName: "page_view",
      createdAt: { gte: previousStart, lte: previousEnd },
    },
  });
  const pageViewDelta = previousPageViews ? ((pageViews - previousPageViews) / previousPageViews) * 100 : null;

  const dateBuckets = new Map<string, { label: string; views: number; clicks: number }>();
  for (const event of events) {
    const key = formatInputDate(event.createdAt);
    const current = dateBuckets.get(key) || {
      label: formatDisplayDate(event.createdAt),
      views: 0,
      clicks: 0,
    };
    if (event.eventName === "page_view") current.views += 1;
    if (event.eventName.startsWith("click_")) current.clicks += 1;
    dateBuckets.set(key, current);
  }
  const timeline = Array.from(dateBuckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => value);
  const maxTimelineValue = Math.max(1, ...timeline.map((item) => Math.max(item.views, item.clicks)));

  const eventsByName = groupCount(events, (event) => event.eventName).slice(0, 8);
  const sources = groupCount(events.filter((event) => event.eventName === "page_view"), (event) => sourceLabel(event.utmSource)).slice(0, 8);
  const devices = groupCount(events, (event) => deviceLabels[event.deviceType] || event.deviceType);
  const pages = groupCount(events.filter((event) => event.eventName === "page_view"), (event) => formatMetricPageLabel(event.pagePath)).slice(0, 8);
  const ctas = groupCount(events.filter((event) => event.eventName.startsWith("click_")), (event) => event.eventLabel || eventNameLabel(event.eventName)).slice(0, 8);
  const recentEvents = events.slice(0, 30);
  const interactions = executive.interactions;
  const engagementRate = pageViews ? (interactions / pageViews) * 100 : 0;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lojacarroecasa.com.br";
  const whatsappUrl = buildWhatsappUrl(settings.whatsappNumber, settings.whatsappMessage);
  const exportQuery = buildQuery(params, {});
  const summaryCards: SummaryCard[] = [
    ["Acessos", pageViews, "Visualizações de página", View],
    ["Visitantes", visitors, "Navegadores únicos estimados", Users],
    ["Sessões", sessions, "Sessões do período", BarChart3],
    ["WhatsApp", whatsappClicks, `${formatMetricPercent(conversionRate)} por acesso`, MousePointerClick],
    ["Contatos", contactClicks, "WhatsApp, e-mail e localização", MousePointerClick],
  ];

  return (
    <AdminPage
      title="Desempenho da landing"
      description="Veja em poucos segundos quantas pessoas chegaram, quem demonstrou interesse e quais canais trouxeram mais resultado."
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="flex flex-wrap gap-2">
          {[
            ["Hoje", "today"],
            ["7 dias", "7"],
            ["30 dias", "30"],
            ["Este mês", "month"],
          ].map(([label, value]) => (
            <a
              key={value}
              href={hrefWithQuery(params, { period: value, start: null, end: null })}
              className={cn(
                "inline-flex h-10 items-center rounded-md border px-4 text-sm font-semibold transition",
                period === value
                  ? "border-brand bg-brand text-brand-dark"
                  : "border-brand-dark/15 bg-white text-brand-dark hover:bg-brand/10",
              )}
            >
              <CalendarDays className="mr-2 size-4" aria-hidden />
              {label}
            </a>
          ))}
        </div>
        <a
          href={`/admin/metricas/export${exportQuery ? `?${exportQuery}` : ""}`}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand-dark px-4 text-sm font-semibold text-white transition hover:bg-black"
        >
          <Download className="size-4" aria-hidden />
          Exportar CSV
        </a>
      </div>

      <ExecutiveMetricsGrid metrics={executive.cards} />
      <InsightList insights={executive.insights} />

      <MetricsDetailSection
        title="Análise detalhada"
        description="Use esta área para investigar canais, campanhas, páginas, dispositivos e eventos específicos."
      >
        <Card className="p-4">
          <form className="grid gap-3 md:grid-cols-6">
            <label className="grid gap-1 text-sm font-medium text-brand-dark">
              Período
              <select name="period" defaultValue={period} className="rounded-md border border-brand-dark/15 bg-white px-3 py-2 text-sm">
                <option value="today">Hoje</option>
                <option value="7">Últimos 7 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="90">Últimos 90 dias</option>
                <option value="month">Este mês</option>
                <option value="custom">Personalizado</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm font-medium text-brand-dark">
              Início
              <input name="start" type="date" defaultValue={formatInputDate(start)} className="rounded-md border border-brand-dark/15 bg-white px-3 py-2 text-sm" />
            </label>
            <label className="grid gap-1 text-sm font-medium text-brand-dark">
              Fim
              <input name="end" type="date" defaultValue={formatInputDate(end)} className="rounded-md border border-brand-dark/15 bg-white px-3 py-2 text-sm" />
            </label>
            <label className="grid gap-1 text-sm font-medium text-brand-dark">
              Evento
              <select name="event" defaultValue={params.event || ""} className="rounded-md border border-brand-dark/15 bg-white px-3 py-2 text-sm">
                <option value="">Todos</option>
                {allEventNames.map((item) => (
                  <option key={item.eventName} value={item.eventName}>{eventNameLabel(item.eventName)}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-medium text-brand-dark">
              Dispositivo
              <select name="device" defaultValue={params.device || ""} className="rounded-md border border-brand-dark/15 bg-white px-3 py-2 text-sm">
                <option value="">Todos</option>
                {allDevices.map((item) => (
                  <option key={item.deviceType} value={item.deviceType}>{deviceLabels[item.deviceType] || item.deviceType}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-medium text-brand-dark">
              Origem
              <select name="source" defaultValue={params.source || ""} className="rounded-md border border-brand-dark/15 bg-white px-3 py-2 text-sm">
                <option value="">Todas</option>
                <option value="__direct">Direto / sem UTM</option>
                {allSources
                  .filter((item) => item.utmSource)
                  .map((item) => (
                    <option key={item.utmSource} value={item.utmSource || ""}>{item.utmSource}</option>
                  ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-medium text-brand-dark md:col-span-2">
              Categoria
              <select name="category" defaultValue={params.category || ""} className="rounded-md border border-brand-dark/15 bg-white px-3 py-2 text-sm">
                <option value="">Todas</option>
                {allCategories.map((item) => (
                  <option key={item.eventCategory} value={item.eventCategory}>{categoryLabels[item.eventCategory] || item.eventCategory}</option>
                ))}
              </select>
            </label>
            <div className="flex items-end gap-2 md:col-span-4">
              <button type="submit" className="rounded-md bg-brand-dark px-4 py-2 text-sm font-semibold text-white transition hover:bg-black">
                Aplicar filtros
              </button>
              <a href="/admin/metricas" className="rounded-md border border-brand-dark/15 bg-white px-4 py-2 text-sm font-semibold text-brand-dark transition hover:bg-brand/10">
                Limpar
              </a>
            </div>
          </form>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-dark/45">
                  Acessos
                </p>
                <h2 className="mt-2 text-xl font-semibold text-brand-dark">Chegada e alcance</h2>
              </div>
              <View className="size-6 text-brand-dark/40" aria-hidden />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <MiniStat label="Acessos" value={compactNumber(pageViews)} />
              <MiniStat label="Visitantes" value={compactNumber(visitors)} />
              <MiniStat label="Sessões" value={compactNumber(sessions)} />
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-dark/45">
                  Interações
                </p>
                <h2 className="mt-2 text-xl font-semibold text-brand-dark">Intenção e contato</h2>
              </div>
              <MousePointerClick className="size-6 text-brand-dark/40" aria-hidden />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <MiniStat label="Cliques" value={compactNumber(interactions)} />
              <MiniStat label="WhatsApp" value={compactNumber(whatsappClicks)} />
              <MiniStat label="Taxa" value={`${engagementRate.toFixed(1).replace(".", ",")}%`} />
            </div>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {summaryCards.map(([label, value, detail, Icon]) => (
            <Card key={String(label)} className="p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-brand-dark/55">{label as string}</p>
                <Icon className="size-5 text-brand-dark/45" aria-hidden />
              </div>
              <p className="mt-3 text-3xl font-semibold text-brand-dark">{compactNumber(value)}</p>
              <p className="mt-1 text-xs leading-5 text-brand-dark/55">{detail}</p>
            </Card>
          ))}
        </div>

        <Card className="p-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-brand-dark">Evolução diária</h2>
              <p className="text-sm text-brand-dark/58">Acessos e cliques registrados no período filtrado.</p>
            </div>
            <div className={cn("inline-flex items-center gap-1 text-sm font-semibold", pageViewDelta === null || pageViewDelta >= 0 ? "text-emerald-700" : "text-red-700")}>
              {pageViewDelta === null ? null : pageViewDelta >= 0 ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
              {pageViewDelta === null ? "Sem período anterior" : `${Math.abs(pageViewDelta).toFixed(1).replace(".", ",")}% vs. período anterior`}
            </div>
          </div>
          <div className="mt-6 grid min-h-64 grid-cols-[auto_1fr] gap-x-3 gap-y-3">
            {timeline.length ? timeline.map((item) => (
              <div key={item.label} className="contents">
                <span className="py-1 text-xs font-medium text-brand-dark/48">{item.label}</span>
                <div className="grid gap-1">
                  <div className="h-3 rounded-full bg-brand-dark/8">
                    <div className="h-3 rounded-full bg-brand-dark" style={{ width: `${Math.max(4, (item.views / maxTimelineValue) * 100)}%` }} />
                  </div>
                  <div className="h-3 rounded-full bg-brand/20">
                    <div className="h-3 rounded-full bg-brand" style={{ width: `${Math.max(4, (item.clicks / maxTimelineValue) * 100)}%` }} />
                  </div>
                </div>
              </div>
            )) : (
              <p className="col-span-2 text-sm text-brand-dark/58">Ainda não há dados para o período selecionado.</p>
            )}
          </div>
          <div className="mt-4 flex gap-4 text-xs text-brand-dark/58">
            <span className="inline-flex items-center gap-2"><span className="size-3 rounded-full bg-brand-dark" /> Acessos</span>
            <span className="inline-flex items-center gap-2"><span className="size-3 rounded-full bg-brand" /> Cliques</span>
          </div>
        </Card>

        <div className="grid gap-4 xl:grid-cols-2">
          <MetricList title="Eventos mais registrados" items={eventsByName.map((item) => ({ ...item, label: eventNameLabel(item.label) }))} total={events.length} />
          <MetricList title="Botões e links mais clicados" items={ctas} total={Math.max(1, ctas.reduce((sum, item) => sum + item.count, 0))} />
          <MetricList title="Origem dos acessos" items={sources} total={Math.max(1, pageViews)} />
          <MetricList title="Dispositivos" items={devices} total={Math.max(1, events.length)} />
          <MetricList title="Páginas mais acessadas" items={pages} total={Math.max(1, pageViews)} />
        </div>

        <CampaignLinkBuilder
          siteUrl={siteUrl}
          whatsappUrl={whatsappUrl}
          instagramUrl={settings.instagramUrl}
        />

        <Card className="overflow-hidden">
          <div className="border-b border-brand-dark/10 p-5">
            <h2 className="text-lg font-semibold text-brand-dark">Eventos recentes</h2>
            <p className="mt-1 text-sm text-brand-dark/58">Últimos registros conforme os filtros aplicados.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-background text-xs uppercase tracking-[0.14em] text-brand-dark/45">
                <tr>
                  <th className="px-5 py-3">Data</th>
                  <th className="px-5 py-3">Evento</th>
                  <th className="px-5 py-3">Detalhe</th>
                  <th className="px-5 py-3">Página</th>
                  <th className="px-5 py-3">Origem</th>
                  <th className="px-5 py-3">Dispositivo</th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.map((event) => (
                  <tr key={event.id} className="border-t border-brand-dark/8">
                    <td className="px-5 py-3 text-brand-dark/58">{formatDateTime(event.createdAt)}</td>
                    <td className="px-5 py-3 font-semibold text-brand-dark">{eventNameLabel(event.eventName)}</td>
                    <td className="px-5 py-3 text-brand-dark/64">{event.eventLabel || event.targetUrl || "-"}</td>
                    <td className="px-5 py-3 text-brand-dark/64">{formatMetricPageLabel(event.pagePath)}</td>
                    <td className="px-5 py-3 text-brand-dark/64">{sourceLabel(event.utmSource)}</td>
                    <td className="px-5 py-3 text-brand-dark/64">
                      {deviceLabels[event.deviceType] || event.deviceType}
                      {event.browser ? ` / ${event.browser}` : ""}
                    </td>
                  </tr>
                ))}
                {!recentEvents.length ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-brand-dark/58">
                      Nenhum evento registrado para os filtros atuais.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Card>
      </MetricsDetailSection>
    </AdminPage>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-brand-dark/8 bg-background p-3">
      <p className="text-xs font-medium text-brand-dark/48">{label}</p>
      <p className="mt-1 truncate text-xl font-semibold text-brand-dark">{value}</p>
    </div>
  );
}

function MetricList({
  title,
  items,
  total,
}: {
  title: string;
  items: Array<{ label: string; count: number }>;
  total: number;
}) {
  return (
    <Card className="p-5">
      <h2 className="text-lg font-semibold text-brand-dark">{title}</h2>
      <div className="mt-4 grid gap-3">
        {items.length ? items.map((item) => (
          <div key={item.label} className="grid gap-1">
            <div className="flex items-start justify-between gap-3 text-sm">
              <span className="min-w-0 break-words font-medium text-brand-dark">{item.label}</span>
              <span className="shrink-0 text-brand-dark/58">{compactNumber(item.count)} · {percent(item.count, total)}</span>
            </div>
            <div className="h-2 rounded-full bg-brand-dark/8">
              <div className="h-2 rounded-full bg-brand" style={{ width: `${Math.max(4, (item.count / Math.max(1, total)) * 100)}%` }} />
            </div>
          </div>
        )) : (
          <p className="text-sm text-brand-dark/58">Sem dados no período.</p>
        )}
      </div>
    </Card>
  );
}
