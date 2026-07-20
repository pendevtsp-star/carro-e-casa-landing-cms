export type MetricSummaryEvent = {
  eventName: string;
  eventLabel: string | null;
  pagePath: string;
  utmSource: string | null;
  visitorId: string | null;
  sessionId: string | null;
};

export type ExecutiveMetric = {
  label: string;
  value: string;
  detail: string;
  tone: "neutral" | "good" | "watch";
};

export type ExecutiveInsight = {
  title: string;
  text: string;
  tone: "neutral" | "good" | "watch";
};

export type ExecutiveMetricsResult = {
  pageViews: number;
  visitors: number;
  sessions: number;
  interactions: number;
  whatsappClicks: number;
  contactClicks: number;
  conversionRate: number;
  topSource: { label: string; count: number };
  topPage: { label: string; count: number };
  topCta: { label: string; count: number };
  cards: ExecutiveMetric[];
  insights: ExecutiveInsight[];
};

const contactEvents = new Set(["click_whatsapp", "click_email", "click_maps"]);

function compactNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

export function formatMetricPercent(value: number) {
  return `${value.toFixed(1).replace(".", ",")}%`;
}

function sourceLabel(source: string | null) {
  return source || "Direto / sem UTM";
}

function countBy(items: MetricSummaryEvent[], pick: (item: MetricSummaryEvent) => string) {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    const key = pick(item) || "Indefinido";
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function fallbackTop(label = "Sem dados") {
  return { label, count: 0 };
}

export function normalizeMetricPagePath(pagePath: string | null | undefined) {
  const rawPath = pagePath?.trim();
  if (!rawPath) return "/";

  try {
    const url = new URL(rawPath, "https://lojacarroecasa.com.br");
    return url.pathname || "/";
  } catch {
    const [withoutQuery] = rawPath.split("?");
    const [withoutHash] = withoutQuery.split("#");
    return withoutHash || "/";
  }
}

export function formatMetricPageLabel(pagePath: string | null | undefined) {
  const normalized = normalizeMetricPagePath(pagePath);

  if (normalized === "/") return "Página inicial";
  if (normalized === "/empresas") return "Empresas";
  if (normalized === "/faq") return "FAQ";
  if (normalized === "/privacidade") return "Privacidade";
  if (normalized === "/termos-de-uso") return "Termos de uso";

  return normalized;
}

export function buildExecutiveMetrics(events: MetricSummaryEvent[]): ExecutiveMetricsResult {
  const pageViewEvents = events.filter((event) => event.eventName === "page_view");
  const clickEvents = events.filter((event) => event.eventName.startsWith("click_"));
  const pageViews = pageViewEvents.length;
  const interactions = events.filter((event) => event.eventName !== "page_view").length;
  const whatsappClicks = events.filter((event) => event.eventName === "click_whatsapp").length;
  const contactClicks = events.filter((event) => contactEvents.has(event.eventName)).length;
  const visitors = new Set(events.map((event) => event.visitorId).filter(Boolean)).size;
  const sessions = new Set(events.map((event) => event.sessionId).filter(Boolean)).size;
  const conversionRate = pageViews ? (whatsappClicks / pageViews) * 100 : 0;

  const topSource = countBy(pageViewEvents, (event) => sourceLabel(event.utmSource))[0] || fallbackTop();
  const topPage = countBy(pageViewEvents, (event) => formatMetricPageLabel(event.pagePath))[0] || fallbackTop();
  const topCta = countBy(clickEvents, (event) => event.eventLabel || event.eventName)[0] || fallbackTop();
  const interested = contactClicks || interactions;
  const arrived = visitors || pageViews;

  const cards: ExecutiveMetric[] = [
    {
      label: "Pessoas chegaram",
      value: compactNumber(arrived),
      detail: visitors ? "visitantes únicos estimados" : "acessos registrados",
      tone: arrived > 0 ? "good" : "neutral",
    },
    {
      label: "Demonstraram interesse",
      value: compactNumber(interested),
      detail: contactClicks ? "ações de contato" : "interações registradas",
      tone: interested > 0 ? "good" : "neutral",
    },
    {
      label: "Taxa WhatsApp",
      value: formatMetricPercent(conversionRate),
      detail: "cliques no WhatsApp por acesso",
      tone: conversionRate >= 5 ? "good" : conversionRate > 0 ? "watch" : "neutral",
    },
    {
      label: "Melhor canal",
      value: topSource.label,
      detail: `${compactNumber(topSource.count)} acessos`,
      tone: topSource.count > 0 ? "good" : "neutral",
    },
  ];

  const insights: ExecutiveInsight[] = [];
  if (!events.length) {
    insights.push({
      title: "Ainda sem dados no período",
      text: "Quando visitantes acessarem a landing, os principais canais e ações aparecerão aqui.",
      tone: "neutral",
    });
  } else {
    if (pageViewEvents.length) {
      insights.push({
        title: "Canal principal",
        text: `${topSource.label} foi o canal com mais acessos no período.`,
        tone: "good",
      });
    } else {
      insights.push({
        title: "Ações sem acessos registrados",
        text: "Há interações registradas, mas nenhum acesso à landing neste período.",
        tone: "neutral",
      });
    }

    if (whatsappClicks > 0) {
      insights.push({
        title: "WhatsApp gerou ação",
        text: `O WhatsApp recebeu ${compactNumber(whatsappClicks)} cliques no período.`,
        tone: "good",
      });
    } else {
      insights.push({
        title: "Atenção ao WhatsApp",
        text: "Ainda não houve cliques no WhatsApp neste período.",
        tone: "watch",
      });
    }

    if (topPage.count > 0) {
      insights.push({
        title: "Página mais vista",
        text: `${topPage.label} concentrou ${compactNumber(topPage.count)} visualizações.`,
        tone: "neutral",
      });
    }

    if (topCta.count > 0) {
      insights.push({
        title: "Botão com mais ação",
        text: `${topCta.label} foi o CTA mais acionado.`,
        tone: "good",
      });
    }
  }

  return {
    pageViews,
    visitors,
    sessions,
    interactions,
    whatsappClicks,
    contactClicks,
    conversionRate,
    topSource,
    topPage,
    topCta,
    cards,
    insights: insights.slice(0, 5),
  };
}
