import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { featuredProperties } from "@/lib/site-data";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Imoveis no painel",
  description: "Gestao dos imoveis cadastrados na assessoria.",
  path: "/admin/imoveis",
  noIndex: true,
});

export default function AdminPropertiesPage() {
  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Imoveis"
        title="Cadastro, destaque e publicacao dos ativos"
        description="A estrutura esta pronta para CRUD, filtros e imagens quando o banco entrar."
        action={
          <Link href="/admin/imoveis/novo" className={buttonVariants({ variant: "gold" })}>
            Novo imovel
            <Plus className="size-4" />
          </Link>
        }
      />

      <div className="grid gap-4">
        {featuredProperties.map((property) => (
          <Card key={property.slug} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">
                {property.type}
              </p>
              <h2 className="mt-2 font-display text-2xl text-brand-ivory">
                {property.title}
              </h2>
              <p className="mt-2 text-sm text-brand-ivory/68">
                {property.location} - {property.city}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline">{property.price}</Badge>
              <Badge variant="gold">{property.featured ? "Destaque" : "Padrao"}</Badge>
              <Link href="/admin/imoveis" className={buttonVariants({ variant: "outline", size: "sm" })}>
                Editar
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
