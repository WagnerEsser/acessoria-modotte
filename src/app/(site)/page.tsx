import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, Store } from "lucide-react";

import { PropertyCard } from "@/components/shared/property-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { brand } from "@/lib/brand";
import { getPropertyCities, getPropertyTypes } from "@/lib/property-catalog";
import {
  getPublicNeighborhoods,
  getPublicPageBySlug,
  getPublicProperties,
  getPublicSiteSettings,
} from "@/lib/public-content";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const [siteSettings, homePage] = await Promise.all([
    getPublicSiteSettings(),
    getPublicPageBySlug("home"),
  ]);

  return buildMetadata({
    title: homePage?.seoTitle ?? homePage?.title ?? siteSettings.defaultSeoTitle,
    description:
      homePage?.seoDescription ?? homePage?.subtitle ?? siteSettings.defaultSeoDescription,
    path: "/",
    image: homePage?.ogImageUrl,
    imageAlt: homePage?.ogImageUrl ? (homePage.title ?? siteSettings.brandName) : null,
  });
}

export default async function HomePage() {
  const [siteSettings, properties, neighborhoods, homePage] = await Promise.all([
    getPublicSiteSettings(),
    getPublicProperties(),
    getPublicNeighborhoods(),
    getPublicPageBySlug("home"),
  ]);

  const featuredProperties = properties.filter((property) => property.featured).slice(0, 2);
  const heroTitle =
    homePage?.title ?? "Assessoria imobiliária com atendimento próximo e condução segura.";
  const heroDescription =
    homePage?.subtitle ??
    homePage?.body ??
    siteSettings.impactPhrase ??
    siteSettings.defaultSeoDescription ??
    brand.slogan;
  const homeBlocks = homePage?.blocks ?? [];
  const propertyTypes = getPropertyTypes(properties);
  const propertyCities = getPropertyCities(properties);
  const searchableNeighborhoods = neighborhoods.filter((neighborhood) => neighborhood.propertyCount > 0);
  const cityOptions = [
    {
      value: "",
      label: "Todas as cidades",
      description: "Sem filtro de cidade",
    },
    ...propertyCities.map((city) => ({
      value: city,
      label: city,
    })),
  ];
  const neighborhoodOptions = [
    {
      value: "",
      label: "Todos os bairros",
      description: "Sem filtro de região",
    },
    ...searchableNeighborhoods.map((neighborhood) => ({
      value: neighborhood.slug,
      label: neighborhood.name,
      description: `${neighborhood.city} · ${
        neighborhood.propertyCount === 1
          ? "1 imóvel"
          : `${neighborhood.propertyCount} imóveis`
      }`,
    })),
  ];
  const propertyTypeOptions = [
    {
      value: "",
      label: "Todos os tipos",
      description: "Sem filtro de categoria",
    },
    ...propertyTypes.map((type) => ({
      value: type,
      label: type,
    })),
  ];

  const quickStats = [
    {
      label: "Imóveis publicados",
      value: String(properties.length),
      description: "Oportunidades disponíveis para compra ou locação.",
      icon: Building2,
    },
    {
      label: "Áreas mapeadas",
      value: String(neighborhoods.length),
      description: "Regiões atendidas e conectadas ao catálogo.",
      icon: Store,
    },
  ] as const;

  return (
    <div className="space-y-20 pb-20">
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
          <div className="space-y-6">
            <Card className="border-brand-gold/18 bg-brand-ink/88 p-5 shadow-xl shadow-brand-ink/25">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <Badge variant="gold" className="w-fit">
                    Busca principal
                  </Badge>
                  <h2 className="font-display text-2xl font-semibold text-brand-ivory">
                    Encontre imóveis por cidade, bairro ou tipo
                  </h2>
                  <p className="max-w-2xl text-sm leading-6 text-brand-ivory/70">
                    Selecione os filtros e siga direto para a lista já organizada.
                  </p>
                </div>
              </div>

              <form action="/imoveis" method="get" className="mt-5 space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Select
                    name="cidade"
                    label="Cidade"
                    placeholder="Todas as cidades"
                    defaultValue=""
                    options={cityOptions}
                  />

                  <Select
                    name="bairro"
                    label="Bairro"
                    placeholder="Todos os bairros"
                    defaultValue=""
                    options={neighborhoodOptions}
                  />

                  <Select
                    name="tipo"
                    label="Tipo de imóvel"
                    placeholder="Todos os tipos"
                    defaultValue=""
                    options={propertyTypeOptions}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button type="submit" size="lg" className="w-full sm:w-auto">
                    Buscar imóveis
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </form>
            </Card>

            <div className="space-y-5">
              <h1 className="max-w-3xl font-display text-4xl font-semibold leading-tight text-brand-ivory sm:text-5xl lg:text-6xl">
                {heroTitle}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-brand-ivory/72 sm:text-lg">
                {heroDescription}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/imoveis" className={buttonVariants({ size: "lg" })}>
                Ver imóveis
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/contato"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                Falar com a assessoria
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {quickStats.map((item) => {
                const Icon = item.icon;

                return (
                  <Card key={item.label} className="p-4">
                    <div className="grid size-10 place-items-center rounded-2xl border border-brand-gold/16 bg-brand-gold/12 text-brand-gold">
                      <Icon className="size-4" />
                    </div>
                    <div className="mt-4 font-numeric text-3xl font-semibold text-brand-ivory">
                      {item.value}
                    </div>
                    <h2 className="mt-2 font-display text-xl font-semibold text-brand-ivory">
                      {item.label}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-brand-ivory/68">
                      {item.description}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>

          <Card className="overflow-hidden p-5 lg:self-start">
            <div className="rounded-[1.5rem] border border-brand-beige/12 bg-[linear-gradient(180deg,rgba(19,37,59,0.92),rgba(11,27,44,0.98))] p-4">
              <Image
                src="/brand/luana-modotte-logo-lockup.png"
                alt={siteSettings.brandName}
                width={1600}
                height={900}
                priority
                className="h-auto w-full rounded-[1.25rem] border border-brand-beige/10 object-cover"
              />
            </div>

            <Link
              href="/sobre"
              aria-label="Conheça mais sobre Luana Modotte"
              className="group mt-5 block overflow-hidden rounded-[1.75rem] border border-brand-beige/12 bg-brand-ivory/4 transition hover:-translate-y-0.5 hover:border-brand-gold/30 hover:bg-brand-ivory/6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-ink"
            >
              <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[5/4]">
                <div className="absolute inset-0">
                  <Image
                    src="/images/luana-modotte-portrait-pro.png"
                    alt="Retrato profissional de Luana Modotte"
                    fill
                    sizes="(min-width: 1024px) 36rem, 100vw"
                    className="object-cover object-[center_32%] transition duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-brand-ink via-brand-ink/18 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <Badge variant="soft" className="w-fit">
                    À frente da assessoria
                  </Badge>
                  <h2 className="mt-4 font-display text-3xl text-brand-ivory sm:text-4xl">
                    Luana Modotte
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-brand-ivory/80 sm:text-base">
                    Atendimento direto, leitura cuidadosa do perfil do cliente e condução objetiva
                    em cada etapa.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-brand-beige/10 px-4 py-4 text-sm text-brand-ivory/72 sm:px-5">
                <span>Conheça a trajetória e o posicionamento da assessoria.</span>
                <span className="inline-flex items-center gap-2 font-medium text-brand-gold">
                  Ver sobre
                  <ArrowRight className="size-4" />
                </span>
              </div>
            </Link>
          </Card>
        </div>
      </section>

      {homeBlocks.length ? (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Como podemos ajudar"
            title="Atendimento imobiliário pensado para cada etapa"
            description="Conheça os serviços, diferenciais e cuidados que orientam a assessoria em cada negociação."
          />

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {homeBlocks.map((block) => (
              <Card key={block.id} className="p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">
                  {block.blockKey}
                </p>
                <h3 className="mt-3 font-display text-2xl font-semibold text-brand-ivory">
                  {block.title ?? "Bloco sem título"}
                </h3>
                {block.content ? (
                  <p className="mt-3 text-sm leading-6 text-brand-ivory/70">{block.content}</p>
                ) : null}
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {featuredProperties.length ? (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Imóveis em destaque"
            title="Imóveis selecionados para uma busca mais objetiva"
            description="Compare as oportunidades em destaque e fale com a assessoria para receber orientação personalizada."
          />

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.slug} property={property} />
            ))}
          </div>
        </section>
      ) : null}

    </div>
  );
}
