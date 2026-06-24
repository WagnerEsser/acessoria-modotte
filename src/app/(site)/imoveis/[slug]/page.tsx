import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Bath, BedDouble, CarFront, MapPin, MessageCircle, Square } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { formatBrazilianPhoneDisplayNumber, getWhatsAppHref } from "@/lib/contact";
import { buildMetadata } from "@/lib/seo";
import { getPublicPropertyBySlug, getPublicSiteSettings, splitParagraphs } from "@/lib/public-content";

export const dynamic = "force-dynamic";

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

  return buildMetadata({
    title: property.title,
    description: property.summary ?? property.description ?? property.price,
    path: `/imoveis/${property.slug}`,
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
  const paragraphs = splitParagraphs(property.description);
  const contactHref = getPropertyContactHref(property, siteSettings.whatsappNumber);
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
  ].filter((item) => Boolean(item.value));

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-10">
        <SectionHeading
          eyebrow="Detalhe do imóvel"
          title={property.title}
          description={property.summary ?? undefined}
          action={
            <Link href="/contato" className={buttonVariants({ variant: "gold" })}>
              Falar com a assessoria
              <ArrowRight className="size-4" />
            </Link>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="overflow-hidden p-0">
            <div className="relative min-h-[24rem] overflow-hidden bg-brand-ink">
              {property.coverImageUrl ? (
                <img
                  src={property.coverImageUrl}
                  alt={property.coverImageAlt ?? property.title}
                  loading="eager"
                  className="absolute inset-0 h-full w-full object-cover opacity-45"
                />
              ) : null}
              <div className={`absolute inset-0 bg-gradient-to-br ${property.accent}`} />

              <div className="relative flex h-full flex-col justify-between gap-6 p-8">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="soft">{property.type}</Badge>
                  {property.featured ? <Badge variant="gold">Destaque</Badge> : null}
                  <Badge variant="gold">{property.price}</Badge>
                </div>

                <div className="space-y-3">
                  {locationLabel ? (
                    <div className="flex items-center gap-2 text-sm uppercase tracking-[0.28em] text-brand-ivory/72">
                      <MapPin className="size-4" />
                      {locationLabel}
                    </div>
                  ) : null}
                  <h2 className="max-w-2xl font-display text-4xl font-semibold leading-tight text-brand-ivory sm:text-5xl">
                    {property.title}
                  </h2>
                </div>
              </div>
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

        {paragraphs.length ? (
          <Card className="space-y-4 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">
              Descrição
            </p>
            <div className="space-y-4 text-sm leading-7 text-brand-ivory/72">
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
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
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {property.images.map((image) => (
                <div
                  key={image.url}
                  className="overflow-hidden rounded-3xl border border-brand-beige/12 bg-brand-ivory/4"
                >
                  <img
                    src={image.url}
                    alt={image.altText ?? property.title}
                    loading="lazy"
                    className="h-64 w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
