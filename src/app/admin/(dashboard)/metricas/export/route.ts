import { NextResponse } from "next/server";

import { requireCapability } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

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

function parseDate(value: string | null) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getDateRange(searchParams: URLSearchParams) {
  const now = new Date();
  const explicitStart = parseDate(searchParams.get("start"));
  const explicitEnd = parseDate(searchParams.get("end"));
  if (explicitStart && explicitEnd) {
    return { start: startOfDay(explicitStart), end: endOfDay(explicitEnd) };
  }

  if (searchParams.get("period") === "today") {
    return { start: startOfDay(now), end: endOfDay(now) };
  }

  if (searchParams.get("period") === "month") {
    const start = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
    return { start, end: endOfDay(now) };
  }

  const days = searchParams.get("period") === "90" ? 90 : searchParams.get("period") === "7" ? 7 : 30;
  const start = startOfDay(new Date(now));
  start.setDate(start.getDate() - (days - 1));
  return { start, end: endOfDay(now) };
}

function csvCell(value: unknown) {
  const text = value instanceof Date ? value.toISOString() : String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  await requireCapability("viewMetrics");
  const { searchParams } = new URL(request.url);
  const { start, end } = getDateRange(searchParams);
  const source = searchParams.get("source");

  const events = await prisma.analyticsEvent.findMany({
    where: {
      createdAt: { gte: start, lte: end },
      ...(searchParams.get("category") ? { eventCategory: searchParams.get("category") || undefined } : {}),
      ...(searchParams.get("event") ? { eventName: searchParams.get("event") || undefined } : {}),
      ...(searchParams.get("device") ? { deviceType: searchParams.get("device") || undefined } : {}),
      ...(source ? { utmSource: source === "__direct" ? null : source } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      createdAt: true,
      eventName: true,
      eventCategory: true,
      eventLabel: true,
      pagePath: true,
      targetUrl: true,
      referrer: true,
      utmSource: true,
      utmMedium: true,
      utmCampaign: true,
      utmContent: true,
      utmTerm: true,
      deviceType: true,
      browser: true,
      os: true,
    },
  });

  const header = [
    "data",
    "evento",
    "categoria",
    "detalhe",
    "pagina",
    "destino",
    "referencia",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "dispositivo",
    "navegador",
    "sistema",
  ];

  const rows = events.map((event) =>
    [
      event.createdAt,
      event.eventName,
      event.eventCategory,
      event.eventLabel,
      event.pagePath,
      event.targetUrl,
      event.referrer,
      event.utmSource,
      event.utmMedium,
      event.utmCampaign,
      event.utmContent,
      event.utmTerm,
      event.deviceType,
      event.browser,
      event.os,
    ].map(csvCell).join(","),
  );

  const csv = [header.map(csvCell).join(","), ...rows].join("\n");
  const fileName = `metricas-carro-casa-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
