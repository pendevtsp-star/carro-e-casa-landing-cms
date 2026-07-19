# Painel Executivo de Métricas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganizar `/admin/metricas` para abrir como uma tela executiva simples para a cliente, mantendo a análise técnica abaixo.

**Architecture:** Manter a rota existente e extrair apenas a lógica executiva para helpers puros testáveis. Criar componentes pequenos para cards executivos, leitura rápida e agrupamento de detalhes, preservando os dados e filtros atuais da página.

**Tech Stack:** Next.js App Router, TypeScript, React Server Components, Prisma, Tailwind CSS, lucide-react, npm.

## Global Constraints

- Não criar nova rota.
- Não criar novo modelo de banco.
- Não adicionar dependência externa.
- Preservar permissão atual `viewMetrics`.
- Usar dados existentes de `AnalyticsEvent`.
- Manter filtros, CSV, UTM, origem, páginas, dispositivos, timeline e eventos recentes.
- Página deve funcionar em desktop e mobile.
- Quando não houver eventos, mostrar zeros e texto útil.
- Validação obrigatória: `npm run lint`, `npm run typecheck`, `npm run build`.

---

## File Structure

- Create: `src/lib/metrics-summary.ts`
  - Responsável por transformar eventos em métricas executivas e frases de leitura rápida.
- Create: `src/components/admin/executive-metrics.tsx`
  - Responsável por renderizar cards executivos, lista de insights e seções de análise detalhada.
- Modify: `src/app/admin/(dashboard)/metricas/page.tsx`
  - Responsável por consultar dados, usar os helpers, reorganizar layout e preservar blocos atuais.

No database, migrations, API routes, permissions or authentication changes.

---

### Task 1: Extract Executive Metrics Logic

**Files:**
- Create: `src/lib/metrics-summary.ts`
- Modify: `src/app/admin/(dashboard)/metricas/page.tsx`

**Interfaces:**
- Consumes: current `MetricEvent` shape from `src/app/admin/(dashboard)/metricas/page.tsx`.
- Produces:
  - `type MetricSummaryEvent`
  - `type ExecutiveMetric`
  - `type ExecutiveInsight`
  - `function buildExecutiveMetrics(events: MetricSummaryEvent[]): ExecutiveMetricsResult`
  - `function formatMetricPercent(value: number): string`

- [ ] **Step 1: Create pure metrics helper**

Create `src/lib/metrics-summary.ts`:

```ts
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
  const topPage = countBy(pageViewEvents, (event) => event.pagePath)[0] || fallbackTop();
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
    insights.push({
      title: "Canal principal",
      text: `${topSource.label} foi o canal com mais acessos no período.`,
      tone: topSource.count > 0 ? "good" : "neutral",
    });

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
```

- [ ] **Step 2: Verify helper with a direct harness**

Run:

```bash
node --import tsx --input-type=module -e "const { buildExecutiveMetrics } = await import('./src/lib/metrics-summary.ts'); const result = buildExecutiveMetrics([{ eventName: 'page_view', eventLabel: null, pagePath: '/', utmSource: 'instagram', visitorId: 'v1', sessionId: 's1' }, { eventName: 'click_whatsapp', eventLabel: 'Falar no WhatsApp', pagePath: '/', utmSource: 'instagram', visitorId: 'v1', sessionId: 's1' }]); if (result.cards.length !== 4) throw new Error('cards'); if (result.whatsappClicks !== 1) throw new Error('whatsapp'); if (result.topSource.label !== 'instagram') throw new Error('source'); console.log('metrics-summary ok');"
```

Expected: `metrics-summary ok`.

- [ ] **Step 3: Import helper into metrics page without visual changes**

Modify `src/app/admin/(dashboard)/metricas/page.tsx`:

```ts
import { buildExecutiveMetrics, formatMetricPercent } from "@/lib/metrics-summary";
```

After `events` are loaded, add:

```ts
const executive = buildExecutiveMetrics(events);
```

Replace duplicate local values where safe:

```ts
const pageViews = executive.pageViews;
const whatsappClicks = executive.whatsappClicks;
const contactClicks = executive.contactClicks;
const visitors = executive.visitors;
const sessions = executive.sessions;
const conversionRate = executive.conversionRate;
```

Keep existing grouped arrays for `sources`, `pages`, `ctas`, `devices`, `timeline`, and `recentEvents`.

- [ ] **Step 4: Run validation**

Run:

```bash
npm run lint
npm run typecheck
```

Expected: both pass.

- [ ] **Step 5: Commit task**

```bash
git add src/lib/metrics-summary.ts "src/app/admin/(dashboard)/metricas/page.tsx"
git commit -m "Extract executive metrics summary"
```

---

### Task 2: Add Executive Metrics Components

**Files:**
- Create: `src/components/admin/executive-metrics.tsx`

**Interfaces:**
- Consumes:
  - `ExecutiveMetric` from `@/lib/metrics-summary`
  - `ExecutiveInsight` from `@/lib/metrics-summary`
- Produces:
  - `function ExecutiveMetricCard({ metric }: { metric: ExecutiveMetric }): JSX.Element`
  - `function ExecutiveMetricsGrid({ metrics }: { metrics: ExecutiveMetric[] }): JSX.Element`
  - `function InsightList({ insights }: { insights: ExecutiveInsight[] }): JSX.Element`
  - `function MetricsDetailSection({ title, description, children }: MetricsDetailSectionProps): JSX.Element`

- [ ] **Step 1: Create components**

Create `src/components/admin/executive-metrics.tsx`:

```tsx
import { CheckCircle2, CircleDot, Info, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import type { ExecutiveInsight, ExecutiveMetric } from "@/lib/metrics-summary";
import { cn } from "@/lib/utils";

const toneStyles = {
  good: "border-emerald-200 bg-emerald-50/70 text-emerald-900",
  watch: "border-amber-200 bg-amber-50/75 text-amber-950",
  neutral: "border-brand-dark/10 bg-white text-brand-dark",
};

const toneIcon = {
  good: CheckCircle2,
  watch: CircleDot,
  neutral: Info,
};

export function ExecutiveMetricCard({ metric }: { metric: ExecutiveMetric }) {
  return (
    <Card className={cn("p-4", toneStyles[metric.tone])}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold opacity-75">{metric.label}</p>
        <TrendingUp className="size-4 opacity-55" aria-hidden />
      </div>
      <p className="mt-3 break-words text-2xl font-semibold leading-tight">{metric.value}</p>
      <p className="mt-2 text-sm leading-5 opacity-72">{metric.detail}</p>
    </Card>
  );
}

export function ExecutiveMetricsGrid({ metrics }: { metrics: ExecutiveMetric[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <ExecutiveMetricCard key={metric.label} metric={metric} />
      ))}
    </div>
  );
}

export function InsightList({ insights }: { insights: ExecutiveInsight[] }) {
  return (
    <Card className="p-5">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-brand-dark">Leitura rápida</p>
        <p className="text-sm leading-6 text-brand-dark/58">
          Um resumo em linguagem simples sobre o período selecionado.
        </p>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {insights.map((insight) => {
          const Icon = toneIcon[insight.tone];

          return (
            <div key={`${insight.title}-${insight.text}`} className={cn("rounded-lg border p-3", toneStyles[insight.tone])}>
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 size-4 shrink-0 opacity-70" aria-hidden />
                <div>
                  <p className="text-sm font-semibold">{insight.title}</p>
                  <p className="mt-1 text-sm leading-5 opacity-75">{insight.text}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

type MetricsDetailSectionProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function MetricsDetailSection({
  title,
  description,
  children,
}: MetricsDetailSectionProps) {
  return (
    <section className="grid gap-4">
      <div>
        <h2 className="text-xl font-semibold text-brand-dark">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-brand-dark/58">{description}</p>
      </div>
      {children}
    </section>
  );
}
```

- [ ] **Step 2: Run validation**

Run:

```bash
npm run lint
npm run typecheck
```

Expected: both pass.

- [ ] **Step 3: Commit task**

```bash
git add src/components/admin/executive-metrics.tsx
git commit -m "Add executive metrics components"
```

---

### Task 3: Reorganize Metrics Page First Fold

**Files:**
- Modify: `src/app/admin/(dashboard)/metricas/page.tsx`

**Interfaces:**
- Consumes:
  - `executive.cards`
  - `executive.insights`
  - `ExecutiveMetricsGrid`
  - `InsightList`
  - `MetricsDetailSection`

- [ ] **Step 1: Add component imports**

Modify imports in `src/app/admin/(dashboard)/metricas/page.tsx`:

```ts
import {
  ExecutiveMetricsGrid,
  InsightList,
  MetricsDetailSection,
} from "@/components/admin/executive-metrics";
```

- [ ] **Step 2: Change page title copy**

Change `AdminPage` props:

```tsx
<AdminPage
  title="Desempenho da landing"
  description="Veja em poucos segundos quantas pessoas chegaram, quem demonstrou interesse e quais canais trouxeram mais resultado."
>
```

- [ ] **Step 3: Keep quick period selector and CSV at top**

Keep the existing quick selector block at the top, but ensure the CSV button is still in that same grid:

```tsx
<div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
  <div className="flex flex-wrap gap-2">
    {/* existing quick period links */}
  </div>
  <a
    href={`/admin/metricas/export${exportQuery ? `?${exportQuery}` : ""}`}
    className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand-dark px-4 text-sm font-semibold text-white transition hover:bg-black"
  >
    <Download className="size-4" aria-hidden />
    Exportar CSV
  </a>
</div>
```

- [ ] **Step 4: Move advanced filter form below executive summary**

Cut the existing `<Card className="p-4">` filter form from immediately below the quick selector.

Paste it later inside the detailed section created in Task 4.

- [ ] **Step 5: Add executive cards and insights after quick selector**

Insert after the quick selector:

```tsx
<ExecutiveMetricsGrid metrics={executive.cards} />
<InsightList insights={executive.insights} />
```

- [ ] **Step 6: Remove old dark report card duplication**

Remove the existing dark `Relatório para cliente` card from the page, because `ExecutiveMetricsGrid` and `InsightList` now cover that first-read purpose.

Keep `summaryCards` only if still used elsewhere. If it becomes unused, delete the `SummaryCard` type, `summaryCards` constant, and unused icon imports.

- [ ] **Step 7: Run validation**

Run:

```bash
npm run lint
npm run typecheck
```

Expected: both pass with no unused imports.

- [ ] **Step 8: Commit task**

```bash
git add "src/app/admin/(dashboard)/metricas/page.tsx"
git commit -m "Rework metrics page executive summary"
```

---

### Task 4: Group Detailed Analysis Below Executive Summary

**Files:**
- Modify: `src/app/admin/(dashboard)/metricas/page.tsx`

**Interfaces:**
- Consumes:
  - `MetricsDetailSection`
  - Existing timeline, source, CTA, page, device, event and UTM blocks.

- [ ] **Step 1: Wrap current technical blocks**

Wrap the existing technical content after executive summary with:

```tsx
<MetricsDetailSection
  title="Análise detalhada"
  description="Use esta área para investigar canais, campanhas, páginas, dispositivos e eventos específicos."
>
  {/* existing detailed cards go here */}
</MetricsDetailSection>
```

- [ ] **Step 2: Place advanced filters at start of detailed section**

Inside `MetricsDetailSection`, place the existing filter form first:

```tsx
<Card className="p-4">
  {/* existing advanced filter form */}
</Card>
```

- [ ] **Step 3: Keep the access and interaction split**

Preserve the existing two cards:

```tsx
<div className="grid gap-4 lg:grid-cols-2">
  {/* Acessos */}
  {/* Interações */}
</div>
```

If spacing feels too tall, change card padding from `p-5` to `p-4`, but do not change copy or calculations in this task.

- [ ] **Step 4: Keep UTM builder below analysis groups**

Ensure `<CampaignLinkBuilder />` remains available below the insight/detail cards, not hidden behind an accordion.

- [ ] **Step 5: Run validation**

Run:

```bash
npm run lint
npm run typecheck
npm run build
```

Expected: all pass.

- [ ] **Step 6: Commit task**

```bash
git add "src/app/admin/(dashboard)/metricas/page.tsx"
git commit -m "Group detailed metrics analysis"
```

---

### Task 5: Responsive Polish and Manual QA

**Files:**
- Modify only if needed:
  - `src/components/admin/executive-metrics.tsx`
  - `src/app/admin/(dashboard)/metricas/page.tsx`

**Interfaces:**
- Consumes completed layout from Tasks 1-4.
- Produces final shippable page.

- [ ] **Step 1: Run full validation**

Run:

```bash
npm run lint
npm run typecheck
npm run build
```

Expected: all pass.

- [ ] **Step 2: Start local server**

Run:

```bash
npm run dev
```

Expected: local Next.js server starts. If port 3000 is busy, Next chooses another port or rerun with a free port.

- [ ] **Step 3: Manual desktop check**

Open `/admin/metricas`.

Verify:

- Top fold shows title, quick period selector, CSV button, 4 executive cards and reading insights.
- Advanced filters are below the executive summary.
- Detailed analysis still includes timeline, origin/channel, buttons, pages, devices, recent events and UTM builder.
- No text overflow in cards.

- [ ] **Step 4: Manual mobile check**

Use browser responsive mode around 390px width.

Verify:

- Quick period buttons wrap cleanly.
- CSV button is reachable.
- Executive cards stack cleanly.
- Long values like `Direto / sem UTM` and page paths wrap without overflow.
- Advanced filters remain usable.

- [ ] **Step 5: Manual low-data check**

Use a period likely to have few or no events, for example `Hoje` if no data exists.

Verify:

- Cards show zero or safe fallback.
- Insights do not claim a winning channel when there is no data.
- Page does not hide filters or UTM builder.

- [ ] **Step 6: Commit polish if changed**

If Step 3-5 required changes:

```bash
git add src/components/admin/executive-metrics.tsx "src/app/admin/(dashboard)/metricas/page.tsx"
git commit -m "Polish executive metrics dashboard"
```

If no changes were required, do not create an empty commit.

---

### Task 6: Publish Through Existing GitHub Actions Flow

**Files:**
- No source edits expected.

**Interfaces:**
- Consumes committed work from Tasks 1-5.
- Produces pushed branch for GitHub Actions deploy.

- [ ] **Step 1: Inspect final local state**

Run:

```bash
git status --short
git log --oneline -5
```

Expected: working tree clean or only intentional uncommitted files.

- [ ] **Step 2: Push to GitHub**

Run:

```bash
git push origin main
```

Expected: push succeeds.

- [ ] **Step 3: Check GitHub Actions**

Run:

```bash
gh run list --repo pendevtsp-star/carro-e-casa-landing-cms --limit 6
```

Expected:

- `Deploy de producao` starts.
- `Quality - Checks` starts.
- Existing security workflows may still show known non-blocking findings about Action tag pinning or base image healthcheck.

- [ ] **Step 4: Report deployment status**

Report:

- commit hash pushed;
- validation commands that passed;
- whether deploy completed or is still running;
- any known security workflow warnings that are unchanged from previous decision.

---

## Self-Review

Spec coverage:

- Executive first fold: Task 3.
- Four executive cards: Task 1 and Task 2.
- Reading insights: Task 1 and Task 2.
- Preserve detailed metrics: Task 4.
- Preserve filters and CSV: Task 3 and Task 4.
- No DB/API/dependency changes: Global Constraints and File Structure.
- Empty states: Task 1 and Task 5.
- Responsiveness: Task 2 and Task 5.
- Validation: Tasks 1-6.

Placeholder scan:

- No `TBD`, `TODO`, `implement later`, or unspecified task remains.

Type consistency:

- `MetricSummaryEvent`, `ExecutiveMetric`, `ExecutiveInsight`, `ExecutiveMetricsResult`, `buildExecutiveMetrics`, and `formatMetricPercent` are defined in Task 1 and consumed consistently in later tasks.
