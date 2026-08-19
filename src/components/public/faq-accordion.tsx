"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

type FAQItem = {
  id?: string;
  question: string;
  answer: string;
};

export function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isOpen = open === index;
        return (
          <div
            key={item.id ?? item.question}
            className={cn(
              "group overflow-hidden rounded-xl border bg-white transition-all duration-300",
              isOpen
                ? "border-brand/60 shadow-md ring-1 ring-brand/30"
                : "border-brand-dark/10 shadow-sm hover:border-brand-dark/25 hover:shadow-md",
            )}
          >
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors"
              onClick={() => setOpen(isOpen ? -1 : index)}
              aria-expanded={isOpen}
            >
              <span className="text-base font-semibold text-brand-dark group-hover:text-black">
                {item.question}
              </span>
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg border bg-background/80 transition-all duration-300",
                  isOpen
                    ? "border-brand bg-brand text-brand-dark rotate-180 shadow-sm"
                    : "border-brand-dark/10 text-brand-dark/60 group-hover:border-brand/40 group-hover:text-brand-dark",
                )}
              >
                <ChevronDown className="size-4 shrink-0" />
              </span>
            </button>
            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-in-out",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <div className="border-t border-brand-dark/6 px-5 pt-3 pb-5">
                  <p className="text-sm leading-relaxed text-brand-dark/70">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
