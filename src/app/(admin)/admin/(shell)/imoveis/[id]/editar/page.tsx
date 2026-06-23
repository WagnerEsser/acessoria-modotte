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
  title: "Editar imovel",
  description: "Edicao base de um imovel do painel.",
  path: "/admin/imoveis",
  noIndex: true,
});

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Edicao"
        title={`Editar imovel ${id}`}
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
          <Input placeholder="Titulo do imovel" defaultValue={`Imovel ${id}`} />
          <Input placeholder="Status" defaultValue="published" />
          <Input placeholder="Cidade" defaultValue="Sao Paulo" />
          <Input placeholder="Bairro" defaultValue="Bairro exemplo" />
          <Input placeholder="Preco" defaultValue="R$ 1.500.000" />
          <Input placeholder="Area m2" defaultValue="180" />
          <Textarea className="md:col-span-2" defaultValue="Descricao base do imovel." />
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
