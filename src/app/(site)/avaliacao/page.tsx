import Link from "next/link";
import { ArrowRight, Calculator, ClipboardCheck, MapPinHouse, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SectionHeading } from "@/components/shared/section-heading";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Avaliação",
  description:
    "Página para solicitação de avaliação de imóvel com fluxo preparado para captura de leads.",
  path: "/avaliacao",
});

const steps = [
  {
    title: "Leitura do ativo",
    description: "Entender o perfil do imóvel, urgência e posicionamento.",
    icon: MapPinHouse,
  },
  {
    title: "Análise comparativa",
    description: "Comparar faixa, bairro e liquidez para sugerir estratégia.",
    icon: Calculator,
  },
  {
    title: "Ajustes de mercado",
    description: "Definir pontos de destaque e precificação mais inteligente.",
    icon: Sparkles,
  },
  {
    title: "Retorno comercial",
    description: "Enviar a leitura para o vendedor com próximos passos claros.",
    icon: ClipboardCheck,
  },
];

export default function EvaluationPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-10">
        <SectionHeading
          eyebrow="Avaliação"
          title="Solicite uma leitura comercial do seu imóvel"
          description="A página já está preparada para coletar dados e entregar uma primeira análise com base na estratégia da assessoria."
          action={
            <Link href="/contato" className={buttonVariants({ variant: "gold" })}>
              Falar com a assessoria
              <ArrowRight className="size-4" />
            </Link>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="space-y-4 p-6">
            <Badge variant="gold">Processo</Badge>
            <div className="space-y-4">
              {steps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.title}
                    className="rounded-2xl border border-brand-beige/12 bg-brand-ivory/4 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="grid size-10 shrink-0 place-items-center rounded-2xl border border-brand-gold/16 bg-brand-gold/12 text-brand-gold">
                        <Icon className="size-4" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-brand-beige/55">
                          Passo {index + 1}
                        </p>
                        <h2 className="mt-2 font-display text-2xl text-brand-ivory">
                          {step.title}
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-brand-ivory/68">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="space-y-5 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">
              Formulário base
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <Input placeholder="Nome" />
              <Input placeholder="E-mail" type="email" />
              <Input placeholder="Telefone" />
              <Input placeholder="Cidade / bairro" />
              <Textarea className="md:col-span-2" placeholder="Descreva o imóvel e a urgência" />
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/contato" className={buttonVariants({ size: "lg" })}>
                Enviar pedido
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
