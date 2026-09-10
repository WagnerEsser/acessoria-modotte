import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Bath, BedDouble, CalendarDays, CarFront, MapPin, MessageCircle, Receipt, Sofa, Square } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { JsonLd } from "@/components/seo/json-ld";
import { SectionHeading } from "@/components/shared/section-heading";
import { PublicPageLink } from "@/components/shared/public-page-link";
import { RichText } from "@/components/shared/rich-text";
import { PropertyMap } from "@/components/site/property-map";
import { PropertyImageGallery } from "@/components/site/property-image-gallery";
import { formatBrazilianPhoneDisplayNumber, getWhatsAppHref } from "@/lib/contact";
import { richTextToPlainText } from "@/lib/rich-text";
import { buildMetadata } from "@/lib/seo";
import {
  buildBreadcrumbStructuredData,
  buildPropertyStructuredData,
} from "@/lib/structured-data";
import { getPublicPropertyBySlug, getPublicSiteSettings } from "@/lib/public-content";

export const revalidate = 300;

type PropertyPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function buildLocationLabel(property: Awaited<ReturnType<typeof getPublicPropertyBySlug>>) {
  if (!property) {
    return "";
  }

  return [property.city, property.state].filter(Boolean).join(" / ");
}

function getPropertyContactHref(
  property: Awaited<ReturnType<typeof getPublicPropertyBySlug>>,
  whatsappNumber: string | null
) {
  if (!property) {
    return "/contato";
  }

  const targetNumber = property.contactWhatsapp ?? whatsappNumber;

  if (!targetNumber) {
    return "/contato";
  }

  return getWhatsAppHref(`Olá, tenho interesse no imóvel ${property.title}.`, targetNumber);
}

function getMapQuery(property: NonNullable<Awaited<ReturnType<typeof getPublicPropertyBySlug>>>) {
  if (property.showFullAddress && property.latitude !== null && property.longitude !== null) {
    return `${property.latitude},${property.longitude}`;
  }

  if (property.showFullAddress) {
    return [property.address, property.neighborhoodName, property.city, property.state].filter(Boolean).join(", ");
  }

  return [property.neighborhoodName, property.city, property.state].filter(Boolean).join(", ");
}

export async function generateMetadata({
  params,
}: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPublicPropertyBySlug(slug);

  if (!property) {
    return buildMetadata({
      title: "Imóvel não encontrado",
      description: "O imóvel solicitado não existe ou ainda não foi publicado.",
      path: `/imoveis/${slug}`,
      noIndex: true,
    });
  }

  const descriptionText = richTextToPlainText(property.description);

  return buildMetadata({
    title: property.seoTitle ?? property.title,
    description:
      property.seoDescription ?? property.summary ?? (descriptionText || property.price),
    path: `/imoveis/${property.slug}`,
    image: property.coverImageUrl,
    imageAlt: property.coverImageAlt ?? property.title,
  });
}

export default async function PropertyDetailPage({ params }: PropertyPageProps) {
  const { slug } = await params;
  const [property, siteSettings] = await Promise.all([
    getPublicPropertyBySlug(slug),
    getPublicSiteSettings(),
  ]);

  if (!property) {
    notFound();
  }

  const locationLabel = buildLocationLabel(property);
  const contactHref = getPropertyContactHref(property, siteSettings.whatsappNumber);
  const mapQuery = getMapQuery(property);
  const mapNote = property.showFullAddress
    ? "Localização indicada conforme os dados informados."
    : "Mapa com localização aproximada pela região do imóvel.";
  const displayLocation = property.showFullAddress && property.address
    ? [property.address, property.city, property.state].filter(Boolean).join(" - ")
    : [property.neighborhoodName, property.city, property.state].filter(Boolean).join(" - ");
  const openInNewTab = contactHref.startsWith("http");
  const statItems = [
    {
      key: "size",
      label: "Área",
      value: property.size,
      icon: Square,
    },
    {
      key: "bedrooms",
      label: "Dormitórios",
      value: property.bedrooms && property.bedrooms > 0 ? `${property.bedrooms}` : null,
      icon: BedDouble,
    },
    {
      key: "bathrooms",
      label: "Banheiros",
      value: property.bathrooms && property.bathrooms > 0 ? `${property.bathrooms}` : null,
      icon: Bath,
    },
    {
      key: "garages",
      label: "Vagas",
      value: property.garages && property.garages > 0 ? `${property.garages}` : null,
      icon: CarFront,
    },
    {
      key: "condominium",
      label: "Condomínio",
      value: property.condominiumFee,
      icon: Receipt,
    },
    {
      key: "iptu",
      label: "IPTU",
      value: property.iptuValue,
      icon: Receipt,
    },
    {
      key: "built-year",
      label: "Construção",
      value: property.builtYear ? `${property.builtYear}` : null,
      icon: CalendarDays,
    },
    {
      key: "furnished",
      label: "Mobiliado",
      value: property.furnished ? "Sim" : null,
      icon: Sofa,
    },
  ].filter((item) => Boolean(item.value));

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <JsonLd
        data={[
          buildBreadcrumbStructuredData([
            { name: "Início", path: "/" },
            { name: "Imóveis", path: "/imoveis" },
            { name: property.title, path: `/imoveis/${property.slug}` },
          ]),
          buildPropertyStructuredData(property),
        ]}
      />
      <div className="space-y-10">
        <SectionHeading
          as="h1"
          eyebrow="Detalhe do imóvel"
          title={property.title}
          description={property.summary ?? undefined}
          action={
            <PublicPageLink href="/contato" className={buttonVariants({ variant: "gold" })}>
              Falar com a assessoria
              <ArrowRight className="size-4" />
            </PublicPageLink>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="self-start overflow-hidden p-0">
            <div className="relative min-h-[24rem] overflow-hidden bg-brand-ink">
              {property.coverImageUrl ? (
                <img
                  src={property.coverImageUrl}
                  alt={property.coverImageAlt ?? property.title}
                  width={property.coverImageWidth ?? 1600}
                  height={property.coverImageHeight ?? 900}
                  loading="eager"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${property.accent}`} />
              )}
            </div>

            <div className="space-y-4 border-t border-brand-beige/10 p-5">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="soft">{property.type}</Badge>
                {property.featured ? <Badge variant="gold">Destaque</Badge> : null}
                <Badge variant="gold">{property.price}</Badge>
              </div>

              {locationLabel ? (
                property.neighborhoodSlug ? (
                  <Link
                    href={`/areas/${property.neighborhoodSlug}`}
                    className="flex items-center gap-2 text-sm uppercase tracking-[0.28em] text-brand-ivory/72 transition hover:text-brand-gold"
                  >
                    <MapPin className="size-4" />
                    {locationLabel}
                  </Link>
                ) : (
                  <div className="flex items-center gap-2 text-sm uppercase tracking-[0.28em] text-brand-ivory/72">
                    <MapPin className="size-4" />
                    {locationLabel}
                  </div>
                )
              ) : null}
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">
                Dados principais
              </p>

              {statItems.length ? (
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {statItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.key}
                        className="rounded-2xl border border-brand-beige/12 bg-brand-ivory/4 p-4"
                      >
                        <Icon className="size-4 text-brand-gold" />
                        <p className="mt-3 text-sm text-brand-ivory/68">{item.label}</p>
                        <p className="font-numeric text-2xl text-brand-ivory">{item.value}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-5 text-sm leading-6 text-brand-ivory/68">
                  Os dados principais deste imóvel ainda não foram preenchidos.
                </p>
              )}
            </Card>

            <Card className="p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">
                Destaques
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {property.highlights.length ? (
                  property.highlights.map((highlight) => (
                    <Badge key={highlight} variant="outline" className="normal-case tracking-normal">
                      {highlight}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-brand-ivory/64">
                    Os destaques serão adicionados quando o cadastro estiver completo.
                  </span>
                )}
              </div>
            </Card>

            {displayLocation ? (
              <Card className="space-y-3 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">Localização informada</p>
                <p className="flex items-start gap-2 text-sm leading-6 text-brand-ivory/72">
                  <MapPin className="mt-1 size-4 shrink-0 text-brand-gold" />
                  {displayLocation}
                </p>
              </Card>
            ) : null}

            <Card className="space-y-4 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">
                Contato rápido
              </p>
              <div className="space-y-3 text-sm leading-6 text-brand-ivory/72">
                {property.contactWhatsapp ? (
                  <p className="font-numeric">
                    WhatsApp do imóvel: {formatBrazilianPhoneDisplayNumber(property.contactWhatsapp)}
                  </p>
                ) : null}
                {property.contactPhone ? (
                  <p className="font-numeric">
                    Telefone do imóvel: {formatBrazilianPhoneDisplayNumber(property.contactPhone)}
                  </p>
                ) : null}
                {!property.contactPhone && !property.contactWhatsapp ? (
                  <p>O contato deste imóvel será preenchido quando o cadastro estiver concluído.</p>
                ) : null}
              </div>
              <Link
                href={contactHref}
                target={openInNewTab ? "_blank" : undefined}
                rel={openInNewTab ? "noreferrer" : undefined}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <MessageCircle className="size-4" />
                Pedir informações
              </Link>
            </Card>
          </div>
        </div>

        {property.description ? (
          <Card className="space-y-4 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">
              Descrição
            </p>
            <RichText value={property.description} className="text-sm leading-7 text-brand-ivory/72" />
          </Card>
        ) : null}

        {property.features.length ? (
          <Card className="p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">
              Características
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {property.features.map((feature) => (
                <div
                  key={`${feature.label}-${feature.sortOrder}`}
                  className="rounded-2xl border border-brand-beige/12 bg-brand-ivory/4 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.28em] text-brand-beige/55">
                    {feature.label}
                  </p>
                  {feature.value ? (
                    <p className="mt-2 font-numeric text-xl text-brand-ivory">{feature.value}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </Card>
        ) : null}

        {property.images.length ? (
          <Card className="p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">
              Galeria
            </p>
            <div className="mt-4">
              <PropertyImageGallery images={property.images} title={property.title} />
            </div>
          </Card>
        ) : null}

        {property.videos.length ? (
          <Card className="p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">
              Visita em vídeo
            </p>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {property.videos.map((video) => (
                <div
                  key={video.url}
                  className="overflow-hidden rounded-3xl border border-brand-beige/12 bg-brand-ink"
                >
                  <video
                    controls
                    preload="metadata"
                    className="aspect-video w-full"
                    aria-label={video.fileName ?? `Vídeo de ${property.title}`}
                  >
                    <source src={video.url} type={video.mimeType} />
                    Seu navegador não consegue reproduzir este vídeo.
                  </video>
                </div>
              ))}
            </div>
          </Card>
        ) : null}

        {property.showMap ? <PropertyMap query={mapQuery} note={mapNote} /> : null}
      </div>
    </div>
  );
}
