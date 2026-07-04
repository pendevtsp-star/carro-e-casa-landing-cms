import type { Metadata } from "next";

import { PublicShell } from "@/components/public/public-shell";
import { Container } from "@/components/ui/container";
import { getLegalPage, getSeoSetting } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(await getSeoSetting("termos-de-uso"));
}

export default async function TermosPage() {
  const page = await getLegalPage("termos-de-uso");

  return (
    <PublicShell>
      <main className="bg-background py-20">
        <Container className="max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-dark/45">Legal</p>
          <h1 className="mt-3 text-4xl font-semibold text-brand-dark">{page.title}</h1>
          <article className="mt-8 whitespace-pre-line rounded-lg border border-brand-dark/10 bg-white p-6 text-base leading-8 text-brand-dark/70">
            {page.content}
          </article>
        </Container>
      </main>
    </PublicShell>
  );
}
