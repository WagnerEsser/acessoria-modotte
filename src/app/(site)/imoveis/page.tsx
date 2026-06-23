import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Filter, Star } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PropertyCard } from "@/components/shared/property-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { buildMetadata } from "@/lib/seo";
import { featuredProperties } from "@/lib/site-data";
import {
  filterProperties,
  getPropertyTypes,
  paginateProperties,
  parsePositiveInteger,
  PROPERTY_PAGE_SIZE,
} from "@/lib/property-catalog";

export const metadata = buildMetadata({
  title: "Imóveis",
  description:
    "Catálogo de imóveis da Luana Modotte com foco em leitura premium, transparência e conversão.",
  path: "/imoveis",
});

export const dynamic = "force-dynamic";

type PropertiesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getFirstValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function buildPropertiesHref(options: {
  type?: string;
  featuredOnly?: boolean;
  page?: number;
}) {
  const params = new URLSearchParams();

  if (options.type) {
    params.set("tipo", options.type);
  }

  if (options.featuredOnly) {
    params.set("destaque", "1");
  }

  if (options.page && options.page > 1) {
    params.set("pagina", String(options.page));
  }

  const query = params.toString();

  return query ? `/imoveis?${query}` : "/imoveis";
}

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  const resolvedSearchParams = await searchParams;
  const activeType = getFirstValue(resolvedSearchParams.tipo);
  const featuredOnly = getFirstValue(resolvedSearchParams.destaque) === "1";
  const currentPage = parsePositiveInteger(resolvedSearchParams.pagina, 1);

  const filteredProperties = filterProperties(featuredProperties, {
    type: activeType,
    featuredOnly,
  });
  const pagination = paginateProperties(filteredProperties, currentPage, PROPERTY_PAGE_SIZE);
  const propertyTypes = getPropertyTypes(featuredProperties);
  const hasActiveFilter = Boolean(activeType || featuredOnly);

  const prevHref =
    pagination.currentPage > 1
      ? buildPropertiesHref({
          type: activeType,
          featuredOnly,
          page: pagination.currentPage - 1,
        })
      : null;

  const nextHref =
    pagination.currentPage < pagination.totalPages
      ? buildPropertiesHref({
          type: activeType,
          featuredOnly,
          page: pagination.currentPage + 1,
        })
      : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-10">
        <SectionHeading
          eyebrow="Catálogo"
          title="Imóveis selecionados para a assessoria apresentar com clareza"
          description="A listagem responde aos filtros e pagina os resultados em blocos de 10 itens."
          action={
            <Link href="/contato" className={buttonVariants({ variant: "outline" })}>
              Solicitar atendimento
              <ArrowRight className="size-4" />
            </Link>
          }
        />

        <Card className="space-y-4 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 text-sm text-brand-ivory/70">
              <Filter className="size-4 text-brand-gold" />
              Filtros
            </div>

            <Link
              href={buildPropertiesHref({
                page: 1,
              })}
              className={buttonVariants({
                variant: hasActiveFilter ? "outline" : "gold",
                size: "sm",
              })}
            >
              Todos
            </Link>

            <Link
              href={buildPropertiesHref({
                featuredOnly: true,
                page: 1,
              })}
              className={buttonVariants({
                variant: featuredOnly ? "gold" : "outline",
                size: "sm",
              })}
            >
              <Star className="size-4" />
              Destaques
            </Link>

            {propertyTypes.map((type) => (
              <Link
                key={type}
                href={buildPropertiesHref({
                  type,
                  page: 1,
                })}
                className={buttonVariants({
                  variant: activeType === type ? "gold" : "outline",
                  size: "sm",
                })}
              >
                {type}
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-brand-beige/10 pt-4 text-sm text-brand-ivory/68">
            <span>
              {pagination.totalItems === 1
                ? "1 imóvel encontrado"
                : `${pagination.totalItems} imóveis encontrados`}
            </span>
            <span>
              Página {pagination.currentPage} de {pagination.totalPages}
            </span>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {pagination.items.map((property) => (
            <PropertyCard key={property.slug} property={property} />
          ))}
        </div>

        {pagination.items.length === 0 ? (
          <Card className="p-8 text-center text-sm leading-6 text-brand-ivory/70">
            Nenhum imóvel encontrado com os filtros atuais.
          </Card>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-brand-beige/10 pt-4">
          <div className="text-sm text-brand-ivory/68">
            Mostrando até {PROPERTY_PAGE_SIZE} itens por página.
          </div>

          <div className="flex items-center gap-3">
            {prevHref ? (
              <Link href={prevHref} className={buttonVariants({ variant: "outline", size: "sm" })}>
                <ChevronLeft className="size-4" />
                Anterior
              </Link>
            ) : (
              <span className={buttonVariants({ variant: "outline", size: "sm" }) + " pointer-events-none opacity-40"}>
                <ChevronLeft className="size-4" />
                Anterior
              </span>
            )}

            {nextHref ? (
              <Link href={nextHref} className={buttonVariants({ variant: "outline", size: "sm" })}>
                Próxima
                <ChevronRight className="size-4" />
              </Link>
            ) : (
              <span className={buttonVariants({ variant: "outline", size: "sm" }) + " pointer-events-none opacity-40"}>
                Próxima
                <ChevronRight className="size-4" />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
