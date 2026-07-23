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
    getPublicPageBySlug("servicos"),
  ]);

  if (!page) {
    return buildMetadata({
      title: "Serviços",
      description: siteSettings.defaultSeoDescription,
      path: "/servicos",
    });
  }

  return buildMetadata({
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? page.subtitle ?? siteSettings.defaultSeoDescription,
    path: "/servicos",
    image: page.ogImageUrl ?? page.heroImageUrl,
    imageAlt: page.title,
  });
}

export default async function ServicesPage() {
  const page = await getPublicPageBySlug("servicos");
  const paragraphs = splitParagraphs(page?.body);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-10">
        <SectionHeading
          as="h1"
          eyebrow="Serviços"
          title={page?.title ?? "Serviços essenciais"}
          description={page?.subtitle ?? paragraphs[0] ?? "Conteúdo de serviços ainda não cadastrado."}
          action={
            <Link href="/contato" className={buttonVariants({ variant: "gold" })}>
              Pedir atendimento
            </Link>
          }
        />

        {paragraphs.length ? (
          <Card className="p-6">
            <Badge variant="gold">Descrição</Badge>
            <div className="mt-4 space-y-4 text-sm leading-7 text-brand-ivory/70">
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </Card>
        ) : null}

        <div className="grid gap-6 md:grid-cols-3">
          {page?.blocks.length ? (
            page.blocks.map((block) => (
              <Card key={block.id} className="p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">
                  {block.blockKey}
                </p>
                <h3 className="mt-5 font-display text-2xl font-semibold text-brand-ivory">
                  {block.title ?? "Bloco"}
                </h3>
                {block.content ? (
                  <p className="mt-3 text-sm leading-7 text-brand-ivory/70">{block.content}</p>
                ) : null}
                <Link
                  href={`/servicos/${block.blockKey}`}
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "mt-5",
                  })}
                >
                  Conhecer o serviço
                  <ArrowRight className="size-4" />
                </Link>
              </Card>
            ))
          ) : (
            <Card className="p-6 text-sm leading-6 text-brand-ivory/68">
              Compra assistida, venda estratégica e apoio documental com acompanhamento próximo em
              cada etapa.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
