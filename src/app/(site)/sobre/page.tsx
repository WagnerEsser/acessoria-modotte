import { Award, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { buildMetadata } from "@/lib/seo";
import { brand } from "@/lib/brand";

export const metadata = buildMetadata({
  title: "Sobre",
  description:
    "Historia, proposta e valores da Luana Modotte Assessoria Imobiliaria.",
  path: "/sobre",
});

const values = [
  {
    title: "Credibilidade",
    description: "Cada contato precisa sentir seguranca desde o primeiro acesso.",
    icon: ShieldCheck,
  },
  {
    title: "Curadoria",
    description: "Menos volume, mais relevancia e melhor leitura comercial.",
    icon: Sparkles,
  },
  {
    title: "Proximidade",
    description: "A relacao com o cliente continua simples, clara e humana.",
    icon: HeartHandshake,
  },
  {
    title: "Excelencia",
    description: "Visual refinado, processo organizado e acompanhamento serio.",
    icon: Award,
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-12">
        <SectionHeading
          eyebrow="Sobre a assessoria"
          title="Uma marca pensada para unir sensibilidade, estrategia e operacao limpa"
          description={`${brand.name} nasce para atender pessoas que querem um site bonito, confiavel e facil de operar no dia a dia.`}
        />

        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <Card className="p-6">
            <Badge variant="gold">Historia</Badge>
            <h2 className="mt-4 font-display text-3xl font-semibold text-brand-ivory">
              Atendimento imobiliario com foco em clareza e resultado
            </h2>
            <p className="mt-4 text-sm leading-7 text-brand-ivory/70">
              A proposta da marca e traduzir o desejo do cliente em uma jornada
              segura. O site precisa ajudar a contar essa historia, destacar os
              imoveis certos e facilitar a operacao interna da assessoria.
            </p>
            <p className="mt-4 text-sm leading-7 text-brand-ivory/70">
              A base visual usa navy profundo e champagne gold para transmitir
              autoridade, sofistificacao e confianca sem perder a leitura rapida.
            </p>
          </Card>

          <Card className="p-6">
            <Badge variant="outline">Direcao de marca</Badge>
            <div className="mt-5 space-y-4 text-sm leading-6 text-brand-ivory/72">
              <p>• Tom premium e objetivo.</p>
              <p>• Conteudo claro para conversao.</p>
              <p>• Estrutura pronta para evoluir sem retrabalho.</p>
              <p>• Design consistente com a logo da empresa.</p>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {values.map((value) => {
            const Icon = value.icon;

            return (
              <Card key={value.title} className="p-5">
                <div className="grid size-11 place-items-center rounded-2xl border border-brand-gold/16 bg-brand-gold/12 text-brand-gold">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-5 font-display text-2xl font-semibold text-brand-ivory">
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
