import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SectionHeading } from "@/components/shared/section-heading";
import { buildMetadata } from "@/lib/seo";

type EditPropertyPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata = buildMetadata({
  title: "Editar imóvel",
  description: "Edição base de um imóvel do painel.",
  path: "/admin/imoveis",
  noIndex: true,
});

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Edição"
        title={`Editar imóvel ${id}`}
        description="Estrutura inicial pronta para ligar ao banco e ao editor de imagens."
        action={
          <Link href="/admin/imoveis" className={buttonVariants({ variant: "outline" })}>
            Voltar
            <ArrowRight className="size-4" />
          </Link>
        }
      />

      <Card className="space-y-5 p-6">
        <Badge variant="outline">Rascunho carregado</Badge>
        <div className="grid gap-4 md:grid-cols-2">
          <Input placeholder="Título do imóvel" defaultValue={`Imóvel ${id}`} />
          <Input placeholder="Status" defaultValue="published" />
          <Input placeholder="Cidade" defaultValue="Sao Paulo" />
          <Input placeholder="Bairro" defaultValue="Bairro exemplo" />
          <Input placeholder="Preço" defaultValue="R$ 1.500.000" />
          <Input placeholder="Área m²" defaultValue="180" />
          <Textarea className="md:col-span-2" defaultValue="Descrição base do imóvel." />
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/imoveis" className={buttonVariants({ size: "lg" })}>
            Salvar alteracoes
          </Link>
        </div>
      </Card>
    </div>
  );
}
