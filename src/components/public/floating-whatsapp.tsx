"use client";

import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { buildWhatsappUrl, cn } from "@/lib/utils";

type FloatingWhatsappProps = {
  whatsappNumber: string;
  whatsappMessage: string;
};

export function FloatingWhatsapp({
  whatsappNumber,
  whatsappMessage,
}: FloatingWhatsappProps) {
  const [visible, setVisible] = useState(false);
  const whatsappUrl = buildWhatsappUrl(whatsappNumber, whatsappMessage);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 200);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-40 flex items-center gap-3 transition-all duration-500",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-8 opacity-0",
      )}
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar com a Carro & Casa no WhatsApp"
        className="group relative flex items-center gap-3 rounded-full border border-brand-dark/15 bg-brand-dark p-3 text-white shadow-[0_15px_35px_rgba(5,8,10,0.3)] transition-all duration-300 hover:scale-105 hover:bg-black hover:shadow-[0_20px_40px_rgba(246,196,0,0.3)] focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
      >
        <span className="absolute -inset-1 -z-10 rounded-full bg-brand/30 animate-pulse-ring" />

        <span className="relative flex size-10 items-center justify-center rounded-full bg-brand text-brand-dark shadow-md transition-transform duration-300 group-hover:rotate-12">
          <MessageCircle className="size-5" aria-hidden />
        </span>

        <div className="hidden pr-3 sm:block">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand">
            <span className="size-2 rounded-full bg-green-400 animate-ping" />
            Online
          </span>
          <span className="block text-xs font-medium text-white/90">
            Falar com especialista
          </span>
        </div>
      </a>
    </div>
  );
}
