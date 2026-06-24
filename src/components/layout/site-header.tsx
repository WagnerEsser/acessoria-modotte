"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { publicNavigation } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-brand-beige/10 bg-brand-ink/88 backdrop-blur-2xl">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            aria-label="Luana Modotte Assessoria Imobiliária"
            className="inline-flex w-fit items-center justify-center rounded-2xl p-0.5 transition hover:bg-brand-ivory/6"
          >
            <img
              src="/brand/lm-monogram.svg"
              alt=""
              aria-hidden="true"
              className="h-11 w-11 object-contain sm:h-12 sm:w-12"
            />
          </Link>

          <nav className="hidden items-center gap-2 text-sm text-brand-ivory/78 lg:flex lg:justify-center">
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

          <div className="hidden lg:flex lg:items-center lg:gap-3">
            <Link href="/quero-vender" className={buttonVariants({ size: "sm" })}>
              Quero vender
            </Link>
          </div>

          <button
            type="button"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "lg:hidden"
            )}
            aria-expanded={mobileMenuOpen}
            aria-controls="site-mobile-menu"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            Menu
          </button>
        </div>

        <div
          id="site-mobile-menu"
          className={cn(
            "lg:hidden",
            mobileMenuOpen ? "mt-4 block" : "pointer-events-none hidden"
          )}
        >
          <div className="rounded-3xl border border-brand-beige/12 bg-brand-ink/96 p-4 shadow-2xl shadow-black/25">
            <nav className="grid gap-2 text-sm text-brand-ivory/80">
              {publicNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl border border-brand-beige/8 bg-brand-ivory/4 px-4 py-3 transition hover:border-brand-gold/25 hover:bg-brand-ivory/8 hover:text-brand-ivory"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-4 grid gap-3 border-t border-brand-beige/10 pt-4">
              <Link href="/quero-vender" className={buttonVariants({ size: "sm" })}>
                Quero vender
              </Link>
              <Link
                href="/contato"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Falar com a assessoria
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
