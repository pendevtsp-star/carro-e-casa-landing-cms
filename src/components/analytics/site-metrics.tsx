"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

type MetricPayload = {
  eventName: string;
  eventCategory: string;
  eventLabel?: string | null;
  targetUrl?: string | null;
};

const trackedSections: Record<string, string> = {
  inicio: "Início",
  marcas: "Marcas",
  produtos: "Produtos",
  empresas: "Empresas",
  avaliacoes: "Avaliações",
  sobre: "Sobre",
  faq: "FAQ",
  contato: "Contato",
};

function generateId() {
  const webCrypto = globalThis.crypto;

  if (webCrypto?.randomUUID) {
    return webCrypto.randomUUID();
  }

  if (webCrypto?.getRandomValues) {
    const bytes = webCrypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");

    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  return `${Date.now()}-${performance.now().toString(36).replace(".", "")}`;
}

function getStableId(storage: Storage, key: string) {
  const current = storage.getItem(key);
  if (current) return current;

  const generated = generateId();
  storage.setItem(key, generated);
  return generated;
}

function tryGetStableId(storage: Storage, key: string) {
  try {
    return getStableId(storage, key);
  } catch {
    return generateId();
  }
}

function getSessionId() {
  try {
    return getStableId(window.sessionStorage, "carro_casa_session_id");
  } catch {
    return null;
  }
}

function getVisitorId() {
  try {
    return getStableId(window.localStorage, "carro_casa_visitor_id");
  } catch {
    return tryGetStableId(window.sessionStorage, "carro_casa_visitor_fallback_id");
  }
}

function getDeviceType() {
  const ua = navigator.userAgent;
  if (/ipad|tablet|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return "mobile";
  return "desktop";
}

function getBrowser() {
  const ua = navigator.userAgent;
  if (/edg/i.test(ua)) return "Edge";
  if (/opr|opera/i.test(ua)) return "Opera";
  if (/chrome|crios/i.test(ua)) return "Chrome";
  if (/firefox|fxios/i.test(ua)) return "Firefox";
  if (/safari/i.test(ua)) return "Safari";
  return "Outro";
}

function getOs() {
  const ua = navigator.userAgent;
  if (/windows/i.test(ua)) return "Windows";
  if (/android/i.test(ua)) return "Android";
  if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
  if (/mac os/i.test(ua)) return "macOS";
  if (/linux/i.test(ua)) return "Linux";
  return "Outro";
}

function utmFromUrl(url: URL) {
  return {
    utmSource: url.searchParams.get("utm_source"),
    utmMedium: url.searchParams.get("utm_medium"),
    utmCampaign: url.searchParams.get("utm_campaign"),
    utmContent: url.searchParams.get("utm_content"),
    utmTerm: url.searchParams.get("utm_term"),
  };
}

function safeText(value: string | null | undefined, limit = 160) {
  return value?.replace(/\s+/g, " ").trim().slice(0, limit) || null;
}

function classifyLink(link: HTMLAnchorElement): MetricPayload | null {
  const href = link.href;
  const label = safeText(link.innerText || link.getAttribute("aria-label") || link.title);

  try {
    const url = new URL(href, window.location.href);
    const host = url.hostname.replace(/^www\./, "");
    const path = url.pathname;

    if (["wa.me", "api.whatsapp.com", "web.whatsapp.com"].includes(host)) {
      return {
        eventName: "click_whatsapp",
        eventCategory: "conversion",
        eventLabel: label || "WhatsApp",
        targetUrl: url.origin + path,
      };
    }

    if (host === "instagram.com") {
      return {
        eventName: "click_instagram",
        eventCategory: "social",
        eventLabel: label || "Instagram",
        targetUrl: url.origin + path,
      };
    }

    if (url.protocol === "mailto:") {
      return {
        eventName: "click_email",
        eventCategory: "contact",
        eventLabel: url.pathname || label || "E-mail",
        targetUrl: "mailto",
      };
    }

    if (host.includes("google.") && path.includes("/maps")) {
      return {
        eventName: "click_maps",
        eventCategory: "contact",
        eventLabel: label || "Google Maps",
        targetUrl: url.origin + path,
      };
    }

    if (url.origin === window.location.origin && url.pathname === "/empresas") {
      return {
        eventName: "click_business_page",
        eventCategory: "navigation",
        eventLabel: label || "Página empresas",
        targetUrl: url.pathname,
      };
    }

    if (url.origin === window.location.origin && url.hash) {
      return {
        eventName: "click_anchor",
        eventCategory: "navigation",
        eventLabel: label || url.hash,
        targetUrl: `${url.pathname}${url.hash}`,
      };
    }
  } catch {
    return null;
  }

  return null;
}

function sendMetric(metric: MetricPayload) {
  const url = new URL(window.location.href);
  const payload = {
    ...metric,
    pagePath: `${url.pathname}${url.search}`,
    pageTitle: document.title,
    referrer: document.referrer || null,
    ...utmFromUrl(url),
    deviceType: getDeviceType(),
    browser: getBrowser(),
    os: getOs(),
    visitorId: getVisitorId(),
    sessionId: getSessionId(),
  };

  const body = JSON.stringify(payload);
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/metrics", new Blob([body], { type: "application/json" }));
    return;
  }

  void fetch("/api/metrics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  });
}

export function SiteMetrics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/api")) return;

    sendMetric({
      eventName: "page_view",
      eventCategory: "traffic",
      eventLabel: pathname,
    });
  }, [pathname]);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/api")) return;

    function handleClick(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!link) return;

      const metric = classifyLink(link);
      if (metric) sendMetric(metric);
    }

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, [pathname]);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/api")) return;
    if (!("IntersectionObserver" in window)) return;

    const seen = new Set<string>();
    const sections = Object.keys(trackedSections)
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || seen.has(entry.target.id)) return;
          seen.add(entry.target.id);
          sendMetric({
            eventName: "section_view",
            eventCategory: "engagement",
            eventLabel: trackedSections[entry.target.id] || entry.target.id,
            targetUrl: `#${entry.target.id}`,
          });
        });
      },
      { threshold: 0.42 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
