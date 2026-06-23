import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Bath, BedDouble, CarFront, MapPin, Square } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { buildMetadata } from "@/lib/seo";
import { featuredProperties, getPropertyBySlug } from "@/lib/site-data";

type PropertyPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return featuredProperties.map((property) => ({
    slug: property.slug,
  }));
}

export async function generateMetadata({
  params,
}: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);

  if (!property) {
    return buildMetadata({
      title: "Imóvel não encontrado",
      description: "O imóvel solicitado não existe ou foi removido.",
      path: `/imoveis/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: property.title,
    description: property.summary,
    path: `/imoveis/${property.slug}`,
  });
}

export default async function PropertyDetailPage({ params }: PropertyPageProps) {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-10">
        <SectionHeading
          eyebrow="Detalhe do imóvel"
          title={property.title}
          description={property.summary}
          action={
            <Link href="/contato" className={buttonVariants({ variant: "gold" })}>
              Agendar visita
              <ArrowRight className="size-4" />
            </Link>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className={`bg-gradient-to-br ${property.accent} p-8`}>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="soft">{property.type}</Badge>
              <Badge variant="gold">{property.price}</Badge>
            </div>

            <div className="mt-24 space-y-2">
              <div className="flex items-center gap-2 text-sm uppercase tracking-[0.28em] text-brand-ivory/72">
                <MapPin className="size-4" />
                {property.city} - {property.location}
              </div>
              <h2 className="max-w-2xl font-display text-4xl font-semibold leading-tight text-brand-ivory">
                {property.title}
              </h2>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">
                Dados principais
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-brand-beige/12 bg-brand-ivory/4 p-4">
                  <Square className="size-4 text-brand-gold" />
                  <p className="mt-3 text-sm text-brand-ivory/68">Área</p>
                  <p className="font-display text-2xl text-brand-ivory">{property.size}</p>
                </div>
                <div className="rounded-2xl border border-brand-beige/12 bg-brand-ivory/4 p-4">
                  <BedDouble className="size-4 text-brand-gold" />
                  <p className="mt-3 text-sm text-brand-ivory/68">Dormitórios</p>
                  <p className="font-display text-2xl text-brand-ivory">{property.bedrooms}</p>
                </div>
                <div className="rounded-2xl border border-brand-beige/12 bg-brand-ivory/4 p-4">
                  <Bath className="size-4 text-brand-gold" />
                  <p className="mt-3 text-sm text-brand-ivory/68">Banheiros</p>
                  <p className="font-display text-2xl text-brand-ivory">{property.bathrooms}</p>
                </div>
                <div className="rounded-2xl border border-brand-beige/12 bg-brand-ivory/4 p-4">
                  <CarFront className="size-4 text-brand-gold" />
                  <p className="mt-3 text-sm text-brand-ivory/68">Vagas</p>
                  <p className="font-display text-2xl text-brand-ivory">{property.garages}</p>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">
                Destaques
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {property.highlights.map((highlight) => (
                  <Badge key={highlight} variant="outline" className="normal-case tracking-normal">
                    {highlight}
                  </Badge>
                ))}
              </div>
              <p className="mt-5 text-sm leading-6 text-brand-ivory/70">
                Esta página já está preparada para receber galeria, documentos,
                mapa e campos dinâmicos do banco quando a migração entrar.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
