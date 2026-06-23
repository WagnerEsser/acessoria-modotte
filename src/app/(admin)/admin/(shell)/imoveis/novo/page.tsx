import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SectionHeading } from "@/components/shared/section-heading";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Novo imóvel",
  description: "Formulário base para cadastro de imóvel no painel.",
  path: "/admin/imoveis/novo",
  noIndex: true,
});

export default function NewPropertyPage() {
  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Cadastro"
        title="Criar novo imóvel"
        description="A página já está preparada para um formulário real de persistência quando a camada de backend entrar."
        action={
          <Link href="/admin/imoveis" className={buttonVariants({ variant: "outline" })}>
            Voltar
            <ArrowRight className="size-4" />
          </Link>
        }
      />

      <Card className="space-y-5 p-6">
        <Badge variant="gold">Base do formulário</Badge>
        <div className="grid gap-4 md:grid-cols-2">
          <Input placeholder="Título do imóvel" />
          <Input placeholder="Tipo" />
          <Input placeholder="Cidade" />
          <Input placeholder="Bairro" />
          <Input placeholder="Preço" />
          <Input placeholder="Área m²" />
          <Textarea className="md:col-span-2" placeholder="Descrição principal" />
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/imoveis" className={buttonVariants({ size: "lg" })}>
            Salvar rascunho
          </Link>
        </div>
      </Card>
    </div>
  );
}
