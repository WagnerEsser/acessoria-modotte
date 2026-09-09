"use client";

import Link from "next/link";
import { ExternalLink, ImageIcon, MapPin, Pencil } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Pagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { formatCurrencyBRL, formatDateTimeBRL } from "@/lib/formatters";

export type AdminProperty = {
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
  cover_image_url: string | null;
  cover_image_alt: string | null;
};

function getPropertyPriceLabel(property: AdminProperty): string {
  return property.price_on_request ? "Sob consulta" : formatCurrencyBRL(property.price);
}

const transactionTypeLabels: Record<string, string> = {
  sale: "Venda",
  rent: "Locação",
  both: "Venda e locação",
};

const propertyTypeLabels: Record<string, string> = {
  apartment: "Apartamento",
  house: "Casa",
  commercial: "Comercial",
  land: "Terreno",
};

const propertyTypeKeys: Record<string, string> = {
  apartment: "apartment",
  apartamento: "apartment",
  house: "house",
  casa: "house",
  commercial: "commercial",
  comercial: "commercial",
  land: "land",
  terreno: "land",
};

const transactionFilterOptions = [
  { value: "all", label: "Todas as transações" },
  { value: "sale", label: "Venda" },
  { value: "rent", label: "Locação" },
  { value: "both", label: "Venda e locação" },
];

const propertyTypeFilterOptions = [
  { value: "all", label: "Todos os tipos" },
  { value: "apartment", label: "Apartamento" },
  { value: "house", label: "Casa" },
  { value: "commercial", label: "Comercial" },
  { value: "land", label: "Terreno" },
];

const statusFilterOptions = [
  { value: "all", label: "Todas as situações" },
  { value: "draft", label: "Rascunho" },
  { value: "published", label: "Publicado" },
  { value: "reserved", label: "Reservado" },
  { value: "sold", label: "Vendido" },
  { value: "hidden", label: "Oculto" },
];

const featuredFilterOptions = [
  { value: "all", label: "Todos os destaques" },
  { value: "featured", label: "Somente destaques" },
  { value: "standard", label: "Sem destaque" },
];

function getLabel(value: string, labels: Record<string, string>): string {
  return labels[value.toLowerCase()] ?? value;
}

function getPropertyTypeKey(value: string): string {
  return propertyTypeKeys[value.toLocaleLowerCase("pt-BR")] ?? value.toLocaleLowerCase("pt-BR");
}

export function PropertyList({ initialProperties }: { initialProperties: AdminProperty[] }) {
  const [search, setSearch] = useState("");
  const [transactionType, setTransactionType] = useState("all");
  const [propertyType, setPropertyType] = useState("all");
  const [status, setStatus] = useState("all");
  const [featured, setFeatured] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const filteredProperties = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");

    return initialProperties.filter((property) => {
      const matchesSearch = !normalizedSearch || [
        property.title,
        property.city ?? "",
        property.state ?? "",
        getLabel(property.property_type, propertyTypeLabels),
      ].some((value) => value.toLocaleLowerCase("pt-BR").includes(normalizedSearch));
      const matchesTransaction = transactionType === "all" || property.transaction_type === transactionType;
      const matchesPropertyType = propertyType === "all" || getPropertyTypeKey(property.property_type) === propertyType;
      const matchesStatus = status === "all" || property.status === status;
      const matchesFeatured = featured === "all"
        || (featured === "featured" && property.featured)
        || (featured === "standard" && !property.featured);

      return matchesSearch && matchesTransaction && matchesPropertyType && matchesStatus && matchesFeatured;
    });
  }, [featured, initialProperties, propertyType, search, status, transactionType]);
  const totalPages = Math.max(1, Math.ceil(filteredProperties.length / pageSize));
  const properties = useMemo(
    () => filteredProperties.slice((page - 1) * pageSize, page * pageSize),
    [filteredProperties, page, pageSize],
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  function resetPage() {
    setPage(1);
  }

  return (
    <div className="space-y-5">
      <div className="space-y-4 rounded-2xl border border-brand-beige/12 bg-brand-ivory/4 p-4">
        <div className="grid gap-4 xl:grid-cols-3">
        <label className="space-y-2 xl:col-span-2">
          <span className="ml-1 block text-[13px] text-brand-ivory/78">Buscar imóvel</span>
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              resetPage();
            }}
            placeholder="Título, cidade ou estado"
            className="h-11 w-full rounded-2xl border border-brand-beige/18 bg-brand-navy px-3 text-sm text-brand-ivory outline-none transition placeholder:text-brand-ivory/38 focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/20"
          />
        </label>
        <Select
          name="property_type_filter"
          label="Tipo de imóvel"
          labelClassName="text-[13px] normal-case tracking-normal text-brand-ivory/78"
          menuClassName="min-w-[15rem]"
          options={propertyTypeFilterOptions}
          value={propertyType}
          onValueChange={(value) => {
            setPropertyType(value);
            resetPage();
          }}
        />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
        <Select
          name="property_transaction_filter"
          label="Transação"
          labelClassName="text-[13px] normal-case tracking-normal text-brand-ivory/78"
          menuClassName="min-w-[15rem]"
          options={transactionFilterOptions}
          value={transactionType}
          onValueChange={(value) => {
            setTransactionType(value);
            resetPage();
          }}
        />
        <Select
          name="property_featured_filter"
          label="Destaque"
          labelClassName="text-[13px] normal-case tracking-normal text-brand-ivory/78"
          menuClassName="min-w-[15rem]"
          options={featuredFilterOptions}
          value={featured}
          onValueChange={(value) => {
            setFeatured(value);
            resetPage();
          }}
        />
        <Select
          name="property_status_filter"
          label="Situação"
          labelClassName="text-[13px] normal-case tracking-normal text-brand-ivory/78"
          menuClassName="min-w-[15rem]"
          options={statusFilterOptions}
          value={status}
          onValueChange={(value) => {
            setStatus(value);
            resetPage();
          }}
        />
        </div>
      </div>

      <div className="grid gap-4">
        {properties.length ? properties.map((property) => (
          <Card key={property.id} className="relative overflow-hidden p-4 pb-16 sm:p-5 sm:pb-5">
            <div className="grid gap-4 sm:grid-cols-[9rem_1fr] lg:grid-cols-[11rem_1fr]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-brand-beige/12 bg-brand-navy/70">
                {property.cover_image_url ? (
                  <img
                    src={property.cover_image_url}
                    alt={property.cover_image_alt ?? property.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-brand-beige/50">
                    <ImageIcon className="size-9" aria-hidden="true" />
                    <span className="sr-only">Imóvel sem imagem de capa</span>
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">
                    {getLabel(property.property_type, propertyTypeLabels)}
                  </p>
                  <div className="flex shrink-0 flex-wrap justify-end gap-2">
                    <Badge variant="outline" className="normal-case tracking-normal">
                      {getLabel(property.transaction_type, transactionTypeLabels)}
                    </Badge>
                    <Badge variant={property.is_published ? "gold" : "outline"} className="normal-case tracking-normal">
                      {property.is_published ? "Publicado" : "Rascunho"}
                    </Badge>
                    <Badge variant={property.featured ? "gold" : "outline"} className="normal-case tracking-normal">
                      {property.featured ? "Destaque" : "Padrão"}
                    </Badge>
                  </div>
                </div>
                <div className="pr-2 sm:pr-24">
                  <h2 className="mt-2 font-display text-2xl text-brand-ivory">{property.title}</h2>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-brand-ivory/68">
                    <MapPin className="size-4 shrink-0 text-brand-beige/70" aria-hidden="true" />
                    {property.city ?? "Cidade"} {property.state ? `/${property.state}` : ""}
                  </p>
                  <p className="mt-3 text-sm text-brand-ivory/70">
                    {getPropertyPriceLabel(property)} - atualizado {formatDateTimeBRL(property.updated_at)}
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute bottom-5 right-5 flex items-center gap-2">
              {property.is_published ? (
                <Link
                  href={`/imoveis/${property.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className={`${buttonVariants({ variant: "outline", size: "sm" })} size-10 min-w-10 p-0`}
                  aria-label={`Ver publicação de ${property.title}`}
                  title="Ver publicação"
                >
                  <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
                </Link>
              ) : null}
              <Link
                href={`/admin/imoveis/${property.id}/editar`}
                className={`${buttonVariants({ variant: "outline", size: "sm" })} size-10 min-w-10 p-0`}
                aria-label={`Editar imóvel ${property.title}`}
                title="Editar imóvel"
              >
                <Pencil className="size-4 shrink-0" aria-hidden="true" />
              </Link>
            </div>
          </Card>
        )) : <Card className="p-6 text-sm text-brand-ivory/68">Nenhum imóvel encontrado com esses filtros.</Card>}
      </div>

      {filteredProperties.length ? (
        <Pagination
          currentPage={page}
          totalItems={filteredProperties.length}
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
