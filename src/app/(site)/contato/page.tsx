import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SectionHeading } from "@/components/shared/section-heading";
import { buildMetadata } from "@/lib/seo";
import { contactChannels } from "@/lib/site-data";

export const metadata = buildMetadata({
  title: "Contato",
  description:
    "Canal de contato da Luana Modotte para interessados, proprietarios e parceiros.",
  path: "/contato",
});

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-10">
        <SectionHeading
          eyebrow="Contato"
          title="Fale com a assessoria e encaminhe o imovel ou a sua demanda"
          description="Este bloco ja esta preparado para virar um fluxo real de captura de leads quando o backend entrar."
        />

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="p-6">
            <Badge variant="gold">Canais</Badge>
            <div className="mt-6 space-y-4">
              {contactChannels.map((channel) => (
                <div
                  key={channel.label}
                  className="rounded-2xl border border-brand-beige/12 bg-brand-ivory/4 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.28em] text-brand-beige/55">
                    {channel.label}
                  </p>
                  <p className="mt-2 font-display text-2xl text-brand-ivory">
                    {channel.value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-brand-ivory/70">
                    {channel.note}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-brand-beige/55">
              Formulario base
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Input placeholder="Nome" />
              <Input placeholder="E-mail" type="email" />
              <Input placeholder="Telefone" />
              <Input placeholder="Interesse principal" />
              <Textarea className="sm:col-span-2" placeholder="Conte sua necessidade" />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link href="/quero-vender" className={buttonVariants({ size: "lg" })}>
                Enviar mensagem
                <ArrowRight className="size-4" />
              </Link>
              <Badge variant="outline" className="normal-case tracking-normal">
                Captura de lead preparada
              </Badge>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
