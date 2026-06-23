import { BriefcaseBusiness, FileSearch, HousePlus, NotebookPen } from "lucide-react";

import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { buildMetadata } from "@/lib/seo";
import { services } from "@/lib/site-data";

export const metadata = buildMetadata({
  title: "Servicos",
  description:
    "Servicos da assessoria imobiliaria com foco em curadoria, anuncio premium, documentacao e estrategia comercial.",
  path: "/servicos",
});

const icons = {
  compass: HousePlus,
  sparkles: NotebookPen,
  "shield-check": FileSearch,
  "chart-column": BriefcaseBusiness,
} as const;

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-10">
        <SectionHeading
          eyebrow="Servicos"
          title="O que a assessoria entrega alem da vitrine de imoveis"
          description="Cada servico reforca a proposta da marca e reduz o atrito entre o interesse do cliente e o fechamento do negocio."
        />

        <div className="grid gap-6 md:grid-cols-2">
          {services.map((service) => {
            const Icon = icons[service.icon as keyof typeof icons];

            return (
              <Card key={service.title} className="p-6">
                <div className="grid size-12 place-items-center rounded-2xl border border-brand-gold/16 bg-brand-gold/12 text-brand-gold">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-5 font-display text-3xl font-semibold text-brand-ivory">
                  {service.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-brand-ivory/70">
                  {service.description}
                </p>
                <ul className="mt-5 space-y-2 text-sm text-brand-ivory/72">
                  {service.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-brand-gold" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
