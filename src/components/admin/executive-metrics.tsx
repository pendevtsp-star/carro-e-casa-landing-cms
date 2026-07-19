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
