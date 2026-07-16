CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "eventCategory" TEXT NOT NULL,
    "eventLabel" TEXT,
    "pagePath" TEXT NOT NULL,
    "pageTitle" TEXT,
    "targetUrl" TEXT,
    "referrer" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmContent" TEXT,
    "utmTerm" TEXT,
    "deviceType" TEXT NOT NULL,
    "browser" TEXT,
    "os" TEXT,
    "visitorId" TEXT,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AnalyticsEvent_createdAt_idx" ON "AnalyticsEvent"("createdAt");
CREATE INDEX "AnalyticsEvent_eventName_createdAt_idx" ON "AnalyticsEvent"("eventName", "createdAt");
CREATE INDEX "AnalyticsEvent_eventCategory_createdAt_idx" ON "AnalyticsEvent"("eventCategory", "createdAt");
CREATE INDEX "AnalyticsEvent_pagePath_createdAt_idx" ON "AnalyticsEvent"("pagePath", "createdAt");
CREATE INDEX "AnalyticsEvent_utmSource_createdAt_idx" ON "AnalyticsEvent"("utmSource", "createdAt");
