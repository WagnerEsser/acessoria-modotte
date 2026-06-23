import Link from "next/link";
import { ArrowRight, Filter } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PropertyCard } from "@/components/shared/property-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { buildMetadata } from "@/lib/seo";
import { featuredProperties } from "@/lib/site-data";

export const metadata = buildMetadata({
  title: "Imoveis",
  description:
    "Catalogo de imoveis da Luana Modotte com foco em leitura premium, transparencia e conversao.",
  path: "/imoveis",
});

const filters = ["Todos", "Casa", "Apartamento", "Terreno", "Townhouse"];

export default function PropertiesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-10">
        <SectionHeading
          eyebrow="Catalogo"
          title="Imoveis selecionados para a assessoria apresentar com clareza"
          description="A listagem nasce preparada para filtros, destaque, ordenacao e detalhes do imovel."
          action={
            <Link href="/contato" className={buttonVariants({ variant: "outline" })}>
              Solicitar atendimento
              <ArrowRight className="size-4" />
            </Link>
          }
        />

        <Card className="flex flex-wrap items-center gap-3 p-4">
          <Filter className="size-4 text-brand-gold" />
          {filters.map((filter, index) => (
            <Badge key={filter} variant={index === 0 ? "gold" : "outline"} className="normal-case tracking-normal">
              {filter}
            </Badge>
          ))}
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {featuredProperties.map((property) => (
            <PropertyCard key={property.slug} property={property} />
          ))}
        </div>
      </div>
    </div>
  );
}
