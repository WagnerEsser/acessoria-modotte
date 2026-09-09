import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { RichText } from "@/components/shared/rich-text";
import { ContactLeadForm } from "@/components/site/contact-lead-form";
import {
  getPublicContactChannels,
  getPublicPageBySlug,
  getPublicSiteSettings,
  splitParagraphs,
} from "@/lib/public-content";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const [siteSettings, page] = await Promise.all([
    getPublicSiteSettings(),
    getPublicPageBySlug("contato"),
  ]);
  if (!page) notFound();

  if (!page) {
    return buildMetadata({
      title: "Contato",
      description: siteSettings.defaultSeoDescription,
      path: "/contato",
    });
  }

  return buildMetadata({
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? page.subtitle ?? siteSettings.defaultSeoDescription,
    path: "/contato",
    image: page.ogImageUrl ?? page.heroImageUrl,
    imageAlt: page.title,
  });
}

export default async function ContactPage() {
  const [siteSettings, page] = await Promise.all([
    getPublicSiteSettings(),
    getPublicPageBySlug("contato"),
  ]);
  const contactChannels = getPublicContactChannels(siteSettings);
  const pageParagraphs = splitParagraphs(page?.body);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-10">
        <SectionHeading
          as="h1"
          eyebrow="Contato"
          title={page?.title ?? "Fale com a assessoria e encaminhe sua demanda"}
          description={
            page?.subtitle ??
            pageParagraphs[0] ??
            "Fale diretamente com a assessoria para comprar, vender, avaliar um imóvel ou esclarecer dúvidas."
          }
        />

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="p-6">
            <Badge variant="gold">Canais</Badge>
            <div className="mt-6 space-y-4">
              {contactChannels.map((channel) => (
                <a
                  key={channel.label}
                  href={channel.href}
                  className="block rounded-2xl border border-brand-beige/12 bg-brand-ivory/4 p-4 transition hover:border-brand-gold/30 hover:bg-brand-ivory/6"
                >
                  <p className="text-xs uppercase tracking-[0.28em] text-brand-beige/55">
                    {channel.label}
                  </p>
                  <p className="mt-2 font-numeric text-2xl text-brand-ivory">
                    {channel.value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-brand-ivory/70">{channel.note}</p>
                </a>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            {pageParagraphs.length ? (
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">
                  Conteúdo da página
                </p>
                <div className="space-y-3 text-sm leading-7 text-brand-ivory/72">
                  <RichText value={page?.body} />
                </div>
              </div>
            ) : null}

            <ContactLeadForm />
          </Card>
        </div>
      </div>
    </div>
  );
}
