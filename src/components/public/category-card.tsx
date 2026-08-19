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
    <Card className="group relative flex h-full flex-col overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand/70 hover:shadow-[0_20px_45px_rgba(5,8,10,0.08)]">
      <div className="absolute top-0 left-0 right-0 h-1 bg-brand opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="flex size-11 items-center justify-center rounded-md bg-brand text-brand-dark shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-dark group-hover:text-brand group-hover:shadow-md">
        <Icon className="size-5" aria-hidden />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-brand-dark transition-colors duration-200 group-hover:text-black">
        {category.name}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-brand-dark/65">
        {category.description}
      </p>
      <Button
        href={buildWhatsappUrl(whatsappNumber, category.whatsappMessage || undefined)}
        variant="ghost"
        className="mt-4 h-10 justify-start px-0 text-brand-dark/80 group-hover:text-brand-dark group-hover:translate-x-1"
        target="_blank"
      >
        Conversar sobre isso
      </Button>
    </Card>
  );
}
