import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { formatCurrencyBRL, formatDateTimeBRL } from "@/lib/formatters";
import { buildMetadata } from "@/lib/seo";
import { createSupabaseRscClient } from "@/lib/supabase/rsc";

export const metadata = buildMetadata({
  title: "Imoveis no painel",
  description: "Gestao dos imoveis cadastrados na assessoria.",
  path: "/admin/imoveis",
  noIndex: true,
});

export const dynamic = "force-dynamic";

type PropertyRecord = {
  id: string;
  slug: string;
  title: string;
  transaction_type: string;
  property_type: string;
  status: string;
  is_published: boolean;
  featured: boolean;
  price: number | string | null;
  price_on_request: boolean;
  city: string | null;
  state: string | null;
  updated_at: string;
};

function getPropertyPriceLabel(property: PropertyRecord): string {
  if (property.price_on_request) {
    return "Sob consulta";
  }

  return formatCurrencyBRL(property.price);
}

export default async function AdminPropertiesPage() {
  const supabase = await createSupabaseRscClient();
  const { data } = await supabase
    .from("properties")
    .select("id, slug, title, transaction_type, property_type, status, is_published, featured, price, price_on_request, city, state, updated_at")
    .order("updated_at", { ascending: false });

  const properties = (data ?? []) as PropertyRecord[];

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Imoveis"
        title="Cadastro, destaque e publicacao dos ativos"
        description="Agora a vitrine do painel sai da tabela properties do banco."
        action={
          <Link href="/admin/imoveis/novo" className={buttonVariants({ variant: "gold" })}>
            Novo imovel
            <Plus className="size-4" />
          </Link>
        }
      />

      <div className="grid gap-4">
        {properties.length ? (
          properties.map((property) => (
            <Card
              key={property.id}
              className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">
                  {property.property_type}
                </p>
                <h2 className="mt-2 font-display text-2xl text-brand-ivory">
                  {property.title}
                </h2>
                <p className="mt-2 text-sm text-brand-ivory/68">
                  {property.city ?? "Cidade"} {property.state ? `/${property.state}` : ""}
                </p>
                <p className="mt-3 text-sm text-brand-ivory/70">
                  {getPropertyPriceLabel(property)} - atualizado {formatDateTimeBRL(property.updated_at)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline" className="normal-case tracking-normal">
                  {property.transaction_type}
                </Badge>
                <Badge variant={property.is_published ? "gold" : "outline"} className="normal-case tracking-normal">
                  {property.is_published ? "Publicado" : "Rascunho"}
                </Badge>
                <Badge variant={property.featured ? "gold" : "outline"} className="normal-case tracking-normal">
                  {property.featured ? "Destaque" : "Padrao"}
                </Badge>
                <Link
                  href={`/admin/imoveis/${property.id}/editar`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Editar
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-6 text-sm text-brand-ivory/68">
            Nenhum imovel cadastrado ainda.
          </Card>
        )}
      </div>
    </div>
  );
}
