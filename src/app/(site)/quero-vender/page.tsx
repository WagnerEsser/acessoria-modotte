import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { getPublicPageBySlug, getPublicSiteSettings, splitParagraphs } from "@/lib/public-content";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const [siteSettings, page] = await Promise.all([
    getPublicSiteSettings(),
    getPublicPageBySlug("quero-vender"),
  ]);

  if (!page) {
    return buildMetadata({
      title: "Quero vender",
      description: siteSettings.defaultSeoDescription,
      path: "/quero-vender",
    });
  }

  return buildMetadata({
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? page.subtitle ?? siteSettings.defaultSeoDescription,
    path: "/quero-vender",
    image: page.ogImageUrl ?? page.heroImageUrl,
    imageAlt: page.title,
  });
}

export default async function SellPage() {
  const page = await getPublicPageBySlug("quero-vender");
  const paragraphs = splitParagraphs(page?.body);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-10">
        <SectionHeading
          as="h1"
          eyebrow="Vendedores"
          title={page?.title ?? "Se você quer vender, comece pelo essencial"}
          description={page?.subtitle ?? paragraphs[0] ?? "Conteúdo para vendedores ainda não cadastrado."}
          action={
            <Link href="/contato" className={buttonVariants({ size: "lg" })}>
              Pedir análise
              <ArrowRight className="size-4" />
            </Link>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="p-6">
            <Badge variant="gold">Conteúdo</Badge>
            <div className="mt-4 space-y-4 text-sm leading-7 text-brand-ivory/70">
              {paragraphs.length ? (
                paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
              ) : (
                <p>
                  Receba uma análise inicial do imóvel, orientação de posicionamento e acompanhamento
                  da preparação ao fechamento da venda.
                </p>
              )}
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            {page?.blocks.length ? (
              page.blocks.map((block, index) => (
                <Card key={block.id} className="p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">
                    Passo {index + 1}
                  </p>
                  <h3 className="mt-3 font-display text-2xl font-semibold text-brand-ivory">
                    {block.title ?? "Bloco"}
                  </h3>
                  {block.content ? (
                    <p className="mt-3 text-sm leading-6 text-brand-ivory/70">{block.content}</p>
                  ) : null}
                </Card>
              ))
            ) : (
              <Card className="p-5 text-sm leading-6 text-brand-ivory/68">
                Conte sua necessidade para a assessoria preparar uma estratégia de venda adequada ao
                imóvel e ao seu momento.
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
