import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
      <div className="space-y-4">
        <Link href="/admin/imoveis" className={buttonVariants({ variant: "outline", size: "sm" })}>
          <ArrowLeft className="size-4" />
          Voltar
        </Link>
        <SectionHeading
          eyebrow="Cadastro"
          title="Criar novo imóvel"
          description="Preencha as informações do imóvel e escolha se deseja publicá-lo agora ou deixá-lo salvo para revisar depois."
        />
      </div>

      <PropertyForm
        action="/api/admin/properties"
        redirectTo="/admin/imoveis"
        submitLabel="Salvar imóvel"
        values={{
          transactionType: "sale",
        }}
      />
    </div>
  );
}
