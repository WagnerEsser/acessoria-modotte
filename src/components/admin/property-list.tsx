"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";

import { Pagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrencyBRL, formatDateTimeBRL } from "@/lib/formatters";

export type AdminProperty = {
  id: string;
  title: string;
  transaction_type: string;
  property_type: string;
  is_published: boolean;
  featured: boolean;
  price: number | string | null;
  price_on_request: boolean;
  city: string | null;
  state: string | null;
  updated_at: string;
};

function getPropertyPriceLabel(property: AdminProperty): string {
  return property.price_on_request ? "Sob consulta" : formatCurrencyBRL(property.price);
}

export function PropertyList({ initialProperties }: { initialProperties: AdminProperty[] }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const properties = useMemo(
    () => initialProperties.slice((page - 1) * pageSize, page * pageSize),
    [initialProperties, page, pageSize],
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-4">
        {properties.length ? properties.map((property) => (
          <Card key={property.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">{property.property_type}</p>
              <h2 className="mt-2 font-display text-2xl text-brand-ivory">{property.title}</h2>
              <p className="mt-2 text-sm text-brand-ivory/68">
                {property.city ?? "Cidade"} {property.state ? `/${property.state}` : ""}
              </p>
              <p className="mt-3 text-sm text-brand-ivory/70">
                {getPropertyPriceLabel(property)} - atualizado {formatDateTimeBRL(property.updated_at)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="normal-case tracking-normal">{property.transaction_type}</Badge>
              <Badge variant={property.is_published ? "gold" : "outline"} className="normal-case tracking-normal">
                {property.is_published ? "Publicado" : "Rascunho"}
              </Badge>
              <Badge variant={property.featured ? "gold" : "outline"} className="normal-case tracking-normal">
                {property.featured ? "Destaque" : "Padrão"}
              </Badge>
              <Link href={`/admin/imoveis/${property.id}/editar`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                Editar
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </Card>
        )) : <Card className="p-6 text-sm text-brand-ivory/68">Nenhum imóvel cadastrado ainda.</Card>}
      </div>

      {initialProperties.length ? (
        <Pagination
          currentPage={page}
          totalItems={initialProperties.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(value) => {
            setPageSize(value);
            setPage(1);
          }}
        />
      ) : null}
    </div>
  );
}
