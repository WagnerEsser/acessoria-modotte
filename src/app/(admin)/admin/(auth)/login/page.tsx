import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getLoginErrorMessage, sanitizeAdminRedirect } from "@/lib/auth";
import { brand } from "@/lib/brand";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Login do painel",
  description: "Acesso administrativo da assessoria imobiliária.",
  path: "/admin/login",
  noIndex: true,
});

export const dynamic = "force-dynamic";

function getFirstValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const errorMessage = getLoginErrorMessage(getFirstValue(resolvedSearchParams.error));
  const redirectTo = sanitizeAdminRedirect(getFirstValue(resolvedSearchParams.redirectTo));

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(203,178,140,0.12),_transparent_32%),linear-gradient(180deg,_#07111d_0%,_#0b1b2c_100%)] px-4 py-10 text-brand-ivory">
      <div className="mx-auto mb-6 flex w-full max-w-lg justify-start">
        <Link href="/" className={buttonVariants({ variant: "outline", size: "sm" })}>
          Voltar ao site
        </Link>
      </div>

      <Card className="mx-auto w-full max-w-lg p-8">
        <div className="grid size-12 place-items-center rounded-2xl border border-brand-gold/16 bg-brand-gold/12 text-brand-gold">
          <LockKeyhole className="size-5" />
        </div>

        <Badge variant="soft" className="mt-6">
          Acesso restrito
        </Badge>

        <h1 className="mt-4 font-display text-4xl font-semibold text-brand-ivory">
          Entrar no painel
        </h1>
        <p className="mt-3 text-sm leading-6 text-brand-ivory/70">
          Use suas credenciais do Supabase Auth para entrar no painel
          administrativo da assessoria.
        </p>

        <form action="/api/auth/sign-in" method="post" className="mt-6 space-y-4">
          <input type="hidden" name="redirectTo" value={redirectTo} />

          <label className="block space-y-2">
            <span className="text-sm text-brand-ivory/78">E-mail</span>
            <Input
              autoComplete="email"
              name="email"
              placeholder="voce@empresa.com.br"
              type="email"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-brand-ivory/78">Senha</span>
            <Input
              autoComplete="current-password"
              name="password"
              placeholder="senha"
              type="password"
              required
            />
          </label>

          <div
            className={
              errorMessage
                ? "rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-100"
                : "rounded-2xl border border-brand-beige/12 bg-brand-ivory/5 px-4 py-3 text-sm leading-6 text-brand-ivory/72"
            }
          >
            {errorMessage ?? "Acesso protegido. Apenas usuários autorizados podem entrar."}
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-brand-ivory/56">
              {brand.name} - {brand.subtitle}
            </p>
            <SubmitButton
              size="lg"
              className="w-full cursor-pointer sm:w-auto"
              pendingLabel="Entrando..."
            >
              Entrar
              <ArrowRight className="size-4" />
            </SubmitButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
