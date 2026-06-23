import { HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { brand } from "@/lib/brand";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Sobre",
  description: "Quem somos e como a assessoria trabalha.",
  path: "/sobre",
});

const values = [
  {
    title: "Credibilidade",
    description: "Atendimento seguro desde o primeiro contato.",
    icon: ShieldCheck,
  },
  {
    title: "Curadoria",
    description: "Menos volume, mais foco no que faz sentido.",
    icon: Sparkles,
  },
  {
    title: "Proximidade",
    description: "Relacionamento simples, claro e humano.",
    icon: HeartHandshake,
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-12">
        <SectionHeading
          eyebrow="Sobre"
          title="Uma assessoria pequena, clara e pronta para evoluir"
          description={`${brand.name} prioriza curadoria, contato direto e operacao simples.`}
        />

        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <Card className="p-6">
            <Badge variant="gold">Essencia</Badge>
            <h2 className="mt-4 font-display text-3xl font-semibold text-brand-ivory">
              Clareza no atendimento e consistencia na entrega
            </h2>
            <p className="mt-4 text-sm leading-7 text-brand-ivory/70">
              A marca foi desenhada para comunicar confianca, destacar poucos
              imoveis e facilitar a gestao diaria.
            </p>
          </Card>

          <Card className="p-6">
            <Badge variant="outline">Direcao</Badge>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-brand-ivory/72">
              <li className="flex gap-2">
                <span className="mt-2 size-1.5 rounded-full bg-brand-gold" />
                <span>Tom premium e direto.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-2 size-1.5 rounded-full bg-brand-gold" />
                <span>Poucos blocos, mais clareza.</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-2 size-1.5 rounded-full bg-brand-gold" />
                <span>Identidade alinhada a logo e paleta.</span>
              </li>
            </ul>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {values.map((value) => {
            const Icon = value.icon;

            return (
              <Card key={value.title} className="p-5">
                <div className="grid size-11 place-items-center rounded-2xl border border-brand-gold/16 bg-brand-gold/12 text-brand-gold">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold text-brand-ivory">
                  {value.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-brand-ivory/70">
                  {value.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
