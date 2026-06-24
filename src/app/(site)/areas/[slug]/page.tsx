import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPinHouse, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PropertyCard } from "@/components/shared/property-card";
import { SectionHeading } from "@/components/shared/section-heading";
import {
  getPublicNeighborhoodBySlug,
  getPublicNeighborhoodProperties,
} from "@/lib/public-content";
import { buildMetadata } from "@/lib/seo";

type NeighborhoodPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: NeighborhoodPageProps): Promise<Metadata> {
  const { slug } = await params;
  const neighborhood = await getPublicNeighborhoodBySlug(slug);

  if (!neighborhood) {
    return buildMetadata({
      title: "Área não encontrada",
      description: "A área solicitada não existe ou ainda não foi publicada.",
      path: `/areas/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: neighborhood.seoTitle ?? neighborhood.name,
    description: neighborhood.seoDescription ?? neighborhood.description ?? "Área da assessoria imobiliária.",
    path: `/areas/${neighborhood.slug}`,
  });
}

export default async function NeighborhoodPage({ params }: NeighborhoodPageProps) {
  const { slug } = await params;
  const neighborhood = await getPublicNeighborhoodBySlug(slug);

  if (!neighborhood) {
    notFound();
  }

  const properties = await getPublicNeighborhoodProperties(slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-10">
        <SectionHeading
          eyebrow="Áreas"
          title={neighborhood.name}
          description={neighborhood.description ?? undefined}
        />

        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <Card className="p-6">
            <Badge variant="gold">{neighborhood.city} / {neighborhood.state}</Badge>
            <div className="mt-5 flex items-center gap-3">
              <MapPinHouse className="size-5 text-brand-gold" />
              <p className="text-sm uppercase tracking-[0.28em] text-brand-beige/55">
                Conteúdo local da região
              </p>
            </div>
            <p className="mt-4 text-sm leading-7 text-brand-ivory/70">
              A página de área destaca zonas de interesse e conecta o bairro aos imóveis publicados
              com esse vínculo no cadastro.
            </p>
          </Card>

          <Card className="p-6">
            <Sparkles className="size-5 text-brand-gold" />
            <p className="mt-4 text-xs uppercase tracking-[0.3em] text-brand-beige/55">
              Imóveis vinculados
            </p>
            <p className="mt-2 font-numeric text-5xl text-brand-ivory">
              {neighborhood.propertyCount}
            </p>
            <p className="mt-2 text-sm text-brand-ivory/68">
              Publicados e associados a esta área.
            </p>
          </Card>
        </div>

        {properties.length ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {properties.map((property) => (
              <PropertyCard key={property.slug} property={property} />
            ))}
          </div>
        ) : (
          <Card className="p-6 text-sm leading-6 text-brand-ivory/70">
            Nenhum imóvel publicado com vínculo para esta área ainda.
          </Card>
        )}
      </div>
    </div>
  );
}
