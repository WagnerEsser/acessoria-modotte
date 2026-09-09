import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  BedDouble,
  CalendarDays,
  CarFront,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Receipt,
  ShieldCheck,
  Sofa,
  Sparkles,
  Square,
} from "lucide-react";

import { JsonLd } from "@/components/seo/json-ld";
import { PublicPageLink } from "@/components/shared/public-page-link";
import { PropertyImageGallery } from "@/components/site/property-image-gallery";
import { PropertyMap } from "@/components/site/property-map";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  formatBrazilianPhoneDisplayNumber,
  getWhatsAppHref,
} from "@/lib/contact";
import {
  getPublicPropertyBySlug,
  getPublicSiteSettings,
  splitParagraphs,
  type PublicPropertyDetail,
} from "@/lib/public-content";
import { buildMetadata } from "@/lib/seo";
import { buildBreadcrumbStructuredData } from "@/lib/structured-data";
import { cn } from "@/lib/utils";

export const revalidate = 300;

type PropertyV2PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatTransactionType(value: string) {
  const normalizedValue = value.trim().toLowerCase();

  if (["sale", "venda", "buy"].includes(normalizedValue)) {
    return "Venda";
  }

  if (["rent", "aluguel", "locacao", "locação"].includes(normalizedValue)) {
    return "Locação";
  }

  return value;
}

function getPropertyContactHref(
  property: PublicPropertyDetail,
  whatsappNumber: string | null,
) {
  const targetNumber = property.contactWhatsapp ?? whatsappNumber;

  if (!targetNumber) {
    return "/contato";
  }

  return getWhatsAppHref(
    `Olá, tenho interesse no imóvel ${property.title}.`,
    targetNumber,
  );
}

function getDisplayLocation(property: PublicPropertyDetail) {
  if (property.showFullAddress && property.address) {
    return [property.address, property.city, property.state].filter(Boolean).join(" - ");
  }

  return [property.neighborhoodName, property.city, property.state].filter(Boolean).join(" - ");
}

function getMapQuery(property: PublicPropertyDetail) {
  if (property.showFullAddress) {
    return [property.address, property.neighborhoodName, property.city, property.state]
      .filter(Boolean)
      .join(", ");
  }

  return [property.neighborhoodName, property.city, property.state].filter(Boolean).join(", ");
}

function FeatureMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Square;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.25rem] border border-brand-navy/10 bg-white p-4 shadow-[0_16px_42px_-36px_rgba(7,17,29,0.32)]">
      <Icon className="size-5 text-brand-taupe" aria-hidden="true" />
      <p className="mt-4 text-xs uppercase tracking-[0.22em] text-brand-taupe">
        {label}
      </p>
      <p className="mt-1 font-numeric text-2xl font-semibold text-brand-navy">
        {value}
      </p>
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs uppercase tracking-[0.28em] text-brand-taupe">{eyebrow}</p>
      <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-brand-navy">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-sm leading-7 text-brand-navy/64">{description}</p>
      ) : null}
    </div>
  );
}

export async function generateMetadata({
  params,
}: PropertyV2PageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPublicPropertyBySlug(slug);

  if (!property) {
    return buildMetadata({
      title: "Imóvel não encontrado",
      description: "O imóvel solicitado não existe ou ainda não foi publicado.",
      path: `/imoveis-v2/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: `Nova visualização - ${property.seoTitle ?? property.title}`,
    description:
      property.seoDescription ??
      property.summary ??
      property.description ??
      property.price,
    path: `/imoveis-v2/${property.slug}`,
    image: property.coverImageUrl,
    imageAlt: property.coverImageAlt ?? property.title,
    noIndex: true,
  });
}

export default async function PropertyV2DetailPage({ params }: PropertyV2PageProps) {
  const { slug } = await params;
  const [property, siteSettings] = await Promise.all([
    getPublicPropertyBySlug(slug),
    getPublicSiteSettings(),
  ]);

  if (!property) {
    notFound();
  }

  const paragraphs = splitParagraphs(property.description);
  const contactHref = getPropertyContactHref(property, siteSettings.whatsappNumber);
  const contactOpensNewTab = contactHref.startsWith("http");
  const displayLocation = getDisplayLocation(property);
  const mapQuery = getMapQuery(property);
  const coverImage = property.images[0] ?? null;
  const galleryPreviewImages = property.images.slice(1, 4);
  const metrics = [
    { key: "area", label: "Área", value: property.size, icon: Square },
    {
      key: "bedrooms",
      label: "Dormitórios",
      value: property.bedrooms && property.bedrooms > 0 ? String(property.bedrooms) : null,
      icon: BedDouble,
    },
    {
      key: "bathrooms",
      label: "Banheiros",
      value: property.bathrooms && property.bathrooms > 0 ? String(property.bathrooms) : null,
      icon: Bath,
    },
    {
      key: "garages",
      label: "Vagas",
      value: property.garages && property.garages > 0 ? String(property.garages) : null,
      icon: CarFront,
    },
  ].filter((item): item is { key: string; label: string; value: string; icon: typeof Square } =>
    Boolean(item.value),
  );
  const costItems = [
    { key: "condominium", label: "Condomínio", value: property.condominiumFee, icon: Receipt },
    { key: "iptu", label: "IPTU", value: property.iptuValue, icon: Receipt },
    {
      key: "built-year",
      label: "Construção",
      value: property.builtYear ? String(property.builtYear) : null,
      icon: CalendarDays,
    },
    { key: "furnished", label: "Mobiliado", value: property.furnished ? "Sim" : null, icon: Sofa },
  ].filter((item): item is { key: string; label: string; value: string; icon: typeof Receipt } =>
    Boolean(item.value),
  );

  return (
    <main className="bg-brand-ivory text-brand-navy">
      <JsonLd
        data={buildBreadcrumbStructuredData([
          { name: "Início", path: "/" },
          { name: "Imóveis", path: "/imoveis-v2" },
          { name: property.title, path: `/imoveis-v2/${property.slug}` },
        ])}
      />

      <section className="relative overflow-hidden bg-brand-ink text-brand-ivory">
        <div className="absolute inset-0">
          {coverImage ? (
            <img
              src={coverImage.url}
              alt=""
              aria-hidden="true"
              width={coverImage.width ?? 1800}
              height={coverImage.height ?? 1100}
              className="h-full w-full object-cover opacity-30"
            />
          ) : null}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,17,29,0.98),rgba(7,17,29,0.82)_54%,rgba(7,17,29,0.30))]" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:px-8 lg:py-16">
          <div className="flex min-h-[34rem] flex-col justify-center">
            <Link
              href="/imoveis"
              className="mb-8 inline-flex w-fit items-center gap-2 text-sm font-medium text-brand-ivory/68 transition hover:text-brand-gold"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Voltar para imóveis
            </Link>

            <div className="mb-5 flex flex-wrap gap-3">
              <Badge variant="gold" className="border-brand-gold bg-brand-gold text-brand-navy">
                {formatTransactionType(property.transactionType)}
              </Badge>
              <Badge variant="soft" className="border-brand-ivory/18 bg-brand-ivory/10 text-brand-ivory">
                {property.type}
              </Badge>
              {property.featured ? (
                <Badge variant="soft" className="border-brand-gold/35 bg-brand-gold/12 text-brand-gold">
                  Destaque
                </Badge>
              ) : null}
            </div>

            <h1 className="max-w-4xl font-display text-5xl font-semibold leading-[0.96] text-brand-ivory sm:text-6xl lg:text-7xl">
              {property.title}
            </h1>

            {displayLocation ? (
              <p className="mt-6 flex items-start gap-2 text-sm leading-6 text-brand-ivory/72 sm:text-base">
                <MapPin className="mt-1 size-4 shrink-0 text-brand-gold" aria-hidden="true" />
                {displayLocation}
              </p>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="rounded-[1.25rem] bg-white px-5 py-4 text-brand-navy">
                <p className="text-xs uppercase tracking-[0.22em] text-brand-taupe">Valor</p>
                <p className="mt-1 font-numeric text-2xl font-semibold">{property.price}</p>
              </div>
              <Link
                href={contactHref}
                target={contactOpensNewTab ? "_blank" : undefined}
                rel={contactOpensNewTab ? "noreferrer" : undefined}
                className={buttonVariants({ variant: "gold", size: "lg" })}
              >
                Pedir informações
                <MessageCircle className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="self-end">
            <div className="grid gap-3 sm:grid-cols-[1fr_12rem]">
              <div className="relative min-h-[24rem] overflow-hidden rounded-[1.5rem] border border-brand-ivory/16 bg-brand-navy">
                {coverImage ? (
                  <img
                    src={coverImage.url}
                    alt={coverImage.altText ?? property.title}
                    width={coverImage.width ?? 1600}
                    height={coverImage.height ?? 1100}
                    loading="eager"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,#13253B,#CBB28C)]" />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(7,17,29,0.72))]" />
                <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-white">
                    {property.images.length
                      ? `${property.images.length} fotos no cadastro`
                      : "Imagem principal em destaque"}
                  </span>
                  <a
                    href="#galeria-v2"
                    className="rounded-full border border-white/25 bg-white/14 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:border-brand-gold hover:text-brand-gold"
                  >
                    Ver galeria
                  </a>
                </div>
              </div>

              {galleryPreviewImages.length ? (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-1">
                  {galleryPreviewImages.map((image) => (
                    <img
                      key={image.url}
                      src={image.url}
                      alt={image.altText ?? property.title}
                      width={image.width ?? 360}
                      height={image.height ?? 240}
                      loading="lazy"
                      className="aspect-[4/3] rounded-[1.25rem] border border-brand-ivory/16 object-cover"
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-brand-navy/10 bg-white">
        <div className="mx-auto grid max-w-7xl gap-3 px-4 py-5 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {metrics.length ? (
            metrics.map((metric) => (
              <FeatureMetric
                key={metric.key}
                icon={metric.icon}
                label={metric.label}
                value={metric.value}
              />
            ))
          ) : (
            <p className="text-sm text-brand-navy/62">Dados principais ainda não preenchidos.</p>
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_22rem] lg:px-8">
        <div className="min-w-0 space-y-12">
          <section>
            <SectionTitle
              eyebrow="Leitura do imóvel"
              title="O que este cadastro entrega para a decisão"
              description={property.summary ?? undefined}
            />

            {paragraphs.length ? (
              <div className="mt-6 space-y-5 rounded-[1.5rem] border border-brand-navy/10 bg-white p-6 text-base leading-8 text-brand-navy/68">
                {paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-[1.5rem] border border-brand-navy/10 bg-white p-6 text-sm leading-6 text-brand-navy/62">
                A descrição será exibida aqui quando estiver preenchida no cadastro.
              </div>
            )}
          </section>

          <section>
            <SectionTitle
              eyebrow="Características"
              title="Destaques e informações complementares"
            />

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {property.highlights.length ? (
                property.highlights.map((highlight) => (
                  <div
                    key={highlight}
                    className="flex items-start gap-3 rounded-[1.25rem] border border-brand-navy/10 bg-white p-4 text-sm leading-6 text-brand-navy/70"
                  >
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-taupe" aria-hidden="true" />
                    {highlight}
                  </div>
                ))
              ) : (
                <div className="rounded-[1.25rem] border border-brand-navy/10 bg-white p-4 text-sm text-brand-navy/62">
                  Os destaques serão adicionados quando o cadastro estiver completo.
                </div>
              )}
            </div>

            {property.features.length ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {property.features.map((feature) => (
                  <div
                    key={`${feature.label}-${feature.sortOrder}`}
                    className="rounded-[1.25rem] border border-brand-navy/10 bg-brand-navy p-4 text-brand-ivory"
                  >
                    <p className="text-xs uppercase tracking-[0.24em] text-brand-beige/65">
                      {feature.label}
                    </p>
                    {feature.value ? (
                      <p className="mt-2 font-numeric text-xl">{feature.value}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          {property.images.length ? (
            <section id="galeria-v2" className="scroll-mt-28">
              <SectionTitle
                eyebrow="Galeria"
                title="Fotos para observar o imóvel com calma"
              />
              <div className="mt-6 rounded-[1.5rem] border border-brand-navy/10 bg-brand-navy p-3">
                <PropertyImageGallery images={property.images} title={property.title} />
              </div>
            </section>
          ) : null}

          {property.videos.length ? (
            <section>
              <SectionTitle eyebrow="Vídeo" title="Visita em vídeo" />
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {property.videos.map((video) => (
                  <div
                    key={video.url}
                    className="overflow-hidden rounded-[1.5rem] border border-brand-navy/10 bg-brand-navy"
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
            </section>
          ) : null}

          <div className="rounded-[1.5rem] border border-brand-navy/10 bg-white p-5 [&_h2]:text-brand-navy [&_p]:text-brand-navy/64">
            <PropertyMap query={mapQuery} />
          </div>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="space-y-4 rounded-[1.5rem] border border-brand-navy/10 bg-white p-5 shadow-[0_20px_60px_-44px_rgba(7,17,29,0.38)]">
            <div className="rounded-[1.25rem] bg-brand-navy p-5 text-brand-ivory">
              <div className="flex items-center gap-2 text-sm font-medium text-brand-gold">
                <Sparkles className="size-4" aria-hidden="true" />
                Atendimento de assessoria
              </div>
              <p className="mt-4 text-sm leading-6 text-brand-ivory/72">
                Tire dúvidas, confirme disponibilidade e receba uma leitura de negócio antes da visita.
              </p>
            </div>

            <div className="rounded-[1.25rem] bg-brand-ivory p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-brand-taupe">Valor</p>
              <p className="mt-1 font-numeric text-2xl font-semibold text-brand-navy">
                {property.price}
              </p>
            </div>

            {costItems.length ? (
              <div className="grid gap-2">
                {costItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.key}
                      className="flex items-center justify-between gap-3 rounded-[1rem] border border-brand-navy/10 px-3 py-2 text-sm"
                    >
                      <span className="flex items-center gap-2 text-brand-navy/62">
                        <Icon className="size-4 text-brand-taupe" aria-hidden="true" />
                        {item.label}
                      </span>
                      <span className="font-numeric font-semibold text-brand-navy">
                        {item.value}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : null}

            <Link
              href={contactHref}
              target={contactOpensNewTab ? "_blank" : undefined}
              rel={contactOpensNewTab ? "noreferrer" : undefined}
              className={cn(buttonVariants({ variant: "navy", size: "lg" }), "w-full")}
            >
              Chamar no WhatsApp
              <MessageCircle className="size-4" aria-hidden="true" />
            </Link>

            <PublicPageLink
              href="/contato"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full border-brand-navy/16 text-brand-navy hover:bg-brand-navy/5")}
            >
              Enviar contato
              <ArrowRight className="size-4" aria-hidden="true" />
            </PublicPageLink>

            <div className="space-y-2 border-t border-brand-navy/10 pt-4 text-sm leading-6 text-brand-navy/62">
              {property.contactWhatsapp ? (
                <p className="font-numeric">
                  WhatsApp: {formatBrazilianPhoneDisplayNumber(property.contactWhatsapp)}
                </p>
              ) : null}
              {property.contactPhone ? (
                <p className="font-numeric">
                  Telefone: {formatBrazilianPhoneDisplayNumber(property.contactPhone)}
                </p>
              ) : null}
              <p className="flex items-start gap-2">
                <ShieldCheck className="mt-1 size-4 shrink-0 text-brand-taupe" aria-hidden="true" />
                Informações públicas exibidas conforme o cadastro publicado.
              </p>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
