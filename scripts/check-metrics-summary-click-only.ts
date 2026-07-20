import { buildExecutiveMetrics, formatMetricPageLabel, type MetricSummaryEvent } from "../src/lib/metrics-summary";

const clickOnlyEvents: MetricSummaryEvent[] = [
  {
    eventName: "click_whatsapp",
    eventLabel: "Falar pelo WhatsApp",
    pagePath: "/",
    utmSource: null,
    visitorId: "visitor-1",
    sessionId: "session-1",
  },
];

const metrics = buildExecutiveMetrics(clickOnlyEvents);
const misleadingInsight = metrics.insights.find((insight) =>
  insight.text.startsWith("Sem dados foi o canal"),
);

if (misleadingInsight) {
  throw new Error(`Click-only events produced a misleading channel insight: ${misleadingInsight.text}`);
}

if (!metrics.insights.some((insight) => insight.title === "WhatsApp gerou ação")) {
  throw new Error("Click-only events must retain the useful WhatsApp insight.");
}

if (!metrics.insights.some((insight) => insight.title === "Botão com mais ação")) {
  throw new Error("Click-only events must retain the useful CTA insight.");
}

const emptyMetrics = buildExecutiveMetrics([]);
if (emptyMetrics.insights.some((insight) => insight.text.includes("foi o canal com mais acessos"))) {
  throw new Error("Empty periods must not claim a winning channel.");
}

const trackedPageViews: MetricSummaryEvent[] = [
  {
    eventName: "page_view",
    eventLabel: "Página inicial",
    pagePath: "/?fbclid=abc&utm_source=instagram&utm_campaign=julho",
    utmSource: "instagram",
    visitorId: "visitor-2",
    sessionId: "session-2",
  },
  {
    eventName: "page_view",
    eventLabel: "Página inicial",
    pagePath: "/?fbclid=def&utm_source=google&utm_campaign=julho",
    utmSource: "google",
    visitorId: "visitor-3",
    sessionId: "session-3",
  },
];
const trackedMetrics = buildExecutiveMetrics(trackedPageViews);

if (formatMetricPageLabel("/?fbclid=abc") !== "Página inicial") {
  throw new Error("Tracked home URLs must be displayed as Página inicial.");
}

if (trackedMetrics.topPage.label !== "Página inicial" || trackedMetrics.topPage.count !== 2) {
  throw new Error(`Tracked home URLs must be grouped together. Got ${trackedMetrics.topPage.label}: ${trackedMetrics.topPage.count}`);
}

console.log("Click-only executive metrics harness passed.");
