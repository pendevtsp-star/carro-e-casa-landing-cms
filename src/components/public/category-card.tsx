import {
  BadgeCheck,
  Car,
  Home,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { buildWhatsappUrl } from "@/lib/utils";

const icons = {
  BadgeCheck,
  Car,
  Home,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
};

type Category = {
  name: string;
  description: string;
  iconName: string;
  whatsappMessage?: string | null;
};

export function CategoryCard({
  category,
  whatsappNumber,
}: {
  category: Category;
  whatsappNumber: string;
}) {
  const Icon = icons[category.iconName as keyof typeof icons] ?? Sparkles;

  return (
    <Card className="flex h-full flex-col p-5 transition hover:-translate-y-1 hover:border-brand/60">
      <div className="flex size-10 items-center justify-center rounded-md bg-brand text-brand-dark">
        <Icon className="size-4" aria-hidden />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-brand-dark">
        {category.name}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-brand-dark/62">
        {category.description}
      </p>
      <Button
        href={buildWhatsappUrl(whatsappNumber, category.whatsappMessage || undefined)}
        variant="ghost"
        className="mt-4 h-10 justify-start px-0"
        target="_blank"
      >
        Conversar sobre isso
      </Button>
    </Card>
  );
}
