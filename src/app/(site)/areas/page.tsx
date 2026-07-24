import Link from "next/link";
import { ArrowRight, MapPinHouse } from "lucide-react";

import { JsonLd } from "@/components/seo/json-ld";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getPublicNeighborhoods, getPublicPageBySlug, splitParagraphs } from "@/lib/public-content";
import { buildMetadata } from "@/lib/seo";
import { buildBreadcrumbStructuredData } from "@/lib/structured-data";

export const revalidate = 300;

export async function generateMetadata() {
  const page = await getPublicPageBySlug("areas");
  return buildMetadata({ title: page?.seoTitle ?? page?.title ?? "Áreas atendidas", description: page?.seoDescription ?? page?.subtitle ?? "Cidades e bairros atendidos pela assessoria.", path: "/areas" });
}

export default async function AreasPage() {
  const [neighborhoods, page] = await Promise.all([getPublicNeighborhoods(), getPublicPageBySlug("areas")]);
  const paragraphs = splitParagraphs(page?.body);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <JsonLd
        data={buildBreadcrumbStructuredData([
          { name: "Início", path: "/" },
          { name: "Áreas atendidas", path: "/areas" },
        ])}
      />

      <div className="space-y-10">
        <SectionHeading
          as="h1"
          eyebrow="Atuação local"
          title={page?.title ?? "Cidades e bairros atendidos pela assessoria"}
          description={page?.subtitle ?? paragraphs[0] ?? "Explore as regiões com imóveis publicados e encontre informações organizadas para sua busca."}
          action={
            <Link href="/imoveis" className={buttonVariants({ variant: "gold" })}>
              Ver todos os imóveis
              <ArrowRight className="size-4" />
            </Link>
          }
        />

        {neighborhoods.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {neighborhoods.map((neighborhood) => (
              <Card key={neighborhood.slug} className="flex h-full flex-col p-6">
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="gold">
                    {neighborhood.city} / {neighborhood.state}
                  </Badge>
                  <MapPinHouse className="size-5 text-brand-gold" aria-hidden="true" />
                </div>

                <h2 className="mt-5 font-display text-3xl font-semibold text-brand-ivory">
                  {neighborhood.name}
                </h2>
                <p className="mt-3 flex-1 text-sm leading-7 text-brand-ivory/70">
                  {neighborhood.description ??
                    `Conheça os imóveis disponíveis e o atendimento da assessoria em ${neighborhood.name}.`}
                </p>
                <p className="mt-4 text-xs uppercase tracking-[0.24em] text-brand-beige/55">
                  {neighborhood.propertyCount === 1
                    ? "1 imóvel publicado"
                    : `${neighborhood.propertyCount} imóveis publicados`}
                </p>

                <Link
                  href={`/areas/${neighborhood.slug}`}
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "mt-5",
                  })}
                >
                  Conhecer a região
                  <ArrowRight className="size-4" />
                </Link>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-sm leading-7 text-brand-ivory/70">
            As regiões atendidas serão publicadas conforme o catálogo de imóveis for atualizado.
            Enquanto isso, fale com a assessoria para receber uma busca personalizada.
          </Card>
        )}
      </div>
    </div>
  );
}
