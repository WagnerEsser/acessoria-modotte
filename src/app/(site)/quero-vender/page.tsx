import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { buildMetadata } from "@/lib/seo";
import { sellerBenefits, sellingSteps } from "@/lib/site-data";

export const metadata = buildMetadata({
  title: "Quero vender",
  description: "Pagina para proprietarios que querem vender com clareza.",
  path: "/quero-vender",
});

export default function SellPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-10">
        <SectionHeading
          eyebrow="Vendedores"
          title="Se voce quer vender, o foco e simples: apresentar melhor e fechar com seguranca"
          description="Um caminho curto para captar proprietarios sem excesso de conteudo."
          action={
            <Link href="/contato" className={buttonVariants({ size: "lg" })}>
              Pedir analise
              <ArrowRight className="size-4" />
            </Link>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="p-6">
            <Badge variant="gold">Por que contratar</Badge>
            <ul className="mt-5 space-y-4 text-sm leading-7 text-brand-ivory/72">
              {sellerBenefits.map((benefit) => (
                <li key={benefit} className="flex gap-3">
                  <span className="mt-2 size-2 rounded-full bg-brand-gold" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            {sellingSteps.map((step, index) => (
              <Card key={step.title} className="p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">
                  Passo {index + 1}
                </p>
                <h3 className="mt-3 font-display text-2xl font-semibold text-brand-ivory">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-brand-ivory/70">
                  {step.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
