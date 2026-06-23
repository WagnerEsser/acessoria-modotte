import { Compass, ShieldCheck, Sparkles } from "lucide-react";

import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { buildMetadata } from "@/lib/seo";
import { services } from "@/lib/site-data";

export const metadata = buildMetadata({
  title: "Servicos",
  description: "Servicos essenciais da assessoria imobiliaria.",
  path: "/servicos",
});

const icons = {
  compass: Compass,
  sparkles: Sparkles,
  "shield-check": ShieldCheck,
} as const;

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-10">
        <SectionHeading
          eyebrow="Servicos"
          title="Servicos essenciais para vender com mais clareza"
          description="Um recorte simples do que a assessoria entrega hoje."
        />

        <div className="grid gap-6 md:grid-cols-3">
          {services.map((service) => {
            const Icon = icons[service.icon as keyof typeof icons];

            return (
              <Card key={service.title} className="p-6">
                <div className="grid size-12 place-items-center rounded-2xl border border-brand-gold/16 bg-brand-gold/12 text-brand-gold">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-5 font-display text-2xl font-semibold text-brand-ivory">
                  {service.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-brand-ivory/70">
                  {service.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
