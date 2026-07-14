"use client";

import Script from "next/script";
import { useEffect } from "react";

const googleAdsId = "AW-16842267245";
const whatsappConversionTarget = "AW-16842267245/5rJlCI7itdAcEO20gt8-";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function isWhatsappUrl(href: string) {
  try {
    const url = new URL(href, window.location.href);
    return ["wa.me", "api.whatsapp.com", "web.whatsapp.com"].includes(url.hostname);
  } catch {
    return false;
  }
}

function trackWhatsappConversion() {
  window.gtag?.("event", "conversion", {
    send_to: whatsappConversionTarget,
    transport_type: "beacon",
  });
}

export function GoogleAdsTracking() {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;

      const link = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!link || !isWhatsappUrl(link.href)) return;

      trackWhatsappConversion();
    }

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, []);

  return (
    <>
      <Script
        id="google-ads-tag"
        src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${googleAdsId}');
        `}
      </Script>
    </>
  );
}
