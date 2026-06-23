import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { publicNavigation } from "@/lib/navigation";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-brand-beige/10 bg-brand-ink/72 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link
          href="/"
          aria-label="Luana Modotte Assessoria Imobiliaria"
          className="inline-flex w-fit items-center justify-center rounded-2xl p-0.5 transition hover:bg-brand-ivory/6"
        >
          <img
            src="/brand/lm-monogram.svg"
            alt=""
            aria-hidden="true"
            className="h-11 w-11 object-contain sm:h-12 sm:w-12"
          />
        </Link>

        <nav className="flex flex-wrap items-center gap-2 text-sm text-brand-ivory/78 lg:justify-center">
          {publicNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 transition hover:bg-brand-ivory/8 hover:text-brand-ivory"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/quero-vender" className={buttonVariants({ size: "sm" })}>
            Quero vender
          </Link>
        </div>
      </div>
    </header>
  );
}
