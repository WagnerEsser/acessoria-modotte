import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/section-heading";
import { PropertyForm } from "@/components/admin/property-form";
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
        description="Este formulário grava o imóvel no Supabase e pode ser publicado ou salvo como rascunho."
        action={
          <Link href="/admin/imoveis" className={buttonVariants({ variant: "outline" })}>
            Voltar
            <ArrowRight className="size-4" />
          </Link>
        }
      />

      <PropertyForm
        action="/api/admin/properties"
        redirectTo="/admin/imoveis"
        submitLabel="Salvar imóvel"
        title="Dados do imóvel"
        description="Preencha os campos essenciais primeiro. Imagens, galeria e complementos podem entrar depois."
        values={{
          transactionType: "sale",
        }}
      />
    </div>
  );
}
