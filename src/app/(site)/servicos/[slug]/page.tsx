import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { JsonLd } from "@/components/seo/json-ld";
import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getPublicPageBySlug } from "@/lib/public-content";
import { buildMetadata } from "@/lib/seo";
import { buildBreadcrumbStructuredData } from "@/lib/structured-data";

type ServiceDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

export async function generateStaticParams() {
  const page = await getPublicPageBySlug("servicos");

  return (page?.blocks ?? []).map((block) => ({ slug: block.blockKey }));
}

export async function generateMetadata({
  params,
}: ServiceDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublicPageBySlug("servicos");
  const service = page?.blocks.find((block) => block.blockKey === slug);

  if (!service) {
    return buildMetadata({
      title: "Serviço não encontrado",
      description: "O serviço solicitado não está publicado.",
      path: `/servicos/${slug}`,
      noIndex: true,
    });
  }

  const title = service.title ?? "Assessoria imobiliária";

  return buildMetadata({
    title,
    description:
      service.content ??
      `${title} com atendimento próximo e orientação da Luana Modotte Assessoria Imobiliária.`,
    path: `/servicos/${slug}`,
  });
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { slug } = await params;
  const page = await getPublicPageBySlug("servicos");
  const service = page?.blocks.find((block) => block.blockKey === slug);

  if (!service) {
    notFound();
  }

  const title = service.title ?? "Assessoria imobiliária";

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <JsonLd
        data={buildBreadcrumbStructuredData([
          { name: "Início", path: "/" },
          { name: "Serviços", path: "/servicos" },
          { name: title, path: `/servicos/${slug}` },
        ])}
      />

      <div className="space-y-10">
        <SectionHeading
          as="h1"
          eyebrow="Serviço imobiliário"
          title={title}
          description={
            service.content ??
            "Atendimento próximo para organizar informações, reduzir riscos e conduzir a negociação com clareza."
          }
          action={
            <Link href="/contato" className={buttonVariants({ variant: "gold" })}>
              Solicitar atendimento
              <ArrowRight className="size-4" />
            </Link>
          }
        />

        <Card className="p-7">
          <Badge variant="gold">Como funciona</Badge>
          <div className="mt-5 space-y-4 text-base leading-8 text-brand-ivory/74">
            <p>
              Cada atendimento começa pela compreensão do imóvel, do objetivo da negociação e do
              momento do cliente. A assessoria organiza os próximos passos e mantém a comunicação
              clara durante todo o processo.
            </p>
            <p>
              Entre em contato para receber uma orientação inicial e entender como este serviço pode
              ser aplicado ao seu caso.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
