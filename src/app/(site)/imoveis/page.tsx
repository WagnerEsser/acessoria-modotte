import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Filter, Star } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PropertyCard } from "@/components/shared/property-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { getPublicPageBySlug, getPublicProperties, splitParagraphs } from "@/lib/public-content";
import { buildMetadata } from "@/lib/seo";
import {
  filterProperties,
  getPropertyTypes,
  paginateProperties,
  parsePositiveInteger,
  PROPERTY_PAGE_SIZE,
} from "@/lib/property-catalog";

export const revalidate = 300;

type PropertiesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getFirstValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export async function generateMetadata({ searchParams }: PropertiesPageProps) {
  const resolvedSearchParams = await searchParams;
  const currentPage = parsePositiveInteger(resolvedSearchParams.pagina, 1);
  const hasFilters = Boolean(
    getFirstValue(resolvedSearchParams.tipo) ||
      getFirstValue(resolvedSearchParams.cidade) ||
      getFirstValue(resolvedSearchParams.bairro) ||
      getFirstValue(resolvedSearchParams.destaque)
  );
  const path = !hasFilters && currentPage > 1 ? `/imoveis?pagina=${currentPage}` : "/imoveis";

  const page = await getPublicPageBySlug("imoveis");
  return buildMetadata({
    title: currentPage > 1 ? `${page?.title ?? "Imóveis"} - página ${currentPage}` : page?.seoTitle ?? page?.title ?? "Imóveis",
    description: page?.seoDescription ?? page?.subtitle ?? "Encontre imóveis com atendimento próximo e informações claras.",
    path,
    noIndex: hasFilters,
  });
}

function buildPropertiesHref(options: {
  type?: string;
  city?: string;
  neighborhoodSlug?: string;
  featuredOnly?: boolean;
  page?: number;
}) {
  const params = new URLSearchParams();

  if (options.type) {
    params.set("tipo", options.type);
  }

  if (options.city) {
    params.set("cidade", options.city);
  }

  if (options.neighborhoodSlug) {
    params.set("bairro", options.neighborhoodSlug);
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
  const [properties, page] = await Promise.all([getPublicProperties(), getPublicPageBySlug("imoveis")]);
  const paragraphs = splitParagraphs(page?.body);
  const resolvedSearchParams = await searchParams;
  const activeType = getFirstValue(resolvedSearchParams.tipo);
  const activeCity = getFirstValue(resolvedSearchParams.cidade);
  const activeNeighborhoodSlug = getFirstValue(resolvedSearchParams.bairro);
  const featuredOnly = getFirstValue(resolvedSearchParams.destaque) === "1";
  const currentPage = parsePositiveInteger(resolvedSearchParams.pagina, 1);

  const filteredProperties = filterProperties(properties, {
    type: activeType,
    city: activeCity,
    neighborhoodSlug: activeNeighborhoodSlug,
    featuredOnly,
  });
  const pagination = paginateProperties(filteredProperties, currentPage, PROPERTY_PAGE_SIZE);
  const propertyTypes = getPropertyTypes(properties);
  const hasActiveFilter = Boolean(activeType || activeCity || activeNeighborhoodSlug || featuredOnly);

  const prevHref =
    pagination.currentPage > 1
      ? buildPropertiesHref({
          type: activeType,
          city: activeCity,
          neighborhoodSlug: activeNeighborhoodSlug,
          featuredOnly,
          page: pagination.currentPage - 1,
        })
      : null;

  const nextHref =
    pagination.currentPage < pagination.totalPages
      ? buildPropertiesHref({
          type: activeType,
          city: activeCity,
          neighborhoodSlug: activeNeighborhoodSlug,
          featuredOnly,
          page: pagination.currentPage + 1,
        })
      : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-10">
        <SectionHeading
          as="h1"
          eyebrow="Catálogo"
          title={page?.title ?? "Imóveis selecionados para a assessoria apresentar com clareza"}
          description={page?.subtitle ?? paragraphs[0] ?? "Use os filtros para encontrar oportunidades alinhadas à região e ao tipo de imóvel que você procura."}
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
                city: activeCity,
                neighborhoodSlug: activeNeighborhoodSlug,
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
                  city: activeCity,
                  neighborhoodSlug: activeNeighborhoodSlug,
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
            {pagination.totalItems
              ? "Nenhum imóvel encontrado com os filtros atuais."
              : "Nenhum imóvel publicado ainda."}
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
