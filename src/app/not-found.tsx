import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";

import { getPublicPages } from "@/lib/public-content";

export default async function NotFound() {
  const pages = await getPublicPages();
  const publishedSlugs = new Set(pages.map((page) => page.slug));

  return (
    <main className="min-h-dvh bg-brand-ink text-brand-ivory">
      <section className="mx-auto flex min-h-dvh max-w-5xl items-center px-4 py-20 text-center sm:px-6">
        <div className="w-full">
          <p className="text-sm uppercase tracking-[0.35em] text-brand-gold">Erro 404</p>
          <h1 className="mt-5 font-display text-5xl leading-tight text-brand-ivory sm:text-7xl">
            Esta página não está disponível
          </h1>
          <p className="mx-auto mt-6 max-w-none text-base leading-7 text-brand-ivory/68 sm:whitespace-nowrap sm:text-lg">
            O endereço pode estar incorreto ou o conteúdo pode ter sido retirado do ar.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-brand-gold px-5 py-3 text-sm font-medium text-brand-navy transition hover:bg-brand-gold/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/70"
            >
              <Home className="size-4" aria-hidden="true" />
              Ir para o início
            </Link>
            {publishedSlugs.has("imoveis") ? (
              <Link
                href="/imoveis"
                className="inline-flex items-center gap-2 rounded-full border border-brand-beige/20 px-5 py-3 text-sm font-medium text-brand-ivory transition hover:border-brand-gold/40 hover:text-brand-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/70"
              >
                Ver imóveis
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            ) : null}
          </div>

        </div>
      </section>
    </main>
  );
}
