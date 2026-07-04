"use client";

import { useState } from "react";
import { Copy, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type InstitutionalEmailCardProps = {
  email?: string | null;
};

export function InstitutionalEmailCard({ email }: InstitutionalEmailCardProps) {
  const [copied, setCopied] = useState(false);

  async function copyEmail() {
    if (!email) return;

    await navigator.clipboard.writeText(email);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <Card className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold text-brand-dark">
          <Mail className="size-4 text-brand-dark/65" aria-hidden />
          Meu e-mail institucional
        </div>
        {email ? (
          <>
            <p className="mt-3 text-xl font-semibold text-brand-dark">{email}</p>
            <p className="mt-2 text-sm leading-6 text-brand-dark/58">
              Use a senha da caixa postal LocaWeb. O painel não armazena senha de e-mail.
            </p>
          </>
        ) : (
          <p className="mt-3 text-sm leading-6 text-brand-dark/58">
            Nenhum e-mail institucional foi vinculado ao seu usuário ainda.
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        <Button href="https://webmail-seguro.com.br/v2/" variant="dark" className="h-10">
          Abrir Webmail
        </Button>
        {email ? (
          <button
            type="button"
            onClick={copyEmail}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-brand-dark/15 bg-white px-4 text-sm font-semibold text-brand-dark transition hover:border-brand-dark/35 hover:bg-brand/10"
          >
            <Copy className="size-4" aria-hidden />
            {copied ? "Copiado" : "Copiar e-mail"}
          </button>
        ) : null}
      </div>
      <div className="rounded-md border border-brand-dark/10 bg-brand-dark/[0.03] p-4 text-xs leading-6 text-brand-dark/60 lg:col-span-2">
        IMAP: <strong>email-ssl.com.br:993</strong> com SSL/TLS · SMTP:{" "}
        <strong>email-ssl.com.br:465</strong> com SSL/TLS · Usuário: e-mail completo
      </div>
    </Card>
  );
}
