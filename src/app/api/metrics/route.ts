import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const metricSchema = z.object({
  eventName: z.string().trim().min(1).max(80),
  eventCategory: z.string().trim().min(1).max(60),
  eventLabel: z.string().trim().max(160).optional().nullable(),
  pagePath: z.string().trim().min(1).max(300),
  pageTitle: z.string().trim().max(160).optional().nullable(),
  targetUrl: z.string().trim().max(500).optional().nullable(),
  referrer: z.string().trim().max(500).optional().nullable(),
  utmSource: z.string().trim().max(120).optional().nullable(),
  utmMedium: z.string().trim().max(120).optional().nullable(),
  utmCampaign: z.string().trim().max(160).optional().nullable(),
  utmContent: z.string().trim().max(160).optional().nullable(),
  utmTerm: z.string().trim().max(160).optional().nullable(),
  deviceType: z.enum(["desktop", "mobile", "tablet", "unknown"]),
  browser: z.string().trim().max(80).optional().nullable(),
  os: z.string().trim().max(80).optional().nullable(),
  visitorId: z.string().trim().max(80).optional().nullable(),
  sessionId: z.string().trim().max(80).optional().nullable(),
});

function cleanOptional(value: string | null | undefined) {
  return value?.trim() || null;
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 8192) {
    return NextResponse.json({ ok: false }, { status: 413 });
  }

  try {
    const parsed = metricSchema.parse(await request.json());

    await prisma.analyticsEvent.create({
      data: {
        eventName: parsed.eventName,
        eventCategory: parsed.eventCategory,
        eventLabel: cleanOptional(parsed.eventLabel),
        pagePath: parsed.pagePath,
        pageTitle: cleanOptional(parsed.pageTitle),
        targetUrl: cleanOptional(parsed.targetUrl),
        referrer: cleanOptional(parsed.referrer),
        utmSource: cleanOptional(parsed.utmSource),
        utmMedium: cleanOptional(parsed.utmMedium),
        utmCampaign: cleanOptional(parsed.utmCampaign),
        utmContent: cleanOptional(parsed.utmContent),
        utmTerm: cleanOptional(parsed.utmTerm),
        deviceType: parsed.deviceType,
        browser: cleanOptional(parsed.browser),
        os: cleanOptional(parsed.os),
        visitorId: cleanOptional(parsed.visitorId),
        sessionId: cleanOptional(parsed.sessionId),
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
