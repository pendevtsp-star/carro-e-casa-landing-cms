"use client";

import { Copy, Link2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Card } from "@/components/ui/card";

type CampaignLinkBuilderProps = {
  siteUrl: string;
  whatsappUrl: string;
  instagramUrl: string;
};

const channelPresets = {
  instagram_bio: {
    label: "Instagram bio",
    base: "site",
    source: "instagram",
    medium: "bio",
  },
  instagram_stories: {
    label: "Instagram stories",
    base: "site",
    source: "instagram",
    medium: "stories",
  },
  google_ads: {
    label: "Google Ads",
    base: "site",
    source: "google",
    medium: "cpc",
  },
  whatsapp_direct: {
    label: "WhatsApp direto",
    base: "whatsapp",
    source: "whatsapp",
    medium: "direct",
  },
} as const;

function normalizeCampaign(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
}

export function CampaignLinkBuilder({
  siteUrl,
  whatsappUrl,
  instagramUrl,
}: CampaignLinkBuilderProps) {
  const [presetKey, setPresetKey] = useState<keyof typeof channelPresets>("instagram_bio");
  const [campaign, setCampaign] = useState("campanha_julho");
  const [content, setContent] = useState("");
  const [copied, setCopied] = useState(false);
  const preset = channelPresets[presetKey];

  const generatedLinks = useMemo(() => {
    const bases = {
      site: siteUrl,
      whatsapp: whatsappUrl,
      instagram: instagramUrl,
    };
    const target = new URL(bases[preset.base as keyof typeof bases]);
    target.searchParams.set("utm_source", preset.source);
    target.searchParams.set("utm_medium", preset.medium);
    target.searchParams.set("utm_campaign", normalizeCampaign(campaign) || "campanha");
    if (content.trim()) {
      target.searchParams.set("utm_content", normalizeCampaign(content));
    }

    return target.toString();
  }, [campaign, content, instagramUrl, preset, siteUrl, whatsappUrl]);

  async function copyLink() {
    await navigator.clipboard.writeText(generatedLinks);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link2 className="size-5 text-brand-dark" aria-hidden />
            <h2 className="text-lg font-semibold text-brand-dark">Links de campanha</h2>
          </div>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-brand-dark/58">
            Gere links com UTM para identificar de onde vieram os acessos e cliques no dashboard.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <label className="grid gap-1 text-sm font-medium text-brand-dark">
          Canal
          <select
            value={presetKey}
            onChange={(event) => setPresetKey(event.target.value as keyof typeof channelPresets)}
            className="rounded-md border border-brand-dark/15 bg-white px-3 py-2 text-sm"
          >
            {Object.entries(channelPresets).map(([key, item]) => (
              <option key={key} value={key}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium text-brand-dark">
          Campanha
          <input
            value={campaign}
            onChange={(event) => setCampaign(event.target.value)}
            className="rounded-md border border-brand-dark/15 bg-white px-3 py-2 text-sm"
            placeholder="ex: julho_promocional"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-brand-dark">
          Variação opcional
          <input
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="rounded-md border border-brand-dark/15 bg-white px-3 py-2 text-sm"
            placeholder="ex: banner_home"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-3 rounded-lg border border-brand-dark/10 bg-background p-3 md:grid-cols-[1fr_auto] md:items-center">
        <p className="break-all text-sm leading-6 text-brand-dark/72">{generatedLinks}</p>
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand-dark px-4 text-sm font-semibold text-white transition hover:bg-black"
        >
          <Copy className="size-4" aria-hidden />
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
    </Card>
  );
}
